"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type ImportDeckActionState = {
    error: string | null;
    deckId?: string;
};

export async function deleteDeck(formData: FormData) {
    const deckId = formData.get("deckId") as string;
    if (!deckId) {
        throw new Error("Deck ID is required to delete a deck.");
    }

    const supabase = await createClient();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
        throw new Error("User not authenticated");
    }

    const { error: cardsError } = await supabase
        .from("flashcard_cards")
        .delete()
        .eq("deck_id", deckId);
    if (cardsError) {
        throw cardsError;
    }

    const { error: deckError } = await supabase
        .from("flashcard_decks")
        .delete()
        .eq("id", deckId)
        .eq("user_id", user.id);
    if (deckError) {
        throw deckError;
    }

    redirect("/study/flashcards");
}

type FlashcardInsert = {
    front_content: string;
    back_content: string;
};

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

function dedupeCards(cards: FlashcardInsert[]) {
    const deduped = new Map<string, FlashcardInsert>();
    for (const card of cards) {
        const front = card.front_content.trim();
        const back = card.back_content.trim();
        if (!front && !back) {
            continue;
        }
        deduped.set(`${front}|||${back}`, {
            front_content: front,
            back_content: back,
        });
    }
    return Array.from(deduped.values());
}

function parsePastedFlashcards(input: string) {
    const normalized = input.replace(/\r\n/g, "\n").trim();
    if (!normalized) {
        return [];
    }

    const lines = normalized
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    // Try tab-separated format first (most reliable)
    const cardsFromTabs = lines
        .map((line) => {
            const parts = line.split("\t").map((part) => part.trim());
            if (parts.length >= 2) {
                return {
                    front_content: parts[0],
                    back_content: parts.slice(1).join(" "),
                };
            }
            return null;
        })
        .filter((card): card is FlashcardInsert => card !== null);

    if (cardsFromTabs.length > 0) {
        return dedupeCards(cardsFromTabs);
    }

    // Try various delimiter formats
    const delimiters = ["\t", " — ", " - ", " – ", " — ", ": ", " | ", " → ", " -> ", " ⇒ ", " => ", " -", "- "];
    for (const delimiter of delimiters) {
        const cardsFromDelimiter = lines
            .map((line) => {
                if (line.includes(delimiter)) {
                    const [front, ...rest] = line.split(delimiter);
                    const back = rest.join(delimiter).trim();
                    if (front?.trim() && back) {
                        return {
                            front_content: front.trim(),
                            back_content: back,
                        };
                    }
                }
                return null;
            })
            .filter((card): card is FlashcardInsert => card !== null);

        if (cardsFromDelimiter.length > 0) {
            return dedupeCards(cardsFromDelimiter);
        }
    }

    // Try alternating lines format (term, definition, term, definition, etc.)
    const cardsFromPairs: FlashcardInsert[] = [];
    for (let i = 0; i < lines.length; i += 2) {
        const front = lines[i];
        const back = lines[i + 1];
        if (front && back) {
            cardsFromPairs.push({
                front_content: front,
                back_content: back,
            });
        }
    }

    if (cardsFromPairs.length > 0) {
        return dedupeCards(cardsFromPairs);
    }

    // If nothing worked, try to parse each line as a potential card with common patterns
    const fallbackCards = lines
        .map((line) => {
            // Look for patterns like "term (definition)" or "term: definition"
            const parenMatch = line.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
            if (parenMatch) {
                return {
                    front_content: parenMatch[1].trim(),
                    back_content: parenMatch[2].trim(),
                };
            }

            const colonMatch = line.match(/^(.+?):\s*(.+)$/);
            if (colonMatch) {
                return {
                    front_content: colonMatch[1].trim(),
                    back_content: colonMatch[2].trim(),
                };
            }

            return null;
        })
        .filter((card): card is FlashcardInsert => card !== null);

    return dedupeCards(fallbackCards);
}

async function createImportedDeck(title: string, cards: FlashcardInsert[]) {
    // Validate cards
    const validCards = cards.filter((card) => {
        const front = card.front_content.trim();
        const back = card.back_content.trim();
        return front.length > 0 && back.length > 0 && front.length <= 1000 && back.length <= 1000;
    });

    if (validCards.length === 0) {
        throw new Error("No valid flashcards found. Each card must have both front and back content.");
    }

    if (validCards.length !== cards.length) {
        console.warn(`Filtered out ${cards.length - validCards.length} invalid cards`);
    }

    const supabase = await createClient();
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) {
        throw new Error("User not authenticated");
    }

    const { data: deckData, error: deckError } = await supabase
        .from("flashcard_decks")
        .insert([
            {
                title: title.trim() || "Imported Deck",
                user_id: user.id,
            },
        ])
        .select("id")
        .single();

    if (deckError) {
        throw deckError;
    }

    const { error: cardsError } = await supabase.from("flashcard_cards").insert(
        validCards.map((card) => ({
            ...card,
            deck_id: deckData.id,
        })),
    );

    if (cardsError) {
        throw cardsError;
    }

    return deckData.id;
}

