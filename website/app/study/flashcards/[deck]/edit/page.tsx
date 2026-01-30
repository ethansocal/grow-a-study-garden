import Image from "next/image";

import Link from "next/link";
import Flashcards from "@/app/images/flashcards.png";

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
        <div
            className="flex min-h-screen bg-emerald-800"
            style={{ imageRendering: "pixelated" }}
        >
            <Suspense fallback={<div>Loading...</div>}>
                <FlashcardEditorFetcher params={params} />
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
