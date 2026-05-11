"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function FlashcardsViewer({
    flashcards,
}: {
    flashcards: Array<{ id: number; front_content: string; back_content: string; image_url: string | null }>;
}) {
    const [currentCard, setCurrentCard] = useState(0);
    const [showFront, setShowFront] = useState(true);
    const [cards, setCards] = useState(flashcards);
    const supabase = createClient();

    const handleDeleteCurrentCard = async () => {
        const current = cards[currentCard];
        if (!current) return;

        const { error } = await supabase
            .from("flashcard_cards")
            .delete()
            .eq("id", current.id);

        if (error) {
            console.error("Error deleting card:", error);
            return;
        }

        setCards((prev) => {
            const next = prev.filter((card) => card.id !== current.id);
            if (next.length === 0) {
                return [];
            }
            setCurrentCard((prevIndex) => Math.min(prevIndex, next.length - 1));
            return next;
        });
        setShowFront(true);
    };

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (cards.length === 0) return;

            if (e.key === "ArrowRight") {
                e.preventDefault();
                setCurrentCard((prev) =>
                    prev + 1 < cards.length ? prev + 1 : 0
                );
                setShowFront(true);
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                setCurrentCard((prev) =>
                    prev - 1 >= 0 ? prev - 1 : cards.length - 1
                );
                setShowFront(true);
            } else if (e.key === " " || e.key === "Spacebar") {
                e.preventDefault();
                setShowFront((prev) => !prev);
            }
        }
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [cards.length]);

    if (cards.length === 0) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 text-center text-2xl text-slate-600 shadow-sm">
                    No flashcards in this deck yet.
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="flex w-full items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600 shadow-sm">
                <div>Card {currentCard + 1} of {cards.length}</div>
                <div className="flex items-center gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">← / → navigate</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">space to flip</span>
                </div>
            </div>
            <div className="relative w-full max-w-4xl">
                <button
                    onClick={() => {
                        setCurrentCard(
                            (prev) =>
                                (prev - 1 + cards.length) % cards.length
                        );
                        setShowFront(true);
                    }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-slate-100/90 p-3 text-3xl text-slate-700 shadow ring-1 ring-slate-200 transition hover:bg-slate-100"
                    aria-label="Previous card"
                >
                    ‹
                </button>
                <div
                    style={{ minHeight: "40vh" }}
                    className="mx-auto w-full rounded-[2rem] border border-slate-200 bg-slate-50 p-10 text-center text-4xl text-slate-900 shadow-sm transition hover:shadow-md cursor-pointer sm:text-5xl grid place-items-center"
                    onClick={() => setShowFront(!showFront)}
                >
                    <div className="max-w-3xl leading-tight">
                        {!showFront && cards[currentCard].image_url ? (
                            <img
                                src={cards[currentCard].image_url}
                                alt="Flashcard image"
                                className="mx-auto mb-6 max-h-48 w-full rounded-3xl object-contain"
                            />
                        ) : null}
                        {showFront
                            ? cards[currentCard].front_content
                            : cards[currentCard].back_content}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleDeleteCurrentCard}
                    className="absolute left-1/2 top-full mt-4 -translate-x-1/2 rounded-full border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50"
                >
                    Remove this card
                </button>
                <button
                    onClick={() => {
                        setCurrentCard((prev) => (prev + 1) % cards.length);
                        setShowFront(true);
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-slate-100/90 p-3 text-3xl text-slate-700 shadow ring-1 ring-slate-200 transition hover:bg-slate-100"
                    aria-label="Next card"
                >
                    ›
                </button>
            </div>
        </div>
    );
}
