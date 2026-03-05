"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createDeck(formData: FormData) {
    const rawTitle = formData.get("title");
    const title = typeof rawTitle === "string" ? rawTitle.trim() : "";

    if (!title) {
        throw new Error("Deck title is required");
    }

    const supabase = await createClient();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
        throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
        .from("flashcard_decks")
        .insert({
            title,
            user_id: user.id,
        })
        .select("id")
        .single();

    if (error) throw error;
    if (!data?.id) throw new Error("Failed to create deck");

    return redirect(`/study/flashcards/${data.id}/edit`);
}
