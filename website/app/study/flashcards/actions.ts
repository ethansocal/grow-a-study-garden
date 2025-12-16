"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/dist/client/components/navigation";

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
