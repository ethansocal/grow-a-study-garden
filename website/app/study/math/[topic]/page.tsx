"use client";

import Image from "next/image";

import Link from "next/link";
import Flashcards from "@/app/images/flashcards.png";
import Math from "@/app/images/math.png";
import AIQuiz from "@/app/images/AI.png";

import flashcards from "../flashcards.json";
import { use, useEffect, useState } from "react";
import { topics } from "../page";
import MathRender from "./lib/MathRender";
import { generateProblem } from "./lib/question";

export default function FlashcardsScreen({
    params,
}: {
    params: Promise<{ topic: string }>;
}) {
    const { topic } = use(params);

    const [showAnswer, setShowAnswer] = useState(false);
    const [problem, setProblem] = useState(generateProblem());

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "ArrowRight") {
            } else if (e.key === " ") {
                setShowAnswer((prev) => !prev);
            }
        }
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    if (topics.includes(decodeURI(topic)) === false) {
        return <div>404 we do not have this topic</div>;
    }

    return (
        <div
            className="flex min-h-screen bg-amber-800"
            style={{ imageRendering: "pixelated" }}
        >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
                <div
                    style={{ width: "60vw", height: "50vh" }}
                    className="bg-gray-400/20 rounded-2xl p-4 text-center flex flex-col justify-center items-center text-5xl cursor-pointer"
                    onClick={() => setShowAnswer(!showAnswer)}
                >
                    <div>
                        <MathRender math={problem.question} />
                    </div>
                    <div className={"text-primary"}>
                        <div className={showAnswer ? "" : "hidden"}>
                            <hr className="my-4"></hr>
                            <MathRender math={problem.answer} />
                        </div>
                    </div>
                </div>
                <button
                    className="text-4xl bg-blue-600 px-6 py-2 rounded-xl hover:bg-blue-700"
                    onClick={() => setProblem(generateProblem())}
                >
                    New Problem
                </button>
            </div>
            <div className="absolute top-4 left-4 p-5 text-5xl flex justify-between right-4">
                <div className="flex items-center gap-4">
                    <Image src={Flashcards} alt="" width={50} />
                    <div className="mt-2">Math | {decodeURI(topic)}</div>
                </div>
                <Link href="/study/math" className="mt-2">
                    Back
                </Link>
            </div>
        </div>
    );
}
