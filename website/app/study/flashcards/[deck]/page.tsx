import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import Flashcards from "@/app/images/flashcards.png";
import { createClient } from "@/lib/supabase/server";

import FlashcardsViewer from "./flashcards-viewer";

async function FlashcardsDeckFetcher({
    params,
}: {
    params: Promise<{ deck: string }>;
}) {
    const { deck: deckId } = await params;

    const supabase = await createClient();
    const userId = (await supabase.auth.getUser()).data.user?.id;

    if (!userId) {
        return <div className="p-6 text-xl">Please sign in to study your deck.</div>;
    }

    const { data, error } = await supabase
        .from("flashcard_decks")
        .select("title, flashcard_cards(front_content, back_content)")
        .eq("user_id", userId)
        .eq("id", deckId)
        .single();

    if (error || !data) {
        return <div className="p-6 text-xl">Could not find this deck.</div>;
    }

    return (
        <>
            <div className="sticky top-0 z-10 bg-emerald-900/70 backdrop-blur px-6 py-4 flex items-center justify-between border-b border-emerald-700">
                <div className="flex items-center gap-4">
                    <Image src={Flashcards} alt="" width={44} />
                    <div>
                        <div className="text-2xl font-semibold leading-tight">Flashcards</div>
                        <div className="text-sm text-emerald-200">{data.title}</div>
                    </div>
                </div>

                <Link
                    href="/study/flashcards"
                    className="px-4 py-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-950/60 transition border border-emerald-700"
                >
                    Back
                </Link>
            </div>

            <Link
                href={`/study/flashcards/${deckId}/edit`}
                className="fixed right-0 top-1/2 -translate-y-1/2 rounded-l-xl border border-r-0 border-emerald-700 bg-emerald-900/90 px-5 py-3 text-sm font-semibold text-emerald-50 shadow-lg transition hover:bg-emerald-800"
            >
                Edit deck
            </Link>

            <div className="relative h-[calc(100vh-81px)]">
                <FlashcardsViewer flashcards={data.flashcard_cards ?? []} />
            </div>
        </>
    );
}

export default async function FlashcardsDeckPage({
    params,
}: {
    params: Promise<{ deck: string }>;
}) {
    return (
        <div
            className="min-h-screen bg-emerald-800 text-emerald-50"
            style={{ imageRendering: "pixelated" }}
        >
            <Suspense fallback={<div className="p-6 text-xl">Loading deck...</div>}>
                <FlashcardsDeckFetcher params={params} />
            </Suspense>
        </div>
    );
}
