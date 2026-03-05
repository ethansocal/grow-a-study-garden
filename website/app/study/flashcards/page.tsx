import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import Flashcards from "@/app/images/flashcards.png";
import { createClient } from "@/lib/supabase/server";
import { FlashcardEditor } from "./flashcard-editor";

async function FlashcardEditorFetcher({ deckId }: { deckId: string }) {
    const supabase = await createClient();

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
        return (
            <div className="absolute inset-0 flex items-center justify-center text-2xl">
                Please sign in to edit decks.
            </div>
        );
    }

    const { data, error } = await supabase
        .from("flashcard_decks")
        .select("title, flashcard_cards(*)")
        .eq("id", deckId)
        .eq("user_id", user.id)
        .single();

    if (error) {
        return (
            <div className="absolute inset-0 flex items-center justify-center text-2xl">
                Failed to load deck.
            </div>
        );
    }

    if (!data) {
        return (
            <div className="absolute inset-0 flex items-center justify-center text-2xl">
                404 could not find your deck
            </div>
        );
    }

    return <FlashcardEditor deckId={deckId} flashcards={data} />;
}

export default async function FlashcardsEditorPage({
    params,
}: {
    params: { deck: string };
}) {
    return (
        <div
            className="flex min-h-screen bg-emerald-800"
            style={{ imageRendering: "pixelated" }}
        >
            <Suspense fallback={<div>Loading...</div>}>
                <FlashcardEditorFetcher deckId={params.deck} />
            </Suspense>

            <div className="absolute top-4 left-4 p-5 text-5xl flex justify-between right-4">
                <div className="flex items-center gap-4">
                    <Image src={Flashcards} alt="" width={50} />
                    <div className="mt-2">Flashcard Editor</div>
                </div>
                <Link href="/study/flashcards" className="mt-2">
                    Back
                </Link>
            </div>
        </div>
    );
}
