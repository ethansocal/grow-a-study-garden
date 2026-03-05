
import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/app/supabase.types";


  //Create a browser-side Supabase client for the flashcard editor.
 
  //Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from `/website/.env.local`.
 
  //We fail fast if either value is missing so issues are obvious during development.
 
export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        // Fail fast with a clear message instead of silently using a placeholder key.
        throw new Error(
            "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and " +
                "NEXT_PUBLIC_SUPABASE_ANON_KEY in /website/.env.local, then restart the dev server.",
        );
    }

    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

  
