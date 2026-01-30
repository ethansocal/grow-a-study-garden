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
    const [editedFlashcards, setEditedFlashcards] = useState(
        flashcards.flashcard_cards,
    );

    const handleEdit = async (id: number, front: string, back: string) => {
        setEditedFlashcards((prev) =>
            prev.map((card) =>
                card.id === id
                    ? {
                          ...card,
                          front_content: front,
                          back_content: back,
                      }
                    : card,
            ),
        );

        const { data, error } = await supabase
            .from("flashcard_cards")
            .update({ front_content: front, back_content: back })
            .eq("id", id);
        if (error) console.error("Error updating card:", error);
    };

    const handleDelete = async (id: number) => {
        const { data, error } = await supabase
            .from("flashcard_cards")
            .delete()
            .eq("id", id);
        if (error) console.error("Error deleting card:", error);
        else
            setEditedFlashcards((prev) =>
                prev.filter((card) => card.id !== id),
            );
    };

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 overflow-y-auto p-4">
            Flashcard Editor for deck ID: {deckId} with{" "}
            {flashcards.flashcard_cards.length} cards.
            {editedFlashcards.map((card) => (
                <div key={card.id} className="flex flex-col gap-2">
                    <input
                        type="text"
                        value={card.front_content}
                        onChange={(e) =>
                            handleEdit(
                                card.id,
                                e.target.value,
                                card.back_content,
                            )
                        }
                        className="border p-2"
                    />
                    <input
                        type="text"
                        value={card.back_content}
                        onChange={(e) =>
                            handleEdit(
                                card.id,
                                card.front_content,
                                e.target.value,
                            )
                        }
                        className="border p-2"
                    />
                    <Button onClick={() => handleDelete(card.id)}>
                        Delete
                    </Button>
                </div>
            ))}
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
                        ])
                        .select();
                    if (error) {
                        console.error("Error inserting card:", error);
                    } else if (data && data.length > 0) {
                        setEditedFlashcards((prev) => [...prev, data[0]]);
                    }
                }}
            >
                Add New Card
            </Button>
        </div>
    );
}
