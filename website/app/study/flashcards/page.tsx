import Image from "next/image";

import Link from "next/link";
import Flashcards from "@/app/images/flashcards.png";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createDeck, deleteDeck } from "./actions";

async function FlashcardsList() {
    const supabase = await createClient();

    const { data } = await supabase
        .from("flashcard_decks")
        .select("title, id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id!)
        .order("created_at", { ascending: false });

    return (
        <>
            {data != null && data.length != 0 ? (
                data.map((deck) => (
                    <div
                        key={deck.id}
                        className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100 flex justify-between items-center gap-4"
                    >
                        <Link href={`/study/flashcards/${deck.id}`} className="flex-1">
                            <div className="text-base font-medium text-slate-900">{deck.title}</div>
                        </Link>
                        <div className="flex items-center gap-3 text-lg">
                            <Link
                                href={`/study/flashcards/${deck.id}`}
                                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
                            >
                                Study
                            </Link>
                            <Link
                                href={`/study/flashcards/${deck.id}/edit`}
                                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
                            >
                                Edit
                            </Link>
                            <form action={deleteDeck} className="m-0">
                                <input type="hidden" name="deckId" value={deck.id} />
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    size="sm"
                                    className="px-2 py-1 text-xs"
                                >
                                    Remove
                                </Button>
                            </form>
                        </div>
                    </div>
                ))
            ) : (
                <>No decks found.</>
            )}
        </>
    );
}

export default function FlashcardsScreen() {
    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="mx-auto max-w-7xl px-4 py-10">
                <div className="mb-10 flex flex-col gap-4 rounded-[2rem] bg-slate-50 p-8 shadow-[0_35px_60px_-30px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <Image src={Flashcards} alt="" width={50} />
                            <div>
                                <div className="text-3xl font-semibold">Flashcards</div>
                                <div className="text-sm text-slate-500">Manage, study, and import your decks</div>
                            </div>
                        </div>
                        <Link
                            href="/study"
                            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-200"
                        >
                            Back to Study
                        </Link>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-4 rounded-[2rem] bg-slate-50 p-6 shadow-sm ring-1 ring-slate-200/70">
                        <div className="text-xl font-semibold text-slate-900">Quick actions</div>
                        <Dialog>
                            <DialogTrigger>
                                <button className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left text-slate-900 transition hover:bg-slate-100">
                                    Create new deck
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] bg-slate-50 text-slate-900">
                                <form action={createDeck} className="space-y-5">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl">Create Deck</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Deck title</Label>
                                        <Input id="title" name="title" defaultValue="My Awesome Deck" />
                                    </div>
                                    <DialogFooter className="flex items-center justify-end gap-3">
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button type="submit">Create</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <Link
                            href="/study/flashcards/quizlet-import"
                            className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-slate-900 transition hover:bg-slate-100"
                        >
                            Import from Quizlet
                        </Link>
                        <Link
                            href="/study/flashcards/csv"
                            className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-slate-900 transition hover:bg-slate-100"
                        >
                            Import from CSV
                        </Link>
                    </div>

                    <div className="space-y-4 rounded-[2rem] bg-slate-50 p-6 shadow-sm ring-1 ring-slate-200/70">
                        <div className="text-xl font-semibold text-slate-900">Your decks</div>
                        <FlashcardsList />
                    </div>
                </div>
            </div>
        </div>
    );
}
