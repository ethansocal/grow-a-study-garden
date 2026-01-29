"use client";

import { useEffect, useState } from "react";

export default function FlashcardEditor({ flashcards }) {
    const [currentCard, setCurrentCard] = useState(0);
    const [showFront, setShowFront] = useState(false);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "ArrowRight") {
                setCurrentCard((prev) =>
                    prev + 1 < flashcards!.cards.length ? prev + 1 : 0
                );
                setShowFront(false);
            } else if (e.key === "ArrowLeft") {
                setCurrentCard((prev) =>
                    prev - 1 >= 0 ? prev - 1 : flashcards!.cards.length - 1
                );
                setShowFront(false);
            } else if (e.key === " ") {
                setShowFront((prev) => !prev);
            }
        }
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <div className="absolute inset-0 flex items-center justify-center gap-5">
            <button
                onClick={() => {
                    setCurrentCard(
                        (prev) =>
                            (prev - 1 + flashcards.cards.length) %
                            flashcards.cards.length
                    );
                }}
                className="text-7xl"
            >
                {"<"}
            </button>
            <div
                style={{ width: "60vw", height: "50vh" }}
                className="bg-gray-400/20 rounded-2xl p-4 text-center flex justify-center items-center text-5xl cursor-pointer"
                onClick={() => setShowFront(!showFront)}
            >
                {showFront
                    ? flashcards.cards[currentCard].front
                    : flashcards.cards[currentCard].back}
            </div>
            <button
                onClick={() =>
                    setCurrentCard(
                        (prev) => (prev + 1) % flashcards.cards.length
                    )
                }
                className="text-7xl"
            >
                {">"}
            </button>
        </div>
    );
}
