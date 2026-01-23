import { useState } from "react";
import { ChevronLeft, ChevronRight, HelpCircle, CheckCircle } from "lucide-react";

const SAMPLE_QUESTIONS = [
    {
        id: 1,
        question: "How are you feeling right now?",
        options: ["Energized", "Calm", "Tired", "Anxious"],
        color: "bg-blue-50 border-blue-200 text-blue-700"
    },
    {
        id: 2,
        question: "What is your main focus for today?",
        options: ["Work/Study", "Self-care", "Socializing", "Rest"],
        color: "bg-purple-50 border-purple-200 text-purple-700"
    },
    {
        id: 3,
        question: "Have you hydrated well today?",
        options: ["Yes, plenty", "A roughly reasonable amount", "Not enough", "I forgot!"],
        color: "bg-cyan-50 border-cyan-200 text-cyan-700"
    },
    {
        id: 4,
        question: "How was your sleep quality last night?",
        options: ["Deep & Restful", "Okay", "Interrupted", "Poor"],
        color: "bg-indigo-50 border-indigo-200 text-indigo-700"
    }
];

export default function ActivitiesPage() {
    const [answers, setAnswers] = useState({});
    const [activeQuestion, setActiveQuestion] = useState(0);

    const handleSelect = (questionId, option) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: option
        }));

        // Auto scroll to next after short delay
        if (activeQuestion < SAMPLE_QUESTIONS.length - 1) {
            setTimeout(() => {
                document.getElementById(`question-${activeQuestion + 1}`)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
                setActiveQuestion(prev => prev + 1);
            }, 500);
        }
    };

    return (
        <div className="p-4 h-[calc(100vh-180px)] flex flex-col justify-center gap-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-orange-100 rounded-2xl text-orange-600">
                    <HelpCircle size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Daily Reflection</h2>
                    <p className="text-sm text-gray-500">Take a moment to check in with yourself</p>
                </div>
            </div>

            {/* Questions Carousel Container */}
            <div className="relative w-full">
                <div
                    className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 hide-scrollbar px-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {SAMPLE_QUESTIONS.map((q, index) => (
                        <div
                            id={`question-${index}`}
                            key={q.id}
                            className="snap-center shrink-0 w-full sm:w-[350px]"
                        >
                            <div className={`h-full rounded-3xl p-6 shadow-sm border-2 ${q.color} transition-all duration-300 bg-white`}>
                                <div className="mb-6">
                                    <span className="text-xs font-bold uppercase tracking-wider opacity-60">Question {index + 1}/{SAMPLE_QUESTIONS.length}</span>
                                    <h3 className="text-xl font-bold mt-2 leading-tight text-gray-800">
                                        {q.question}
                                    </h3>
                                </div>

                                <div className="space-y-3">
                                    {q.options.map((option) => {
                                        const isSelected = answers[q.id] === option;
                                        return (
                                            <button
                                                key={option}
                                                onClick={() => handleSelect(q.id, option)}
                                                className={`w-full p-4 rounded-xl text-left text-sm font-semibold transition-all duration-200 border-2 flex justify-between items-center
                                                    ${isSelected
                                                        ? 'bg-gray-800 border-gray-800 text-white shadow-lg transform scale-[1.02]'
                                                        : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {option}
                                                {isSelected && <CheckCircle size={18} className="text-green-400" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex justify-center gap-2">
                {SAMPLE_QUESTIONS.map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-2 rounded-full transition-all duration-300 ${idx === activeQuestion ? 'w-8 bg-gray-800' : 'w-2 bg-gray-300'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
