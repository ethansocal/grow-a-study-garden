"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createDeck(formData: FormData) {
    const title = formData.get("title") as string;

    console.log("Creating deck with title:", title);

    const supabase = await createClient();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
        throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
        .from("flashcard_decks")
        .insert([
            {
                title,
                user_id: user.id,
            },
        ])
        .select("id");
    if (error) {
        throw error;
    }
    return redirect(`/study/flashcards/${data[0].id}/edit`);
}

function parseCsv(text: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = "";
    let inQuotes = false;

    const normalized = text.replace(/^\uFEFF/, "");

    for (let i = 0; i < normalized.length; i++) {
        const char = normalized[i];
        const next = normalized[i + 1];

        if (char === '"') {
            if (inQuotes && next === '"') {
                field += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === "," && !inQuotes) {
            row.push(field.trim());
            field = "";
            continue;
        }

        if ((char === "\n" || char === "\r") && !inQuotes) {
            if (char === "\r" && next === "\n") {
                i++;
            }

            row.push(field.trim());
            field = "";

            if (row.some((cell) => cell.length > 0)) {
                rows.push(row);
            }
            row = [];
            continue;
        }

        field += char;
    }

    row.push(field.trim());
    if (row.some((cell) => cell.length > 0)) {
        rows.push(row);
    }

    return rows;
}

function hasHeader(row: string[]) {
    const left = (row[0] ?? "").toLowerCase();
    const right = (row[1] ?? "").toLowerCase();
    const frontHeaders = ["front", "term", "question", "prompt"];
    const backHeaders = ["back", "definition", "answer", "response"];

    return (
        frontHeaders.some((value) => left.includes(value)) &&
        backHeaders.some((value) => right.includes(value))
    );
}

export async function importDeckFromCsv(formData: FormData) {
    const title = (formData.get("title") as string)?.trim();
    const csvFile = formData.get("csvFile");

    if (!(csvFile instanceof File)) {
        throw new Error("Please upload a CSV file.");
    }

    const raw = await csvFile.text();
    const rows = parseCsv(raw);

    if (rows.length === 0) {
        throw new Error("CSV file is empty.");
    }

    const startIndex = hasHeader(rows[0]) ? 1 : 0;
    const cards = rows
        .slice(startIndex)
        .map((columns) => ({
            front_content: (columns[0] ?? "").trim(),
            back_content: (columns[1] ?? "").trim(),
        }))
        .filter((card) => card.front_content.length > 0 || card.back_content.length > 0);

    if (cards.length === 0) {
        throw new Error(
            "No cards found. Make sure the first 2 columns are front and back content.",
        );
    }

    const deckTitle = title || csvFile.name.replace(/\.csv$/i, "") || "Imported Deck";
    const supabase = await createClient();
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) {
        throw new Error("User not authenticated");
    }

    const { data: deckData, error: deckError } = await supabase
        .from("flashcard_decks")
        .insert([
            {
                title: deckTitle,
                user_id: user.id,
            },
        ])
        .select("id")
        .single();

    if (deckError) {
        throw deckError;
    }

    const { error: cardsError } = await supabase.from("flashcard_cards").insert(
        cards.map((card) => ({
            ...card,
            deck_id: deckData.id,
        })),
    );

    if (cardsError) {
        throw cardsError;
    }

    redirect(`/study/flashcards/${deckData.id}/edit`);
}
