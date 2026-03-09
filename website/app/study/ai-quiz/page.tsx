"use client";

import { GoogleGenAI } from "@google/genai";
import { useState, useEffect } from "react";
import Link from "next/link";

type Section = string;

type Chapter = {
  name: string;
  sections: Section[];
};

type Course = {
  name: string;
  chapters: Chapter[];
};

type Subject = {
  name: string;
  courses: Course[];
};

const ai = new GoogleGenAI({ apiKey: 'AIzaSyBDpFky2O6XZPhTbJOXT-qbyfJQbFsb8MM', httpOptions: { apiVersion: "v1" } });

export default function AIQuizPage() {
    const [subjects, setSubjects] = useState<Subject[]>([
        {
            name: "Math",
            courses: [
                {
                    name: "Algebra",
                    chapters: [
                        { name: "Chapter 1", sections: ["Section 1", "Section 2"] },
                        { name: "Chapter 2", sections: ["Section 1", "Section 2"] }
                    ]
                },
                {
                    name: "Geometry",
                    chapters: [
                        { name: "Chapter 1", sections: ["Section 1", "Section 2"] }
                    ]
                }
            ]
        },
        {
            name: "Science",
            courses: [
                {
                    name: "Biology",
                    chapters: [
                        { name: "Chapter 1", sections: ["Section 1", "Section 2"] }
                    ]
                },
                {
                    name: "Chemistry",
                    chapters: [
                        { name: "Chapter 1", sections: ["Section 1", "Section 2"] }
                    ]
                }
            ]
        }
    ]);

    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [selectedChapter, setSelectedChapter] = useState<string>("");
    const [selectedSection, setSelectedSection] = useState<string>("");

    const [customSubject, setCustomSubject] = useState("");
    const [customCourse, setCustomCourse] = useState("");
    const [customChapter, setCustomChapter] = useState("");
    const [customSection, setCustomSection] = useState("");
    const [additionalInfo, setAdditionalInfo] = useState("");
    const [numQuestions, setNumQuestions] = useState<number>(10);

    const [isLoading, setIsLoading] = useState(false);
    const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
    const [quizLibrary, setQuizLibrary] = useState<any[]>([]);
    const [quizTitle, setQuizTitle] = useState<string>("AI Quiz");
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
    const [showFeedback, setShowFeedback] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showSummary, setShowSummary] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("aiQuizHierarchy");
        if (saved) {
            setSubjects(JSON.parse(saved));
        }
        const savedLibrary = localStorage.getItem("aiQuizLibrary");
        if (savedLibrary) {
            setQuizLibrary(JSON.parse(savedLibrary));
        }
    }, []);

    const saveSubjects = (newSubjects: Subject[]) => {
        setSubjects(newSubjects);
        localStorage.setItem("aiQuizHierarchy", JSON.stringify(newSubjects));
    };

    const handleSubjectChange = (value: string) => {
        setSelectedSubject(value);
        setSelectedCourse("");
        setSelectedChapter("");
        setSelectedSection("");
        if (value === "Other") {
            setCustomSubject("");
        }
    };

    const handleCourseChange = (value: string) => {
        setSelectedCourse(value);
        setSelectedChapter("");
        setSelectedSection("");
        if (value === "Other") {
            setCustomCourse("");
        }
    };

    const handleChapterChange = (value: string) => {
        setSelectedChapter(value);
        setSelectedSection("");
        if (value === "Other") {
            setCustomChapter("");
        }
    };

    const handleSectionChange = (value: string) => {
        setSelectedSection(value);
        if (value === "Other") {
            setCustomSection("");
        }
    };

    const addCustomSubject = () => {
        if (customSubject && !subjects.find(s => s.name === customSubject)) {
            const newSubjects = [...subjects, { name: customSubject, courses: [] }];
            saveSubjects(newSubjects);
            setSelectedSubject(customSubject);
        }
    };

    const addCustomCourse = () => {
        if (customCourse && selectedSubject) {
            const subject = subjects.find(s => s.name === selectedSubject);
            if (subject && !subject.courses.find(c => c.name === customCourse)) {
                const newCourse: Course = { name: customCourse, chapters: [] };
                const updatedSubjects = subjects.map(s =>
                    s.name === selectedSubject ? { ...s, courses: [...s.courses, newCourse] } : s
                );
                saveSubjects(updatedSubjects);
                setSelectedCourse(customCourse);
            }
        }
    };

    const addCustomChapter = () => {
        if (customChapter && selectedSubject && selectedCourse) {
            const subject = subjects.find(s => s.name === selectedSubject);
            const course = subject?.courses.find(c => c.name === selectedCourse);
            if (course && !course.chapters.find(ch => ch.name === customChapter)) {
                const newChapter: Chapter = { name: customChapter, sections: [] };
                const updatedSubjects = subjects.map(s =>
                    s.name === selectedSubject ? {
                        ...s,
                        courses: s.courses.map(c =>
                            c.name === selectedCourse ? { ...c, chapters: [...c.chapters, newChapter] } : c
                        )
                    } : s
                );
                saveSubjects(updatedSubjects);
                setSelectedChapter(customChapter);
            }
        }
    };

    const addCustomSection = () => {
        if (customSection && selectedSubject && selectedCourse && selectedChapter) {
            const subject = subjects.find(s => s.name === selectedSubject);
            const course = subject?.courses.find(c => c.name === selectedCourse);
            const chapter = course?.chapters.find(ch => ch.name === selectedChapter);
            if (chapter && !chapter.sections.includes(customSection)) {
                const updatedSubjects = subjects.map(s =>
                    s.name === selectedSubject ? {
                        ...s,
                        courses: s.courses.map(c =>
                            c.name === selectedCourse ? {
                                ...c,
                                chapters: c.chapters.map(ch =>
                                    ch.name === selectedChapter ? { ...ch, sections: [...ch.sections, customSection] } : ch
                                )
                            } : c
                        )
                    } : s
                );
                saveSubjects(updatedSubjects);
                setSelectedSection(customSection);
            }
        }
    };

    const handleSubmit = async () => {
        if (selectedSubject === "Other" && customSubject) {
            addCustomSubject();
        }
        if (selectedCourse === "Other" && customCourse) {
            addCustomCourse();
        }
        if (selectedChapter === "Other" && customChapter) {
            addCustomChapter();
        }
        if (selectedSection === "Other" && customSection) {
            addCustomSection();
        }

        const finalSubject = selectedSubject === "Other" ? customSubject : selectedSubject;
        const finalCourse = selectedCourse === "Other" ? customCourse : selectedCourse;
        const finalChapter = selectedChapter === "Other" ? customChapter : selectedChapter;
        const finalSection = selectedSection === "Other" ? customSection : selectedSection;

        // build title string
        setQuizTitle(`${finalSubject}-${finalCourse}-${finalChapter}-${finalSection}`);
        setShowSummary(false);

        setIsLoading(true);
        try {
            // List available models
            const models = await ai.models.list();
            console.log('Available models:', models);

            const prompt = `Generate ${numQuestions} quiz questions for the following content:

Subject: ${finalSubject}
Course: ${finalCourse}
Chapter: ${finalChapter}
Section: ${finalSection}

Additional Info: ${additionalInfo}

Each question should be a JSON object with the following fields:
- difficulty: (easy, medium, hard)
- format: (multiple_choice, true_false, short_answer, etc.)
- question: the question text
- correct_answer: the correct answer
- correct_explanation: explanation for the correct answer
- If format is multiple_choice, include wrong_answers: array of objects, each with "answer" and "explanation"

Return the response as a JSON array of these question objects. Do not include any other text.`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });
            const text = response.text;
            // Extract JSON from possible markdown code block
            const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
            const jsonText = jsonMatch ? jsonMatch[1] : text;
            const questions = JSON.parse(jsonText);
            setGeneratedQuestions(questions);
            // Reset quiz state
            setCurrentQuestionIndex(0);
            setUserAnswers({});
            setShowFeedback(false);
            setSelectedAnswer(null);
            // Save to library
            const updatedLibrary = [...quizLibrary, ...questions];
            setQuizLibrary(updatedLibrary);
            localStorage.setItem("aiQuizLibrary", JSON.stringify(updatedLibrary));
        } catch (error) {
            console.error('Error generating quiz:', error);
            alert('Failed to generate quiz. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerSelect = (answer: string) => {
        setSelectedAnswer(answer);
        setUserAnswers({ ...userAnswers, [currentQuestionIndex]: answer });
        setShowFeedback(true);
        // if this was the last question, show summary
        if (currentQuestionIndex === generatedQuestions.length - 1) {
            setShowSummary(true);
        }
    };

    const nextQuestion = () => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
    };

    const currentSubject = subjects.find(s => s.name === selectedSubject);
    const currentCourse = currentSubject?.courses.find(c => c.name === selectedCourse);
    const currentChapter = currentCourse?.chapters.find(ch => ch.name === selectedChapter);

    return (
        <div
            className="flex min-h-screen bg-teal-800 text-white"
            style={{ imageRendering: "pixelated" }}
        >
            <div className="absolute top-4 left-4 p-5 text-5xl flex justify-between right-4">
                <div className="flex gap-4 items-center">
                    <div className="mt-2">AI Quiz Setup</div>
                </div>
                <Link href="/study" className="mt-2">
                    Back
                </Link>
            </div>

            <div className="flex flex-col items-center justify-center min-h-screen w-full gap-8">
                {isLoading ? (
                    <div className="bg-gray-400/20 rounded-2xl p-8 w-96 text-center">
                        <div className="text-2xl mb-4">Generating Quiz...</div>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                    </div>
                ) : generatedQuestions.length > 0 ? (
                    <div className="bg-gray-400/20 rounded-2xl p-8 w-full max-w-4xl">
<h2 className="text-3xl mb-6 text-center">{quizTitle}</h2>
                                    <p className="mb-4 text-center">Correct: {Object.entries(userAnswers).filter(([i, a]) => generatedQuestions[Number(i)]?.correct_answer === a).length} / {generatedQuestions.length}</p>
                        {showSummary ? (
                            <div>
                                <h3 className="text-2xl mb-4 text-center">Summary</h3>
                                {generatedQuestions.map((q, i) => {
                                    const userAns = userAnswers[i];
                                    const correct = q.correct_answer;
                                    const wrongList = q.wrong_answers || [];
                                    return (
                                        <div key={i} className="mb-6 p-6 bg-white/20 rounded-lg">
                                            <p className="mb-2"><strong>Q{i+1}:</strong> {q.question}</p>
                                            <p className="mb-1"><strong>Your answer:</strong> {userAns || '—'}</p>
                                            <p className="mb-1"><strong>Correct:</strong> {correct}</p>
                                            <p className="mb-2"><strong>Explanation:</strong> {q.correct_explanation}</p>
                                            {wrongList.length > 0 && (
                                                <div className="mt-2">
                                                    <strong>Other choices:</strong>
                                                    <ul className="list-disc list-inside ml-4 mt-1 text-sm text-gray-200">
                                                        {wrongList.map((wa: any, idx: number) => (
                                                            <li key={idx} className="mb-1">
                                                                <span className="font-semibold">{wa.answer}</span>: {wa.explanation}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                <button
                                    onClick={() => {
                                        setGeneratedQuestions([]);
                                        setCurrentQuestionIndex(0);
                                        setUserAnswers({});
                                        setShowFeedback(false);
                                        setSelectedAnswer(null);
                                        setShowSummary(false);
                                    }}
                                    className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Generate Another Quiz
                                </button>
                            </div>
                        ) : (() => {
                            const question = generatedQuestions[currentQuestionIndex];
                            const isAnswered = userAnswers[currentQuestionIndex] !== undefined;
                            const isCorrect = isAnswered && userAnswers[currentQuestionIndex] === question.correct_answer;

                            return (
                                <div className="mb-6">
                                    <h3 className="text-xl mb-4">Question {currentQuestionIndex + 1} of {generatedQuestions.length}</h3>
                                    <p className="text-lg mb-4">{question.question}</p>
                                    
                                    {question.format === 'multiple_choice' && question.wrong_answers ? (
                                        <div className="space-y-2">
                                            {[question.correct_answer, ...question.wrong_answers.map((wa: any) => wa.answer)].sort().map((answer, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleAnswerSelect(answer)}
                                                    disabled={isAnswered}
                                                    className={`block w-full p-3 rounded text-left ${
                                                        isAnswered && answer === question.correct_answer ? 'bg-green-500 text-white' :
                                                        isAnswered && answer === selectedAnswer && answer !== question.correct_answer ? 'bg-red-500 text-white' :
                                                        'bg-white text-black hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {answer}
                                                </button>
                                            ))}
                                        </div>
                                    ) : question.format === 'true_false' ? (
                                        <div className="space-y-2">
                                            {['True', 'False'].map((answer) => (
                                                <button
                                                    key={answer}
                                                    onClick={() => handleAnswerSelect(answer)}
                                                    disabled={isAnswered}
                                                    className={`block w-full p-3 rounded ${
                                                        isAnswered && answer === question.correct_answer ? 'bg-green-500 text-white' :
                                                        isAnswered && answer === selectedAnswer && answer !== question.correct_answer ? 'bg-red-500 text-white' :
                                                        'bg-white text-black hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {answer}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Your answer"
                                                onKeyDown={(e) => e.key === 'Enter' && handleAnswerSelect((e.target as HTMLInputElement).value)}
                                                disabled={isAnswered}
                                                className="w-full p-3 rounded bg-white text-black"
                                            />
                                            <button
                                                onClick={() => handleAnswerSelect((document.querySelector('input') as HTMLInputElement)?.value || '')}
                                                disabled={isAnswered}
                                                className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                            >
                                                Submit Answer
                                            </button>
                                        </div>
                                    )}
                                    
                                    {isAnswered && (
                                        <div className="mt-4 p-4 bg-white/10 rounded">
                                            <p className={`text-lg font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                                {isCorrect ? 'Correct!' : 'Incorrect!'}
                                            </p>
                                            <p className="mt-2">{question.correct_explanation}</p>
                                            {selectedAnswer && selectedAnswer !== question.correct_answer && question.wrong_answers && (
                                                <p className="mt-2 text-red-300">
                                                    {question.wrong_answers.find((wa: any) => wa.answer === selectedAnswer)?.explanation}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    
                                    {isAnswered && currentQuestionIndex < generatedQuestions.length - 1 && (
                                        <button
                                            onClick={nextQuestion}
                                            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                        >
                                            Next Question
                                        </button>
                                    )}
                                    
                                    {currentQuestionIndex === generatedQuestions.length - 1 && isAnswered && (
                                        <div className="mt-4 text-center">
                                            <p className="text-xl">Quiz Complete!</p>
                                            <button
                                                onClick={() => {
                                                    setGeneratedQuestions([]);
                                                    setCurrentQuestionIndex(0);
                                                    setUserAnswers({});
                                                    setShowFeedback(false);
                                                    setSelectedAnswer(null);
                                                }}
                                                className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                            >
                                                Generate Another Quiz
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                ) : (
                    <div className="bg-gray-400/20 rounded-2xl p-8 w-96">
                        <h2 className="text-3xl mb-6 text-center">Select Content for AI Quiz</h2>

                    {/* Subject */}
                    <div className="mb-4">
                        <label className="block mb-2">Subject:</label>
                        <select
                            value={selectedSubject}
                            onChange={(e) => handleSubjectChange(e.target.value)}
                            className="w-full p-2 rounded bg-white text-black"
                        >
                            <option value="">Select Subject</option>
                            {subjects.map((s) => (
                                <option key={s.name} value={s.name}>{s.name}</option>
                            ))}
                            <option value="Other">Other</option>
                        </select>
                        {selectedSubject === "Other" && (
                            <div className="mt-2">
                                <input
                                    type="text"
                                    value={customSubject}
                                    onChange={(e) => setCustomSubject(e.target.value)}
                                    placeholder="Enter subject"
                                    className="w-full p-2 rounded bg-white text-black"
                                />
                            </div>
                        )}
                    </div>

                    {/* Course */}
                    <div className="mb-4">
                        <label className="block mb-2">Course:</label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => handleCourseChange(e.target.value)}
                            className="w-full p-2 rounded bg-white text-black"
                            disabled={!selectedSubject || selectedSubject === "Other" && !customSubject}
                        >
                            <option value="">Select Course</option>
                            {currentSubject?.courses.map((c) => (
                                <option key={c.name} value={c.name}>{c.name}</option>
                            ))}
                            <option value="Other">Other</option>
                        </select>
                        {selectedCourse === "Other" && (
                            <div className="mt-2">
                                <input
                                    type="text"
                                    value={customCourse}
                                    onChange={(e) => setCustomCourse(e.target.value)}
                                    placeholder="Enter course"
                                    className="w-full p-2 rounded bg-white text-black"
                                />
                            </div>
                        )}
                    </div>

                    {/* Chapter */}
                    <div className="mb-4">
                        <label className="block mb-2">Chapter:</label>
                        <select
                            value={selectedChapter}
                            onChange={(e) => handleChapterChange(e.target.value)}
                            className="w-full p-2 rounded bg-white text-black"
                            disabled={!selectedCourse || selectedCourse === "Other" && !customCourse}
                        >
                            <option value="">Select Chapter</option>
                            {currentCourse?.chapters.map((ch) => (
                                <option key={ch.name} value={ch.name}>{ch.name}</option>
                            ))}
                            <option value="Other">Other</option>
                        </select>
                        {selectedChapter === "Other" && (
                            <div className="mt-2">
                                <input
                                    type="text"
                                    value={customChapter}
                                    onChange={(e) => setCustomChapter(e.target.value)}
                                    placeholder="Enter chapter"
                                    className="w-full p-2 rounded bg-white text-black"
                                />
                            </div>
                        )}
                    </div>

                    {/* Section */}
                    <div className="mb-6">
                        <label className="block mb-2">Section:</label>
                        <select
                            value={selectedSection}
                            onChange={(e) => handleSectionChange(e.target.value)}
                            className="w-full p-2 rounded bg-white text-black"
                            disabled={!selectedChapter || selectedChapter === "Other" && !customChapter}
                        >
                            <option value="">Select Section</option>
                            {currentChapter?.sections.map((sec) => (
                                <option key={sec} value={sec}>{sec}</option>
                            ))}
                            <option value="Other">Other</option>
                        </select>
                        {selectedSection === "Other" && (
                            <div className="mt-2">
                                <input
                                    type="text"
                                    value={customSection}
                                    onChange={(e) => setCustomSection(e.target.value)}
                                    placeholder="Enter section"
                                    className="w-full p-2 rounded bg-white text-black"
                                />
                            </div>
                        )}
                    </div>

                    {/* Additional Settings */}
                    <div className="mb-6">
                        <h3 className="text-xl mb-4 text-center">Additional Settings</h3>
                        <div className="mb-4">
                            <label className="block mb-2">Number of Questions:</label>
                            <input
                                type="number"
                                value={numQuestions}
                                onChange={(e) => setNumQuestions(Number(e.target.value))}
                                min="1"
                                max="50"
                                className="w-full p-2 rounded bg-white text-black"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2">Additional Info:</label>
                            <textarea
                                value={additionalInfo}
                                onChange={(e) => setAdditionalInfo(e.target.value)}
                                placeholder="Specify specific topics, quiz format, difficulty, etc."
                                rows={4}
                                className="w-full p-2 rounded bg-white text-black"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        disabled={!selectedSubject || !selectedCourse || !selectedChapter || !selectedSection}
                    >
                        Start Quiz
                    </button>
                </div>
                )}
            </div>
        </div>
    );
}