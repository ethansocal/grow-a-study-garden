"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import Flashcards from "@/app/images/flashcards.png";
import { problemCategories } from "./[topic]/lib/question";

const topics = problemCategories.map((category) => category.name);

export default function MathScreen() {
    const [selectedTopics, setSelectedTopics] = useState<string[]>(topics);
    const allSelected = selectedTopics.length === topics.length;
    const hasSelection = selectedTopics.length > 0;

    const practiceHref = useMemo(() => {
        if (allSelected) {
            return "/study/math/practice";
        }

        return `/study/math/practice?topics=${encodeURIComponent(
            selectedTopics.join(","),
        )}`;
    }, [allSelected, selectedTopics]);
    const mcqPracticeHref = `${practiceHref}${
        practiceHref.includes("?") ? "&" : "?"
    }mode=mcq`;

    function toggleTopic(topic: string) {
        setSelectedTopics((current) =>
            current.includes(topic)
                ? current.filter((selected) => selected !== topic)
                : [...current, topic],
        );
    }

    function toggleAllTopics() {
        setSelectedTopics(allSelected ? [] : topics);
    }

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
            <div className="bg-gray-400/20 absolute left-4 bottom-4 top-32 right-4 flex flex-col gap-5 text-4xl p-5 rounded-2xl">
                <div className="flex items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={toggleAllTopics}
                        className="bg-gray-400/20 rounded-2xl p-4 hover:bg-gray-400/40 transition-colors flex items-center gap-4 text-left"
                    >
                        <span className="grid size-9 place-items-center border-4 border-black bg-amber-100 text-3xl">
                            {allSelected ? "X" : ""}
                        </span>
                        <span>All Topics</span>
                    </button>
                    <Link
                        href={hasSelection ? practiceHref : "#"}
                        aria-disabled={!hasSelection}
                        className={`px-6 py-4 rounded-xl transition-colors ${
                            hasSelection
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-gray-500 pointer-events-none"
                        }`}
                    >
                        {hasSelection ? "Start Practice" : "Choose Topics"}
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2">
                    {topics.map((topic) => (
                        <button
                            type="button"
                            onClick={() => toggleTopic(topic)}
                            key={topic}
                            className="bg-gray-400/20 rounded-2xl p-4 hover:bg-gray-400/40 transition-colors flex items-center gap-4 text-left"
                        >
                            <span className="grid size-9 shrink-0 place-items-center border-4 border-black bg-amber-100 text-3xl">
                                {selectedTopics.includes(topic) ? "X" : ""}
                            </span>
                            <span>{topic}</span>
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap gap-3 text-2xl">
                    {topics.map((topic) => (
                        <Link
                            href={`/study/math/${encodeURIComponent(topic)}`}
                            key={topic}
                            className="bg-gray-400/20 rounded-xl px-4 py-2 hover:bg-gray-400/40 transition-colors"
                        >
                            Practice {topic}
                        </Link>
                    ))}
                </div>
                <div className="mt-auto flex justify-end">
                    <Link
                        href={hasSelection ? mcqPracticeHref : "#"}
                        aria-disabled={!hasSelection}
                        className={`px-6 py-4 rounded-xl text-3xl transition-colors ${
                            hasSelection
                                ? "bg-emerald-600 hover:bg-emerald-700"
                                : "bg-gray-500 pointer-events-none"
                        }`}
                    >
                        MCQ Practice
                    </Link>
                </div>
            </div>
        </div>
    );
}
