import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(express.json());

// Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Supabase (SERVICE ROLE — backend only)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Build JSON schema for structured output
function buildQuizSchema(n) {
  return {
    type: "array",
    minItems: n,
    maxItems: n,
    items: {
      type: "object",
      properties: {
        idx: { type: "integer" },
        qtype: { type: "string" },
        question_text: { type: "string" },
        choices: {
          type: ["array", "null"],
          items: { type: "string" }
        },
        answer: { type: "string" },
        explanation: { type: ["string", "null"] },
        difficulty: {
          type: "string",
          enum: ["easy", "medium", "hard"]
        }
      },
      required: ["idx", "qtype", "question_text", "answer"]
    }
  };
}

app.post("/generate-quiz", async (req, res) => {
  try {
    const {
      subject,
      course,
      chapter,
      section,
      numQuestions = 5,
      additionalInfo = ""
    } = req.body;

    if (!subject || !course) {
      return res.status(400).json({ error: "Missing subject or course" });
    }

    const n = Number(numQuestions);

    const prompt = `
Create a ${n}-question quiz.

Subject: ${subject}
Course: ${course}
Chapter: ${chapter || "N/A"}
Section: ${section || "N/A"}

Additional instructions:
${additionalInfo}

Return ONLY valid JSON matching the provided schema.
    `;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: buildQuizSchema(n),
        temperature: 0.3
      }
    });

    const rawText =
      response?.response?.text ||
      (typeof response.text === "function" ? response.text() : "");

    const quizArray = JSON.parse(rawText);

    // Insert quiz metadata
    const { data: quizRow, error: quizError } = await supabase
      .from("quizzes")
      .insert([
        {
          subject,
          course,
          chapter,
          section,
          num_questions: n,
          additional_info: additionalInfo
        }
      ])
      .select()
      .single();

    if (quizError) throw quizError;

    const quizId = quizRow.id;

    // Insert questions
    const questionsToInsert = quizArray.map(q => ({
      quiz_id: quizId,
      idx: q.idx,
      qtype: q.qtype,
      question_text: q.question_text,
      choices: q.choices,
      answer: q.answer,
      explanation: q.explanation,
      difficulty: q.difficulty
    }));

    const { error: questionError } = await supabase
      .from("questions")
      .insert(questionsToInsert);

    if (questionError) throw questionError;

    res.json({
      quizId,
      questions: questionsToInsert
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Quiz generation failed",
      details: err.message
    });
  }
});

app.listen(process.env.PORT || 8080, () =>
  console.log("Server running")
);