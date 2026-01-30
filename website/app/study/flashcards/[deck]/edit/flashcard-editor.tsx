"use client";

import { Database } from "@/app/supabase.types";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function FlashcardEditor({
    deckId,
    flashcards,
}: {
    deckId: string;
    flashcards: {
        title: string;
        flashcard_cards: {
            back_content: string;
            created_at: string;
            deck_id: string | null;
            front_content: string;
            id: number;
            image_url: string | null;
        }[];
    };
}) {
    const supabase = createClient();
    return (
        <div className="absolute inset-0 flex items-center justify-center gap-5">
            Flashcard Editor for deck ID: {deckId} with{" "}
            {flashcards.flashcard_cards.length} cards.
            <Button
                onClick={async () => {
                    const { data, error } = await supabase
                        .from("flashcard_cards")
                        .insert([
                            {
                                front_content: "New Front",
                                back_content: "New Back",
                                deck_id: deckId,
                            },
                        ]);
                    console.log(
                        "Inserted new card:",
                        data,
                        "with error:",
                        error,
                    );
                }}
            >
                Add New Card
            </Button>
        </div>
    );
}
