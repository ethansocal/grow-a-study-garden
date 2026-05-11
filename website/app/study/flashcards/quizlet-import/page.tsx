import Image from "next/image";
import Link from "next/link";
import Flashcards from "@/app/images/flashcards.png";
import QuizletImportForm from "./quizlet-import-form";

export default function QuizletImportPage() {
    return (
        <div className="min-h-screen bg-slate-100 px-4 py-10">
            <div className="mx-auto max-w-3xl rounded-[2rem] bg-slate-50 p-8 shadow-[0_35px_60px_-30px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/70">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Image src={Flashcards} alt="" width={50} />
                        <div className="text-3xl font-semibold text-slate-900">Import Quizlet</div>
                    </div>
                    <Link
                        href="/study/flashcards"
                        className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-200"
                    >
                        Back
                    </Link>
                </div>
                <QuizletImportForm />
            </div>
        </div>
    );
}
