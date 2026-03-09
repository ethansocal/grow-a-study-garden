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

function getStringValue(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function extractSideText(side: unknown): string {
    if (!side || typeof side !== "object") {
        return "";
    }

    const sideRecord = side as Record<string, unknown>;
    const directText =
        getStringValue(sideRecord.plainText) ||
        getStringValue(sideRecord.label) ||
        getStringValue(sideRecord.text) ||
        getStringValue(sideRecord.word) ||
        getStringValue(sideRecord.definition);

    if (directText) {
        return directText;
    }

    const media = Array.isArray(sideRecord.media) ? sideRecord.media : [];
    for (const item of media) {
        if (!item || typeof item !== "object") {
            continue;
        }
        const mediaRecord = item as Record<string, unknown>;
        const mediaText =
            getStringValue(mediaRecord.plainText) ||
            getStringValue(mediaRecord.text) ||
            getStringValue(mediaRecord.label);

        if (mediaText) {
            return mediaText;
        }
    }

    return "";
}

function extractCardsFromUnknownJson(jsonValue: unknown) {
    const cards: Array<{ front_content: string; back_content: string }> = [];
    const seen = new Set<object>();

    const walk = (value: unknown) => {
        if (!value || typeof value !== "object") {
            return;
        }
        if (seen.has(value as object)) {
            return;
        }
        seen.add(value as object);

        if (Array.isArray(value)) {
            value.forEach(walk);
            return;
        }

        const record = value as Record<string, unknown>;
        const fromTermDef = {
            front_content:
                getStringValue(record.term) || getStringValue(record.word),
            back_content: getStringValue(record.definition),
        };
        if (fromTermDef.front_content && fromTermDef.back_content) {
            cards.push(fromTermDef);
        }

        const fromFrontBack = {
            front_content: getStringValue(record.front),
            back_content: getStringValue(record.back),
        };
        if (fromFrontBack.front_content && fromFrontBack.back_content) {
            cards.push(fromFrontBack);
        }

        if (Array.isArray(record.cardSides) && record.cardSides.length >= 2) {
            const front = extractSideText(record.cardSides[0]);
            const back = extractSideText(record.cardSides[1]);
            if (front && back) {
                cards.push({ front_content: front, back_content: back });
            }
        }

        Object.values(record).forEach(walk);
    };

    walk(jsonValue);

    const deduped = new Map<string, { front_content: string; back_content: string }>();
    for (const card of cards) {
        const key = `${card.front_content}|||${card.back_content}`;
        deduped.set(key, card);
    }
    return Array.from(deduped.values());
}

function normalizeQuizletUrl(input: string) {
    const withProtocol = /^https?:\/\//i.test(input)
        ? input
        : `https://${input}`;
    const url = new URL(withProtocol);

    if (!/(\.|^)quizlet\.com$/i.test(url.hostname)) {
        throw new Error("Please provide a valid Quizlet URL.");
    }

    const idMatch = url.pathname.match(/\/(\d+)(?:\/|$)/);
    if (!idMatch) {
        throw new Error("Could not find a Quizlet set ID in that URL.");
    }

    return {
        setId: idMatch[1],
        canonicalUrl: `https://quizlet.com/${idMatch[1]}/flash-cards/`,
    };
}

export async function importDeckFromQuizletLink(formData: FormData) {
    const quizletUrlInput = (formData.get("quizletUrl") as string)?.trim();
    const titleInput = (formData.get("title") as string)?.trim();

    if (!quizletUrlInput) {
        throw new Error("Please paste a Quizlet link.");
    }

    const { setId, canonicalUrl } = normalizeQuizletUrl(quizletUrlInput);

    const response = await fetch(canonicalUrl, {
        headers: {
            "user-agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36",
            accept: "text/html,application/xhtml+xml",
        },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Could not access this Quizlet set.");
    }

    const html = await response.text();
    const parsedJsonBlocks: unknown[] = [];
    const scriptJsonRegex =
        /<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi;

    let scriptMatch: RegExpExecArray | null = null;
    while ((scriptMatch = scriptJsonRegex.exec(html)) !== null) {
        const scriptContent = scriptMatch[1]?.trim();
        if (!scriptContent) {
            continue;
        }
        try {
            parsedJsonBlocks.push(JSON.parse(scriptContent));
        } catch {
            // Ignore invalid JSON blocks.
        }
    }

    const initialStateRegex = /window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/g;
    let initialStateMatch: RegExpExecArray | null = null;
    while ((initialStateMatch = initialStateRegex.exec(html)) !== null) {
        try {
            parsedJsonBlocks.push(JSON.parse(initialStateMatch[1]));
        } catch {
            // Ignore invalid JSON blocks.
        }
    }

    let cards: Array<{ front_content: string; back_content: string }> = [];
    for (const jsonBlock of parsedJsonBlocks) {
        const extracted = extractCardsFromUnknownJson(jsonBlock);
        if (extracted.length > cards.length) {
            cards = extracted;
        }
    }

    if (cards.length === 0) {
        throw new Error(
            "Could not parse flashcards from this Quizlet link. Try a public set.",
        );
    }

    const supabase = await createClient();
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) {
        throw new Error("User not authenticated");
    }

    const deckTitle = titleInput || `Quizlet Set ${setId}`;

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
