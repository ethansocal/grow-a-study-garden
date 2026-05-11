"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

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
    const [uploading, setUploading] = useState<Record<number, boolean>>({});

    const handleUploadImage = async (id: number, file: File) => {
        setUploading((prev) => ({ ...prev, [id]: true }));

        const path = `flashcard-images/${deckId}/${id}/${crypto.randomUUID()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("flashcard-images")
            .upload(path, file, { upsert: true });

        if (uploadError || !uploadData) {
            console.error("Error uploading image:", uploadError);
            setUploading((prev) => ({ ...prev, [id]: false }));
            return;
        }

        const { data: publicData } = supabase.storage
            .from("flashcard-images")
            .getPublicUrl(path);

        const imageUrl = publicData?.publicUrl ?? "";

        const { error } = await supabase
            .from("flashcard_cards")
            .update({ image_url: imageUrl })
            .eq("id", id);

        if (error) {
            console.error("Error saving uploaded image URL:", error);
            setUploading((prev) => ({ ...prev, [id]: false }));
            return;
        }

        setEditedFlashcards((prev) =>
            prev.map((card) =>
                card.id === id ? { ...card, image_url: imageUrl } : card,
            ),
        );
        setUploading((prev) => ({ ...prev, [id]: false }));
    };

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

        const { error } = await supabase
            .from("flashcard_cards")
            .update({ front_content: front, back_content: back })
            .eq("id", id);
        if (error) console.error("Error updating card:", error);
    };

    const handleDelete = async (id: number) => {
        const { error } = await supabase
            .from("flashcard_cards")
            .delete()
            .eq("id", id);
        if (error) {
            console.error("Error deleting card:", error);
            return;
        }
        setEditedFlashcards((prev) => prev.filter((card) => card.id !== id));
    };

    return (
        <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
            <div className="mx-auto max-w-6xl space-y-6 rounded-[2rem] bg-slate-50 p-8 shadow-[0_35px_60px_-30px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="text-3xl font-semibold">Flashcard editor</div>
                            <div className="text-sm text-slate-500">Deck ID: {deckId} · {editedFlashcards.length} cards</div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Link
                                href={`/study/flashcards/${deckId}`}
                                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
                            >
                                Study deck
                            </Link>
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
                    </div>
                <div className="grid gap-4">
                    {editedFlashcards.map((card) => (
                        <div key={card.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-slate-700">Front</label>
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
                                        className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-base outline-none transition focus:border-slate-500"
                                    />
                                    <label className="block text-sm font-medium text-slate-700">Back</label>
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
                                        className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-base outline-none transition focus:border-slate-500"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-slate-700">Image</label>
                                    {card.image_url ? (
                                        <img
                                            src={card.image_url}
                                            alt="Flashcard image"
                                            className="max-h-40 w-full rounded-2xl border border-slate-300 object-contain"
                                        />
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-100/80 px-4 py-6 text-center text-sm text-slate-500">
                                            No image uploaded yet.
                                        </div>
                                    )}
                                    <label className="inline-flex cursor-pointer items-center rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-200">
                                        <span>{uploading[card.id] ? "Uploading..." : "Upload image"}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="sr-only"
                                            onChange={(event) => {
                                                const file = event.target.files?.[0];
                                                if (file) {
                                                    handleUploadImage(card.id, file);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                                <div className="flex items-start justify-end">
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleDelete(card.id)}
                                    >
                                        Remove card
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
