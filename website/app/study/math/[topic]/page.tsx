"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";

import Flashcards from "@/app/images/flashcards.png";
import MathRender from "./lib/MathRender";
import {
    generateCategorizedProblem,
    generateProblem,
    generateProblemFromGenerator,
    problemCategories,
    type Problem,
} from "./lib/question";

type MultipleChoiceProblem = {
    problem: Problem;
    choices: string[];
};

type PracticeRecord = {
    question: string;
    correctAnswer: string;
    selectedAnswer: string;
    isCorrect: boolean;
};

function shuffle<T>(items: T[]) {
    return [...items].sort(() => Math.random() - 0.5);
}

function createMultipleChoiceProblem(activeTopics: string[]): MultipleChoiceProblem {
    const { categoryName, generatorName, problem } =
        generateCategorizedProblem(activeTopics);
    const choices = new Set([problem.answer]);

    for (let i = 0; choices.size < 4 && i < 20; i++) {
        choices.add(
            generateProblemFromGenerator(categoryName, generatorName).answer,
        );
    }

    return {
        problem,
        choices: shuffle([...choices]),
    };
}

export default function FlashcardsScreen({
    params,
    searchParams,
}: {
    params: Promise<{ topic: string }>;
    searchParams: Promise<{ mode?: string; topics?: string }>;
}) {
    const { topic } = use(params);
    const { mode, topics } = use(searchParams);
    const allTopics = problemCategories.map((category) => category.name);
    const decodedTopic = decodeURI(topic);
    const isPracticeMode = decodedTopic.toLowerCase() === "practice";
    const isMcqMode = mode === "mcq";
    const selectedTopics = isPracticeMode
        ? (topics?.split(",") ?? allTopics).filter((selectedTopic) =>
              allTopics.includes(selectedTopic),
          )
        : [decodedTopic].filter((selectedTopic) =>
              allTopics.includes(selectedTopic),
          );
    const activeTopics = selectedTopics.length ? selectedTopics : allTopics;
    const title = isPracticeMode
        ? activeTopics.length === allTopics.length
            ? "All Topics"
            : activeTopics.join(", ")
        : decodedTopic;

    const [showAnswer, setShowAnswer] = useState(false);
    const [problem, setProblem] = useState(() => generateProblem(activeTopics));
    const [multipleChoiceProblem, setMultipleChoiceProblem] = useState(() =>
        createMultipleChoiceProblem(activeTopics),
    );
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [practiceRecords, setPracticeRecords] = useState<PracticeRecord[]>([]);
    const [showReport, setShowReport] = useState(false);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === " ") {
                setShowAnswer((prev) => !prev);
            }
        }
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    if (!isPracticeMode && selectedTopics.length === 0) {
        return <div>404 we do not have this topic</div>;
    }

    function chooseAnswer(answer: string) {
        if (selectedAnswer !== null) {
            return;
        }

        setSelectedAnswer(answer);
        setPracticeRecords((current) => [
            ...current,
            {
                question: multipleChoiceProblem.problem.question,
                correctAnswer: multipleChoiceProblem.problem.answer,
                selectedAnswer: answer,
                isCorrect: answer === multipleChoiceProblem.problem.answer,
            },
        ]);
    }

    function nextMultipleChoiceProblem() {
        setMultipleChoiceProblem(createMultipleChoiceProblem(activeTopics));
        setSelectedAnswer(null);
    }

    if (showReport) {
        const correctCount = practiceRecords.filter(
            (record) => record.isCorrect,
        ).length;

        return (
            <div
                className="min-h-screen bg-amber-800 p-8 text-4xl"
                style={{ imageRendering: "pixelated" }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Image src={Flashcards} alt="" width={50} />
                        <div>MCQ Report | {title}</div>
                    </div>
                    <Link href="/study/math">Back</Link>
                </div>
                <div className="mt-10 bg-gray-400/20 rounded-2xl p-6">
                    <div className="mb-6">
                        Score: {correctCount}/{practiceRecords.length}
                    </div>
                    <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-2 text-2xl">
                        {practiceRecords.length === 0 ? (
                            <div>No questions answered yet.</div>
                        ) : (
                            practiceRecords.map((record, index) => (
                                <div
                                    key={`${record.question}-${index}`}
                                    className="rounded-xl bg-gray-400/20 p-4"
                                >
                                    <div>
                                        {record.isCorrect ? "Correct" : "Wrong"}{" "}
                                        | Question {index + 1}
                                    </div>
                                    <div className="mt-3">
                                        <MathRender math={record.question} />
                                    </div>
                                    <div className="mt-3">
                                        Your answer:{" "}
                                        <MathRender math={record.selectedAnswer} />
                                    </div>
                                    {!record.isCorrect && (
                                        <div className="mt-2">
                                            Correct answer:{" "}
                                            <MathRender
                                                math={record.correctAnswer}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
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
                    onClick={() => !isMcqMode && setShowAnswer(!showAnswer)}
                >
                    <div>
                        <MathRender
                            math={
                                isMcqMode
                                    ? multipleChoiceProblem.problem.question
                                    : problem.question
                            }
                        />
                    </div>
                    <div className={isMcqMode ? "hidden" : "text-primary"}>
                        <div className={showAnswer ? "" : "hidden"}>
                            <hr className="my-4"></hr>
                            <MathRender math={problem.answer} />
                        </div>
                    </div>
                </div>
                {isMcqMode && (
                    <div className="grid w-[60vw] grid-cols-2 gap-3 text-3xl">
                        {multipleChoiceProblem.choices.map((choice) => {
                            const isSelected = selectedAnswer === choice;
                            const isCorrect =
                                choice === multipleChoiceProblem.problem.answer;

                            return (
                                <button
                                    type="button"
                                    key={choice}
                                    onClick={() => chooseAnswer(choice)}
                                    className={`rounded-xl p-4 transition-colors ${
                                        selectedAnswer === null
                                            ? "bg-gray-400/20 hover:bg-gray-400/40"
                                            : isCorrect
                                              ? "bg-emerald-600"
                                              : isSelected
                                                ? "bg-red-700"
                                                : "bg-gray-400/20"
                                    }`}
                                >
                                    <MathRender math={choice} />
                                </button>
                            );
                        })}
                    </div>
                )}
                <button
                    className="text-4xl bg-blue-600 px-6 py-2 rounded-xl hover:bg-blue-700"
                    onClick={() => {
                        if (isMcqMode) {
                            nextMultipleChoiceProblem();
                        } else {
                            setProblem(generateProblem(activeTopics));
                            setShowAnswer(false);
                        }
                    }}
                >
                    {isMcqMode ? "Next Question" : "New Problem"}
                </button>
            </div>
            {isMcqMode && (
                <button
                    type="button"
                    onClick={() => setShowReport(true)}
                    className="absolute bottom-4 right-4 rounded-xl bg-red-700 px-6 py-3 text-3xl hover:bg-red-800"
                >
                    End practice
                </button>
            )}
            <div className="absolute top-4 left-4 p-5 text-5xl flex justify-between right-4">
                <div className="flex items-center gap-4">
                    <Image src={Flashcards} alt="" width={50} />
                    <div className="mt-2">Math | {title}</div>
                </div>
                <Link href="/study/math" className="mt-2">
                    Back
                </Link>
            </div>
        </div>
    );
}
