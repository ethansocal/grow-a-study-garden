import Image from "next/image";

import Link from "next/link";
import Flashcards from "@/app/images/flashcards.png";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Form from "next/form";
import { createDeck } from "./actions";

export default function FlashcardsScreen() {
    return (
        <div
            className="flex min-h-screen bg-emerald-800"
            style={{ imageRendering: "pixelated" }}
        >
            <div className="absolute top-4 left-4 p-5 text-5xl flex justify-between right-4">
                <div className="flex items-center gap-4">
                    <Image src={Flashcards} alt="" width={50} />
                    <div className="mt-2">Flashcards</div>
                </div>
                <Link href="/study">Back</Link>
            </div>
            <div className="bg-gray-400/20 absolute left-4 bottom-4 top-32 right-[40vw] flex flex-col gap-4 text-5xl p-5 rounded-2xl"></div>
            <div className="bg-gray-400/20 absolute left-[65vw] top-32 flex flex-col gap-4 text-5xl p-5 rounded-2xl text-center">
                <Dialog>
                    <Form action={createDeck}>
                        <DialogTrigger asChild>
                            <div className="bg-gray-400/20 rounded-2xl p-4 hover:bg-gray-400/40 transition-colors flex justify-center items-center">
                                Create Deck
                            </div>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-emerald-800">
                            <DialogHeader>
                                <DialogTitle>Create Deck</DialogTitle>
                            </DialogHeader>
                            <Label htmlFor="title">Deck Title</Label>
                            <Input
                                id="title"
                                name="title"
                                defaultValue="My Awesome Deck"
                            />
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit">Create</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Form>
                </Dialog>
                <Link
                    href={`/study/flashcards/quizletImport`}
                    className="bg-gray-400/20 rounded-2xl p-4 hover:bg-gray-400/40 transition-colors flex justify-center items-center"
                >
                    Import from Quizlet
                </Link>
                <Link
                    href={`/study/flashcards/csv`}
                    className="bg-gray-400/20 rounded-2xl p-4 hover:bg-gray-400/40 transition-colors flex justify-center items-center"
                >
                    Import from CSV
                </Link>
            </div>
        </div>
    );
}
