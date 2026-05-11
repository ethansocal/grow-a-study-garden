
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import FlashcardEditor from "./flashcard-editor";


async function FlashcardEditorFetcher({
    params,
}: {
    params: Promise<{ deck: string }>;
}) {
    const { deck: deckId } = await params;

    const supabase = await createClient();

    const { data, error } = await supabase
        .from("flashcard_decks")
        .select("title, flashcard_cards(*)")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id!)
        .eq("id", deckId)
        .limit(1);

    console.log("Fetched deck data:", data, "with error:", error);
    if (data === null || data.length === 0) {
        return <div>404 could not find your deck</div>;
    }

    return <FlashcardEditor deckId={deckId} flashcards={data[0]} />;
}

export default async function FlashcardsEditorPage({
    params,
}: {
    params: Promise<{ deck: string }>;
}) {
    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="mx-auto w-full max-w-6xl px-4 py-10">
                <Suspense fallback={<div className="text-slate-700">Loading...</div>}>
                    <FlashcardEditorFetcher params={params} />
                </Suspense>
            </div>
        </div>
    );
}
