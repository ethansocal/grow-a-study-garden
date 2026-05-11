"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

import {
    importDeckFromQuizletLinkAction,
    type ImportDeckActionState,
} from "../actions";

const initialState: ImportDeckActionState = {
    error: null,
};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" className="text-2xl h-14" disabled={pending}>
            {pending ? "Importing..." : "Import Deck"}
        </Button>
    );
}

export default function QuizletImportForm() {
    const router = useRouter();
    const [state, formAction] = useActionState(
        importDeckFromQuizletLinkAction,
        initialState,
    );

    useEffect(() => {
        if (state.deckId) {
            router.push(`/study/flashcards/${state.deckId}`);
        }
    }, [state.deckId, router]);

    return (
        <form
            action={formAction}
            className="mx-auto max-w-2xl flex flex-col gap-6 text-3xl"
        >
            <div className="space-y-3">
                <h2 className="text-3xl font-semibold text-slate-900">Import flashcards</h2>
                <p className="text-lg text-slate-600">
                    Paste card text below to create a new deck. Supported formats: tab-separated, "term - definition", or alternating lines.
                </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-600 shadow-sm">
                Paste your flashcards below in any supported format: tab-separated, "term - definition", or alternating lines.
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="pastedCards" className="text-2xl text-slate-900">
                    Pasted cards
                </Label>
                <Textarea
                    id="pastedCards"
                    name="pastedCards"
                    placeholder={
                        "term<TAB>definition\n" +
                        "or: term - definition\n" +
                        "or alternating lines:\n" +
                        "term\n" +
                        "definition"
                    }
                    className="min-h-64 text-xl bg-slate-100"
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="title" className="text-2xl">
                    Deck title (optional)
                </Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="My imported deck"
                    className="text-2xl h-14"
                />
                <p className="text-lg text-slate-500">
                    If empty, will use "Imported Deck" as the title.
                </p>
            </div>

            {state.error ? (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-lg">
                        {state.error}
                    </AlertDescription>
                </Alert>
            ) : null}

            <SubmitButton />
        </form>
    );
}
