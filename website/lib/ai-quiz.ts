import { z } from "zod";

const geminiQuestionSchema = z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
    explanation: z.string().optional(),
    options: z.array(z.string().min(1)).optional(),
    type: z.enum(["multiple_choice", "short_answer", "true_false"]).optional(),
});

const geminiQuizSchema = z.object({
    title: z.string().min(1).optional(),
    questions: z.array(geminiQuestionSchema).min(1),
});

export const aiQuizRequestSchema = z.object({
    subject: z.string().min(1),
    course: z.string().min(1),
    chapter: z.string().min(1),
    section: z.string().min(1),
    questionCount: z.coerce.number().int().min(1).max(50),
    additionalInfo: z.string().optional(),
});

export type AIQuizRequest = z.infer<typeof aiQuizRequestSchema>;

export type ParsedQuizQuestion = z.infer<typeof geminiQuestionSchema>;

export function buildQuizPrompt(input: AIQuizRequest): string {
    const scope = [
        `Subject: ${input.subject}`,
        `Course: ${input.course}`,
        `Chapter: ${input.chapter}`,
        `Section: ${input.section}`,
        `Number of questions: ${input.questionCount}`,
        `Additional requirements: ${input.additionalInfo?.trim() || "None"}`,
    ].join("\n");

    return [
        "Create a high-quality quiz for the learner.",
        "Use the exact scope below.",
        "",
        scope,
        "",
        "Return ONLY valid JSON with this exact structure:",
        "{",
        '  "title": "Quiz title",',
        '  "questions": [',
        "    {",
        '      "question": "Question text",',
        '      "answer": "Correct answer",',
        '      "explanation": "Short explanation (optional)",',
        '      "options": ["A", "B", "C", "D"] (optional),',
        '      "type": "multiple_choice | short_answer | true_false" (optional)',
        "    }",
        "  ]",
        "}",
        "",
        `You must return exactly ${input.questionCount} questions.`,
        "No markdown. No code fences. JSON only.",
    ].join("\n");
}

function extractJson(text: string): string {
    const trimmed = text.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        return trimmed;
    }

    const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)```/i);
    if (fencedMatch?.[1]) {
        return fencedMatch[1].trim();
    }

    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
        return trimmed.slice(firstBrace, lastBrace + 1);
    }

    throw new Error("Gemini response did not include parseable JSON.");
}

export function parseQuizResponse(rawText: string, expectedCount: number) {
    const jsonText = extractJson(rawText);
    const parsed = geminiQuizSchema.parse(JSON.parse(jsonText));

    if (parsed.questions.length !== expectedCount) {
        throw new Error(
            `Gemini returned ${parsed.questions.length} questions; expected ${expectedCount}.`,
        );
    }

    return parsed;
}

export async function generateQuizWithGemini(input: AIQuizRequest) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Missing GEMINI_API_KEY environment variable.");
    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [{ text: buildQuizPrompt(input) }],
                    },
                ],
                generationConfig: {
                    temperature: 0.4,
                    responseMimeType: "application/json",
                },
            }),
        },
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini request failed (${response.status}): ${errorText}`);
    }

    const payload = await response.json();
    const rawText: string | undefined = payload?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
        throw new Error("Gemini response did not include quiz text.");
    }

    return parseQuizResponse(rawText, input.questionCount);
}
