import Image from "next/image";

import Link from "next/link";
import Flashcards from "@/app/images/flashcards.png";

import flashcards from "./flashcards.json";
export const topics = ["Calculus", "Trigonometry"];

export default function MathScreen() {
    return (
        <div
            className="flex min-h-screen bg-amber-900"
            style={{ imageRendering: "pixelated" }}
        >
            <div className="absolute top-4 left-4 p-5 text-5xl flex justify-between right-4">
                <div className="flex items-center gap-4">
                    <Image src={Flashcards} alt="" width={50} />
                    <div className="mt-2">Math</div>
                </div>
                <Link href="/study">Back</Link>
            </div>
            <div className="bg-gray-400/20 absolute left-4 bottom-4 top-32 right-4 flex flex-col gap-4 text-5xl p-5 rounded-2xl">
                {topics.map((topic) => (
                    <Link
                        href={`/study/math/${topic}`}
                        key={topic}
                        className="bg-gray-400/20 rounded-2xl p-4 hover:bg-gray-400/40 transition-colors flex justify-between"
                    >
                        <div>{topic}</div>
                        <div>{">"}</div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
