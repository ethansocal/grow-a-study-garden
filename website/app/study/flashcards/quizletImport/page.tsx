import Image from "next/image";
import Link from "next/link";
import Flashcards from "@/app/images/flashcards.png";
import QuizletImportForm from "./quizlet-import-form";

export default function QuizletImportPage() {
    return (
        <div
            className="flex min-h-screen bg-emerald-800"
            style={{ imageRendering: "pixelated" }}
        >
            <div className="absolute top-4 left-4 p-5 text-5xl flex justify-between right-4">
                <div className="flex items-center gap-4">
                    <Image src={Flashcards} alt="" width={50} />
                    <div className="mt-2">Import Quizlet</div>
                </div>
                <Link href="/study/flashcards" className="mt-2">
                    Back
                </Link>
            </div>

            <div className="bg-gray-400/20 absolute left-4 right-4 top-32 bottom-4 rounded-2xl p-8">
                <QuizletImportForm />
            </div>
        </div>
    );
}
