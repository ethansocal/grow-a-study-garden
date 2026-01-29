import Image from "next/image";

import Link from "next/link";
import Flashcards from "@/app/images/flashcards.png";
import Math from "@/app/images/math.png";
import AIQuiz from "@/app/images/AI.png";

export default function StudyScreen() {
    return (
        <div
            className="flex min-h-screen bg-teal-800"
            style={{ imageRendering: "pixelated" }}
        >
            <div className="absolute top-4 left-4 p-5 text-5xl flex justify-between right-4">
                <div className="flex gap-4 items-center">
                    <Image src={Flashcards} alt="" width={50} />
                    <div className="mt-2">Study</div>
                </div>
                <Link href="/" className="mt-2">
                    Back
                </Link>
            </div>

            <div className="absolute left-0 right-0 flex justify-center top-32 bottom-32 items-center gap-20 text-5xl">
                <Link
                    href="/study/flashcards"
                    className="bg-gray-400/20 rounded-2xl p-4 hover:bg-gray-400/40 transition-colors text-center flex flex-col items-center"
                >
                    <Image src={Flashcards} alt="" height={150} />
                    Flashcards
                </Link>
                <Link
                    href="/study/math"
                    className="bg-gray-400/20 rounded-2xl p-4 hover:bg-gray-400/40 transition-colors text-center flex flex-col items-center gap-2"
                >
                    <Image src={Math} alt="" height={175} />
                    Math
                </Link>
                <Link
                    href="/study/ai-quiz"
                    className="bg-gray-400/20 rounded-2xl p-4 hover:bg-gray-400/40 transition-colors text-center flex flex-col items-center gap-2"
                >
                    <Image src={AIQuiz} alt="" height={175} />
                    AI Quiz
                </Link>
            </div>
        </div>
    );
}
