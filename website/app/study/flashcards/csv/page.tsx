import Image from "next/image";
import Link from "next/link";
import Flashcards from "@/app/images/flashcards.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { importDeckFromCsv } from "../actions";

export default function CsvImportPage() {
    return (
        <div
            className="flex min-h-screen bg-emerald-800"
            style={{ imageRendering: "pixelated" }}
        >
            <div className="absolute top-4 left-4 p-5 text-5xl flex justify-between right-4">
                <div className="flex items-center gap-4">
                    <Image src={Flashcards} alt="" width={50} />
                    <div className="mt-2">Import CSV</div>
                </div>
                <Link href="/study/flashcards" className="mt-2">
                    Back
                </Link>
            </div>

            <div className="bg-gray-400/20 absolute left-4 right-4 top-32 bottom-4 rounded-2xl p-8">
                <form
                    action={importDeckFromCsv}
                    className="mx-auto max-w-2xl flex flex-col gap-6 text-3xl"
                >
                    <div className="text-2xl">
                        Upload a CSV with 2 columns: front,back
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="title" className="text-2xl">
                            Deck title (optional)
                        </Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="My Imported Deck"
                            className="text-2xl h-14"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="csvFile" className="text-2xl">
                            CSV file
                        </Label>
                        <Input
                            id="csvFile"
                            name="csvFile"
                            type="file"
                            accept=".csv,text/csv"
                            required
                            className="text-xl h-14"
                        />
                    </div>

                    <Button type="submit" className="text-2xl h-14">
                        Import Deck
                    </Button>
                </form>
            </div>
        </div>
    );
}
