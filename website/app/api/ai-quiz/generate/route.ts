import { createClient } from "@/lib/supabase/server";
import { aiQuizRequestSchema, generateQuizWithGemini } from "@/lib/ai-quiz";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const requestBody = await request.json();
        const input = aiQuizRequestSchema.parse(requestBody);

        const supabase = await createClient();
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) {
            return NextResponse.json(
                { error: "User not authenticated." },
                { status: 401 },
            );
        }

        const quiz = await generateQuizWithGemini(input);

        const defaultTitle = `${input.subject} ${input.course} - ${input.chapter}/${input.section} Quiz`;
        const deckTitle = quiz.title?.trim() || defaultTitle;

        const { data: deckRows, error: deckError } = await supabase
            .from("flashcard_decks")
            .insert([
                {
                    title: deckTitle,
                    user_id: user.id,
                },
            ])
            .select("id")
            .limit(1);

        if (deckError || !deckRows || deckRows.length === 0) {
            throw new Error(deckError?.message || "Failed to create quiz deck.");
        }

        const deckId = deckRows[0].id;
        const cards = quiz.questions.map((question) => {
            const optionLines =
                question.options && question.options.length > 0
                    ? `\n\nOptions:\n${question.options
                          .map((option, index) => `${index + 1}. ${option}`)
                          .join("\n")}`
                    : "";

            const typeLine = question.type ? `[${question.type}] ` : "";

            return {
                deck_id: deckId,
                front_content: `${typeLine}${question.question}${optionLines}`,
                back_content: question.explanation
                    ? `${question.answer}\n\nExplanation: ${question.explanation}`
                    : question.answer,
            };
        });

        const { error: cardError } = await supabase
            .from("flashcard_cards")
            .insert(cards);

        if (cardError) {
            await supabase.from("flashcard_decks").delete().eq("id", deckId);
            throw new Error(cardError.message || "Failed to save quiz questions.");
        }

        return NextResponse.json({
            success: true,
            deckId,
            deckTitle,
            questionCount: cards.length,
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Failed to generate quiz.";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