function getStringValue(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function decodeHtmlEntities(input: string) {
    return input
        .replace(/&quot;/g, '"')
        .replace(/&#34;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#x27;/gi, "'")
        .replace(/&#x2F;/gi, "/")
        .replace(/&#(\d+);/g, (_, codePoint) =>
            String.fromCodePoint(Number(codePoint)),
        );
}

function decodeEscapedString(input: string) {
    try {
        return JSON.parse(`"${input.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`);
    } catch {
        return input;
    }
}

function normalizeCardText(input: string) {
    return decodeHtmlEntities(decodeEscapedString(input))
        .replace(/\s+/g, " ")
        .trim();
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

function extractCardsFromJsonLd(jsonValue: unknown) {
    const cards: Array<{ front_content: string; back_content: string }> = [];

    const walk = (value: unknown) => {
        if (!value) {
            return;
        }

        if (Array.isArray(value)) {
            value.forEach(walk);
            return;
        }

        if (typeof value !== "object") {
            return;
        }

        const record = value as Record<string, unknown>;
        const front =
            getStringValue(record.name) ||
            getStringValue(record.question) ||
            getStringValue(record.term);
        const back =
            getStringValue(record.text) ||
            getStringValue(record.answer) ||
            getStringValue(record.definition);

        if (front && back) {
            cards.push({
                front_content: normalizeCardText(front),
                back_content: normalizeCardText(back),
            });
        }

        Object.values(record).forEach(walk);
    };

    walk(jsonValue);
    return cards.filter(
        (card) => card.front_content.length > 0 && card.back_content.length > 0,
    );
}

function extractCardsFromHtmlSource(html: string) {
    const cards: Array<{ front_content: string; back_content: string }> = [];
    const seen = new Set<string>();
    const normalizedHtml = decodeHtmlEntities(html);

    const patterns = [
        /"term"\s*:\s*"((?:\\.|[^"\\])*)"\s*,\s*"definition"\s*:\s*"((?:\\.|[^"\\])*)"/g,
        /"word"\s*:\s*"((?:\\.|[^"\\])*)"\s*,\s*"definition"\s*:\s*"((?:\\.|[^"\\])*)"/g,
        /"front"\s*:\s*"((?:\\.|[^"\\])*)"\s*,\s*"back"\s*:\s*"((?:\\.|[^"\\])*)"/g,
        /"name"\s*:\s*"((?:\\.|[^"\\])*)"\s*,\s*"text"\s*:\s*"((?:\\.|[^"\\])*)"/g,
    ];

    for (const pattern of patterns) {
        let match: RegExpExecArray | null = null;
        while ((match = pattern.exec(normalizedHtml)) !== null) {
            const front = normalizeCardText(match[1] ?? "");
            const back = normalizeCardText(match[2] ?? "");

            if (!front || !back) {
                continue;
            }

            const key = `${front}|||${back}`;
            if (seen.has(key)) {
                continue;
            }

            seen.add(key);
            cards.push({ front_content: front, back_content: back });
        }
    }

    return cards;
}

function normalizeQuizletUrl(input: string) {
    const trimmed = input.trim();
    if (!trimmed) {
        throw new Error("Please provide a Quizlet URL.");
    }

    const withProtocol = /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;

    let url: URL;
    try {
        url = new URL(withProtocol);
    } catch {
        throw new Error("Please provide a valid URL.");
    }

    if (!/(\.|^)quizlet\.com$/i.test(url.hostname)) {
        throw new Error("Please provide a valid Quizlet URL.");
    }

    // Extract set ID from various URL formats
    const idMatch = url.pathname.match(/\/(\d+)(?:\/|$)/);
    if (!idMatch) {
        throw new Error("Could not find a Quizlet set ID in that URL. Make sure it's a valid flashcard set URL.");
    }

    const setId = idMatch[1];

    // Try multiple URL variations in order of preference
    return {
        setId,
        candidateUrls: [
            `https://quizlet.com/${setId}`,  // Main set page
            `https://quizlet.com/${setId}/flash-cards/`,  // Flash cards view
            `https://quizlet.com/${setId}/learn/`,  // Learn mode
            url.toString(),  // Original URL last
        ],
    };
}

export async function importDeckFromQuizletLink(formData: FormData) {
    const titleInput = (formData.get("title") as string)?.trim();
    const pastedCardsInput = (formData.get("pastedCards") as string)?.trim();

    if (!pastedCardsInput) {
        throw new Error("Please paste card text below to import a deck.");
    }

    const cards = parsePastedFlashcards(pastedCardsInput);

    if (cards.length === 0) {
        throw new Error(
            "Could not parse any flashcards from the pasted text. Please check the format and try again.",
        );
    }

    if (cards.length > 1000) {
        throw new Error(
            `Too many cards (${cards.length}). Maximum allowed is 1000 cards.`,
        );
    }

    const deckTitle = titleInput || "Imported Deck";
    return await createImportedDeck(deckTitle, cards);
}

export async function importDeckFromQuizletLinkAction(
    _prevState: ImportDeckActionState,
    formData: FormData,
): Promise<ImportDeckActionState> {
    try {
        const deckId = await importDeckFromQuizletLink(formData);
        return { error: null, deckId };
    } catch (error) {
        return {
            error:
                error instanceof Error
                    ? error.message
                    : "Import failed for an unknown reason.",
        };
    }
}
