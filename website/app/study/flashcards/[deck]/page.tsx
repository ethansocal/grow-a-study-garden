"use client";

import Image from "next/image";

import Link from "next/link";
import Flashcards from "@/app/images/flashcards.png";
import Math from "@/app/images/math.png";
import AIQuiz from "@/app/images/AI.png";

import flashcards from "../flashcards.json";
import { use, useEffect, useState } from "react";

export default function FlashcardsDeck({
    params,
}: {
    params: Promise<{ deck: string }>;
}) {
    const { deck } = use(params);

    console.log(deck);
    const actualDeck = flashcards.find((d) => d.name === decodeURI(deck));
    const [currentCard, setCurrentCard] = useState(0);
    const [showFront, setShowFront] = useState(false);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "ArrowRight") {
                setCurrentCard((prev) =>
                    prev + 1 < actualDeck!.cards.length ? prev + 1 : 0
                );
                setShowFront(false);
            } else if (e.key === "ArrowLeft") {
                setCurrentCard((prev) =>
                    prev - 1 >= 0 ? prev - 1 : actualDeck!.cards.length - 1
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

    if (actualDeck === undefined) {
        return <div>404 could not find your deck</div>;
    }

    return (
        <div
            className="flex min-h-screen bg-emerald-800"
            style={{ imageRendering: "pixelated" }}
        >
            <div className="absolute inset-0 flex items-center justify-center gap-5">
                <button
                    onClick={() => {
                        setCurrentCard(
                            (prev) =>
                                (prev - 1 + actualDeck.cards.length) %
                                actualDeck.cards.length
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
                        ? actualDeck.cards[currentCard].front
                        : actualDeck.cards[currentCard].back}
                </div>
                <button
                    onClick={() =>
                        setCurrentCard(
                            (prev) => (prev + 1) % actualDeck.cards.length
                        )
                    }
                    className="text-7xl"
                >
                    {">"}
                </button>
            </div>
            <div className="absolute top-4 left-4 p-5 text-5xl flex justify-between right-4">
                <div className="flex items-center gap-4">
                    <Image src={Flashcards} alt="" width={50} />
                    <div className="mt-2">Flashcards | {decodeURI(deck)}</div>
                </div>
                <Link href="/study/flashcards" className="mt-2">
                    Back
                </Link>
            </div>
        </div>
    );
}
