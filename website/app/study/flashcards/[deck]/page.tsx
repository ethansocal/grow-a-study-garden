import Image from "next/image";

import Link from "next/link";
import Flashcards from "@/app/images/flashcards.png";

import { createClient } from "@/lib/supabase/server";
import FlashcardsViewer from "./flashcards-viewer";
import { Suspense } from "react";

async function FlashcardDeck({
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

    console.log(data);
    console.log(error);

    if (data === null || data.length === 0) {
        return <div>404 could not find your deck</div>;
    }

    return <FlashcardsViewer flashcards={data[0].flashcard_cards} />;
}

export default async function FlashcardsDeckPage({
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
                <FlashcardDeck params={params} />
            </Suspense>
            <div className="absolute top-4 left-4 p-5 text-5xl flex justify-between right-4">
                <div className="flex items-center gap-4">
                    <Image src={Flashcards} alt="" width={50} />
                    <div className="mt-2">Flashcards</div>
                </div>
                <Link href="/study/flashcards" className="mt-2">
                    Back
                </Link>
            </div>
        </div>
    );
}
