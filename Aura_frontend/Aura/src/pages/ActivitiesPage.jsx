import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, HelpCircle, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";

// Fallback questions in case API fails
const FALLBACK_QUESTIONS = [
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

const COLORS = [
    "bg-blue-50 border-blue-200 text-blue-700",
    "bg-purple-50 border-purple-200 text-purple-700",
    "bg-cyan-50 border-cyan-200 text-cyan-700",
    "bg-indigo-50 border-indigo-200 text-indigo-700",
    "bg-pink-50 border-pink-200 text-pink-700",
    "bg-green-50 border-green-200 text-green-700"
];

export default function ActivitiesPage() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [answers, setAnswers] = useState({});
    const [activeQuestion, setActiveQuestion] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        setLoading(true);
        setError(null);

        try {
            // Get userId from localStorage or profile
            const userId = localStorage.getItem('userId') || 'unknown';

            const response = await axios.get(
                "https://f4f6e1c115bb.ngrok-free.app/analyze_memory",
                {
                    params: { user_id: userId },
                    headers: {
                        "ngrok-skip-browser-warning": "true",
                    },
                }
            );
            console.log(response.data);
            // Parse the response - assuming it returns an array of questions
            // Format: [{ question: "...", options: ["opt1", "opt2", ...] }, ...]
            if (response.data && Array.isArray(response.data)) {
                const formattedQuestions = response.data.map((q, index) => ({
                    id: index + 1,
                    question: q.question || q.text || "Question not available",
                    options: q.options || ["Yes", "No", "Maybe", "Not sure"],
                    color: COLORS[index % COLORS.length]
                }));

                setQuestions(formattedQuestions);
            } else if (response.data && response.data.questions) {
                // Alternative format: { questions: [...] }
                const formattedQuestions = response.data.questions.map((q, index) => ({
                    id: index + 1,
                    question: q.question || q.text || "Question not available",
                    options: q.options || ["Yes", "No", "Maybe", "Not sure"],
                    color: COLORS[index % COLORS.length]
                }));

                setQuestions(formattedQuestions);
            } else {
                // Fallback to default questions
                console.warn("Unexpected API response format, using fallback questions");
                setQuestions(FALLBACK_QUESTIONS);
            }
        } catch (err) {
            console.error("Failed to fetch questions from analyze_memory:", err);
            setError("Unable to load personalized questions. Using default questions.");
            setQuestions(FALLBACK_QUESTIONS);
        } finally {
            setLoading(false);
        }
    };

    const submitAnswers = async () => {
        setSubmitting(true);
        try {
            const userId = localStorage.getItem('userId') || 'unknown';

            // Convert answers object to array format
            const answersArray = questions.map(q => answers[q.id] || "");

            const response = await axios.post(
                "https://f4f6e1c115bb.ngrok-free.app/submit_answers",
                {
                    user_id: userId,
                    answers: answersArray
                },
                {
                    headers: {
                        "ngrok-skip-browser-warning": "true",
                        "Content-Type": "application/json"
                    }
                }
            );

            console.log("Submit response:", response.data);
            setSubmitSuccess(true);

            // Reset and refetch new questions after 2 seconds
            setTimeout(async () => {
                setSubmitSuccess(false);
                setAnswers({});
                setActiveQuestion(0);

                // Refetch questions to get new AI-generated ones
                await fetchQuestions();
            }, 2000);
        } catch (err) {
            console.error("Failed to submit answers:", err);
            alert("Failed to submit answers. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSelect = (questionId, option) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: option
        }));

        // Auto scroll to next after short delay
        if (activeQuestion < questions.length - 1) {
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

    if (loading) {
        return (
            <div className="p-4 h-[calc(100vh-180px)] flex flex-col items-center justify-center gap-4">
                <Loader2 size={48} className="text-blue-600 animate-spin" />
                <p className="text-gray-600 font-medium">Loading your personalized questions...</p>
            </div>
        );
    }

    return (
        <div className="pt-20 p-4 flex flex-col justify-center gap-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-orange-100 rounded-2xl text-orange-600">
                    <HelpCircle size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Daily Reflection</h2>
                    <p className="text-sm text-gray-500">
                        {error ? "Standard questions" : "AI-powered personalized questions"}
                    </p>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl mb-2">
                    <AlertCircle size={18} className="text-yellow-600" />
                    <p className="text-sm text-yellow-700">{error}</p>
                </div>
            )}

            {/* Questions Carousel Container */}
            <div className="relative w-full">
                <div
                    className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 hide-scrollbar px-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {questions.map((q, index) => (
                        <div
                            id={`question-${index}`}
                            key={q.id}
                            className="snap-center shrink-0 w-full sm:w-[350px]"
                        >
                            <div className={`h-full rounded-3xl p-6 shadow-sm border-2 ${q.color} transition-all duration-300 bg-white`}>
                                <div className="mb-6">
                                    <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                                        Question {index + 1}/{questions.length}
                                    </span>
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

            {/* Submit Button - Shows when all questions answered */}
            {Object.keys(answers).length === questions.length && questions.length > 0 && (
                <div className="flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <button
                        onClick={submitAnswers}
                        disabled={submitting || submitSuccess}
                        className={`px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 flex items-center gap-2 shadow-lg
                            ${submitSuccess
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl transform hover:scale-105'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Submitting...
                            </>
                        ) : submitSuccess ? (
                            <>
                                <CheckCircle size={20} />
                                Submitted Successfully!
                            </>
                        ) : (
                            <>
                                Submit Answers
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Progress Indicator */}
            <div className="flex justify-center gap-2">
                {questions.map((_, idx) => (
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
