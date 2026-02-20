"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function FlashcardsViewer({
    flashcards,
}: {
    flashcards: Array<{ front_content: string; back_content: string }>;
}) {
    const [currentCard, setCurrentCard] = useState(0);
    const [showFront, setShowFront] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "ArrowRight") {
                setCurrentCard((prev) =>
                    prev + 1 < flashcards.length ? prev + 1 : 0,
                );
                setShowFront(true);
            } else if (e.key === "ArrowLeft") {
                setCurrentCard((prev) =>
                    prev - 1 >= 0 ? prev - 1 : flashcards.length - 1,
                );
                setShowFront(true);
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
                onClick={async () => {
                    const existingRecord = (
                        await supabase
                            .from("study_records")
                            .select()
                            .eq(
                                "user_id",
                                (await supabase.auth.getUser())?.data?.user?.id,
                            )
                    ).data?.at(0);
                    const flashcards = existingRecord
                        ? existingRecord.flashcards + 1
                        : 1;
                    await supabase.from("study_records").upsert(
                        {
                            user_id: (await supabase.auth.getUser())?.data?.user
                                ?.id,
                            flashcards: flashcards,
                        },
                        { onConflict: "user_id" },
                    );
                    setCurrentCard(
                        (prev) =>
                            (prev - 1 + flashcards.length) % flashcards.length,
                    );
                    setShowFront(true);
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
                    ? flashcards[currentCard].front_content
                    : flashcards[currentCard].back_content}
            </div>
            <button
                onClick={async () => {
                    const existingRecord = (
                        await supabase
                            .from("study_records")
                            .select()
                            .eq(
                                "user_id",
                                (await supabase.auth.getUser())?.data?.user?.id,
                            )
                    ).data?.at(0);
                    const flashcards = existingRecord
                        ? existingRecord.flashcards + 1
                        : 1;
                    await supabase.from("study_records").upsert(
                        {
                            user_id: (await supabase.auth.getUser())?.data?.user
                                ?.id,
                            flashcards: flashcards,
                        },
                        { onConflict: "user_id" },
                    );
                    setCurrentCard((prev) => (prev + 1) % flashcards.length);
                    setShowFront(true);
                }}
                className="text-7xl"
            >
                {">"}
            </button>
        </div>
    );
}
