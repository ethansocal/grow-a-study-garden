import Image from "next/image";

import Link from "next/link";
import Flashcards from "@/app/images/flashcards.png";

export default async function FlashcardsDeckPage({
    params,
}: {
    params: Promise<{ deck: string }>;
}) {
    // UI-first scaffold (no data yet)
    const deckTitle = "My Deck (placeholder)";
    const cards = [
        { id: "1", term: "Mitochondria", definition: "Powerhouse of the cell." },
        { id: "2", term: "Osmosis", definition: "Movement of water across a membrane." },
        { id: "3", term: "ATP", definition: "Energy currency of the cell." },
    ];

    return (
        <div
            className="min-h-screen bg-emerald-800 text-emerald-50"
            style={{ imageRendering: "pixelated" }}
        >
            {/* Top bar */}
            <div className="sticky top-0 z-10 bg-emerald-900/70 backdrop-blur px-6 py-4 flex items-center justify-between border-b border-emerald-700">
                <div className="flex items-center gap-4">
                    <Image src={Flashcards} alt="" width={44} />
                    <div>
                        <div className="text-2xl font-semibold leading-tight">
                            Flashcards
                        </div>
                        <div className="text-sm text-emerald-200">
                            {deckTitle}
                        </div>
                    </div>
                </div>

                <Link
                    href="/study/flashcards"
                    className="px-4 py-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-950/60 transition border border-emerald-700"
                >
                    Back
                </Link>
            </div>

            {/* Center viewer */}
            <div className="mx-auto max-w-3xl px-6 py-10 flex flex-col items-center gap-8">
                <div className="w-full rounded-2xl border border-emerald-700 bg-emerald-950/40 p-10 shadow-xl text-center">
                    <div className="text-sm text-emerald-300 mb-4">
                        Card 1 of {cards.length}
                    </div>
                    <div className="text-3xl font-semibold mb-6">
                        {cards[0].term}
                    </div>
                    <div className="text-lg text-emerald-200">
                        {cards[0].definition}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        className="px-5 py-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-950/60 transition border border-emerald-700"
                        disabled
                    >
                        Previous
                    </button>
                    <button
                        className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 transition"
                        disabled
                    >
                        Flip
                    </button>
                    <button
                        className="px-5 py-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-950/60 transition border border-emerald-700"
                        disabled
                    >
                        Next
                    </button>
                </div>

                <div className="text-sm text-emerald-300">
                    UI scaffold only. We’ll connect Supabase and state next.
                </div>
            </div>
        </div>
    );
}
