"use client";

import Image from "next/image";
import Ground from "./images/ground.png";
import Sun from "./images/Sun.png";
import { useEffect, useState } from "react";
import Link from "next/link";

function percentageToText(
    progress: number,
    text1: string,
    text2: string
): string {
    if (progress <= 0.5) {
        console.log(progress);
        return text1.slice(
            0,
            Math.floor(((0.5 - Math.max(progress, 0)) / 0.5) * text1.length)
        );
    } else {
        return text2.slice(
            0,
            Math.floor(((Math.min(progress, 1) - 0.5) / 0.5) * text2.length)
        );
    }
}

export default function Home() {
    const [showingCredits, setShowingCredits] = useState(false);
    const [progress, setProgress] = useState(0);

    const [titleProgress, setTitleProgress] = useState(0);

    useEffect(() => {
        const interval: NodeJS.Timeout = setInterval(() => {
            setTitleProgress((prev) => Math.min(prev + 0.01, 1));
        }, 1 / 60);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval: NodeJS.Timeout = setInterval(() => {
            setProgress((prev) => {
                if (showingCredits) {
                    return Math.min(prev + 0.01, 1);
                } else {
                    return Math.max(prev - 0.01, 0);
                }
            });
        }, 1 / 60);
        return () => clearInterval(interval);
    }, [showingCredits]);

    return (
        <div
            className="flex min-h-screen bg-blue-300"
            style={{ imageRendering: "pixelated" }}
        >
            <div className="frame absolute top-2 left-2 w-[60vw] h-[40vh] text-center flex flex-col items-center justify-center">
                <h1 className="text-[10vh] font-bold">
                    {"Grow a Study Garden".slice(
                        0,
                        Math.floor(
                            (Math.max(titleProgress, 0) / 0.5) *
                                "Grow a Study Garden".length
                        )
                    )}
                </h1>
            </div>
            <img
                className="absolute top-0 right-0 w-[30vw] aspect-square"
                src={Sun.src}
                onClick={() => {
                    setShowingCredits(!showingCredits);
                }}
            />
            <h2 className="text-[2rem] font-bold top-2 right-2 absolute w-[15vw] text-blue-950 text-right whitespace-pre-wrap pointer-events-none">
                {percentageToText(
                    progress,
                    "Made by Team EARLY",
                    "Ethan\nAndrew\nRyan\nLouis\nYves"
                )}
            </h2>

            <div
                className="absolute left-0 right-0 bottom-[20vh] w-full h-40"
                style={{
                    backgroundImage: `url(${Ground.src})`,
                    backgroundRepeat: "repeat",
                    backgroundPosition: "center",
                    backgroundSize: "calc(var(--spacing) * 40)",
                    imageRendering: "pixelated",
                }}
            />
            <div className="absolute left-0 right-0 h-[20vh] w-full bottom-0 bg-[#181425]" />
            <div className="absolute left-0 right-0 bottom-[10vh] flex justify-center gap-20 text-5xl">
                <Link
                    href="/study"
                    className="bg-gray-400/20 rounded-2xl p-4 hover:bg-gray-400/40 transition-colors"
                >
                    Study
                </Link>
                <Link
                    href="/garden"
                    className="bg-gray-400/20 rounded-2xl p-4 hover:bg-gray-400/40 transition-colors"
                >
                    Garden
                </Link>
            </div>
        </div>
    );
}
