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
        .select("title, flashcard_cards(id, front_content, back_content, image_url)")
        .eq("user_id", userId)
        .eq("id", deckId)
        .single();

    if (error || !data) {
        return <div className="p-6 text-xl">Could not find this deck.</div>;
    }

    return (
        <>
            <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur px-6 py-4 flex flex-col gap-4 border-b border-slate-200 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Image src={Flashcards} alt="" width={44} />
                    <div>
                        <div className="text-2xl font-semibold text-slate-900">Flashcards</div>
                        <div className="text-sm text-slate-500">{data.title}</div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Link
                        href="/study/flashcards"
                        className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
                    >
                        Back
                    </Link>
                    <Link
                        href={`/study/flashcards/${deckId}/edit`}
                        className="rounded-full border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                        Edit deck
                    </Link>
                </div>
            </div>

            <div className="mx-auto mt-8 max-w-6xl px-4 pb-10">
                <div className="rounded-[2rem] bg-slate-50 p-6 shadow-[0_35px_60px_-30px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70">
                    <FlashcardsViewer flashcards={data.flashcard_cards ?? []} />
                </div>
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
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <Suspense fallback={<div className="p-6 text-xl text-slate-700">Loading deck...</div>}>
                <FlashcardsDeckFetcher params={params} />
            </Suspense>
        </div>
    );
}
