"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
    const [state, formAction] = useActionState(
        importDeckFromQuizletLinkAction,
        initialState,
    );

    return (
        <form
            action={formAction}
            className="mx-auto max-w-2xl flex flex-col gap-6 text-3xl"
        >
            <div className="text-2xl">
                Paste a public Quizlet set link to import terms.
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="quizletUrl" className="text-2xl">
                    Quizlet URL
                </Label>
                <Input
                    id="quizletUrl"
                    name="quizletUrl"
                    type="url"
                    placeholder="https://quizlet.com/123456789/..."
                    className="text-xl h-14"
                />
            </div>

            <div className="text-xl text-white/80">
                If Quizlet blocks the link import, paste copied card text below instead.
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="pastedCards" className="text-2xl">
                    Pasted cards
                </Label>
                <Textarea
                    id="pastedCards"
                    name="pastedCards"
                    placeholder={
                        "term<TAB>definition\nterm - definition\nor alternating lines:\nterm\ndefinition"
                    }
                    className="min-h-64 text-xl"
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="title" className="text-2xl">
                    Deck title (optional)
                </Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="My Quizlet Deck"
                    className="text-2xl h-14"
                />
            </div>

            {state.error ? (
                <div className="rounded-xl border border-red-500/60 bg-red-950/30 p-4 text-lg text-red-100">
                    {state.error}
                </div>
            ) : null}

            <SubmitButton />
        </form>
    );
}
