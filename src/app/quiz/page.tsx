"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { questions, Question } from "@/data/questions";
import { TiTick } from "react-icons/ti";
import { GiCrossMark } from "react-icons/gi";

type Ripple = {
  x: number;
  y: number;
  id: number;
};

export default function QuizPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [playerName, setPlayerName] = useState("");
  const [quizActive, setQuizActive] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [ripples, setRipples] = useState<Record<string, Ripple[]>>({});
  const [feedbackTimeout, setFeedbackTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const currentQuestion: Question = questions[currentIndex];

  useEffect(() => {
    const storedName = localStorage.getItem("playerName");
    if (storedName) setPlayerName(storedName);
  }, []);

  const fetchQuizStatus = async (): Promise<boolean> => {
    try {
      const res = await fetch(
        "https://babyshowerquiz.onrender.com/api/quiz-status"
      );
      const data = await res.json();
      setQuizActive(data.active);
      return data.active;
    } catch (error) {
      console.error("Failed to fetch quiz status:", error);
      return false;
    }
  };

  // Ripple handler
  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>, opt: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => ({
      ...prev,
      [opt]: [...(prev[opt] || []), { x, y, id }],
    }));

    setTimeout(() => {
      setRipples((prev) => ({
        ...prev,
        [opt]: (prev[opt] || []).filter((r) => r.id !== id),
      }));
    }, 800);
  };

  // Timer
  useEffect(() => {
    if (showAnswer) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    if (timeLeft <= 0) handleNext();
    return () => clearInterval(timer);
  }, [timeLeft, showAnswer]);

  const submitResult = async (playerName: string, score: number) => {
    try {
      await fetch("https://babyshowerquiz.onrender.com/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: playerName,
          score,
          date: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error("Network error:", err);
    }
  };

  const handleNext = async () => {
    setShowAnswer(true);

    const isCorrect =
      (currentQuestion.type === "short" &&
        selectedAnswer.trim().toLowerCase() ===
          currentQuestion.answer.toLowerCase()) ||
      (currentQuestion.type === "mcq" &&
        selectedAnswer === currentQuestion.answer) ||
      (currentQuestion.type === "image" &&
        selectedAnswer === currentQuestion.answer);

    if (isCorrect) setScore((prev) => prev + 1);

    const timeout = setTimeout(async () => {
      setShowAnswer(false);
      setSelectedAnswer("");
      setTimeLeft(20);

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setQuizLoading(true);
        const isActive = await fetchQuizStatus();
        if (isActive) {
          localStorage.setItem("score", score.toString());
          await submitResult(playerName, score);
          router.push("/result");
        } else {
          alert("Quiz is no longer active!");
          router.push("/");
        }
        setQuizLoading(false);
      }
    }, 1500);

    setFeedbackTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (feedbackTimeout) clearTimeout(feedbackTimeout);
    };
  }, [feedbackTimeout]);

  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 p-4"
      style={{
        backgroundImage: 'url("/background/image.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-lg">
        {/* Timer */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative w-26 h-26">
            <svg className="w-26 h-26 transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="#e5e7eb"
                strokeWidth="10"
                fill="transparent"
              />
              <motion.circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="#404040"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 45}
                strokeDashoffset={2 * Math.PI * 45 * (1 - timeLeft / 20)}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 45 * (1 - timeLeft / 20),
                }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-md font-semibold text-gray-700">
                {currentIndex + 1}/{questions.length}
              </span>
              <span className="text-lg font-bold text-gray-900">
                {timeLeft}s
              </span>
            </div>
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-6 mb-4"
          >
            <h2 className="text-xl font-semibold text-[#404040] mb-4">
              Q{currentIndex + 1}: {currentQuestion.question}
            </h2>

            {/* MCQ */}
            {currentQuestion.type === "mcq" && currentQuestion.options && (
              <div className="flex flex-col gap-3">
                {currentQuestion.options.map((opt) => {
                  const isCorrect = opt === currentQuestion.answer;
                  const isSelected = opt === selectedAnswer;

                  let borderClass = "border-[#404040]";
                  if (showAnswer) {
                    if (isCorrect) borderClass = "border-green-500 border-2";
                    else if (isSelected && !isCorrect)
                      borderClass = "border-red-500 border-2";
                  } else if (isSelected) borderClass = "border-[#404040] border-2";

                  return (
                    <motion.button
                      key={opt}
                      onClick={(e) => {
                        if (!showAnswer) {
                          handleRipple(e, opt);
                          setSelectedAnswer(opt);
                        }
                      }}
                      className={`relative overflow-hidden text-black bg-gray-100 rounded-lg p-3 flex justify-between items-center border transition-all ${borderClass}`}
                    >
                      {/* Ripple */}
                      <AnimatePresence>
                        {(ripples[opt] || []).map((r) => (
                          <motion.span
                            key={r.id}
                            initial={{ scale: 0, opacity: 0.4 }}
                            animate={{ scale: 15, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            style={{
                              position: "absolute",
                              top: r.y,
                              left: r.x,
                              width: 40,
                              height: 40,
                              backgroundColor: "rgba(64,64,64,0.2)",
                              borderRadius: "50%",
                              pointerEvents: "none",
                              transform: "translate(-50%, -50%)",
                            }}
                          />
                        ))}
                      </AnimatePresence>

                      <span>{opt}</span>
                      {showAnswer && isSelected && (
                        isCorrect ? (
                          <TiTick className="text-green-600 h-6 w-6" />
                        ) : (
                          <GiCrossMark className="text-[#f1553e] h-5 w-5" />
                        )
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Short Answer */}
            {currentQuestion.type === "short" && (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={selectedAnswer}
                  onChange={(e) => !showAnswer && setSelectedAnswer(e.target.value)}
                  placeholder="Type your answer here"
                  className={`w-full text-black border rounded-lg p-3 ${
                    showAnswer ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />

                {showAnswer && (
                  <div className="text-left">
                    {selectedAnswer.trim().toLowerCase() ===
                    currentQuestion.answer.toLowerCase() ? (
                      <span className="text-green-600 font-semibold">
                        Correct
                      </span>
                    ) : (
                      <div className="flex flex-col items-start">
                        <span className="text-red-600 font-semibold">
                          Incorrect
                        </span>
                        <span className="text-gray-700 text-sm mt-1">
                          Correct Answer:{" "}
                          <span className="font-semibold text-green-700">
                            {currentQuestion.answer}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Image Question */}
            {currentQuestion.type === "image" && currentQuestion.images && (
              <div className="flex flex-col gap-4">
                {currentQuestion.sampleImage && (
                  <div className="text-center mb-2">
                    <img
                      src={currentQuestion.sampleImage}
                      alt="Sample"
                      className="w-40 h-40 object-cover rounded-lg mx-auto border-2 border-[#404040]"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 place-items-center">
                  {currentQuestion.images.map((img) => {
                    const isCorrect = img === currentQuestion.answer;
                    const isSelected = img === selectedAnswer;

                    let borderClass = "border-gray-200";
                    if (showAnswer) {
                      if (isCorrect) borderClass = "border-green-500 border-4";
                      else if (isSelected && !isCorrect)
                        borderClass = "border-red-500 border-4";
                    } else if (isSelected)
                      borderClass = "border-[#404040] border-4";

                    return (
                      <motion.img
                        key={img}
                        src={img}
                        alt="option"
                        onClick={() => !showAnswer && setSelectedAnswer(img)}
                        whileHover={{ scale: showAnswer ? 1 : 1.05 }}
                        whileTap={{ scale: showAnswer ? 1 : 0.95 }}
                        className={`h-40 w-40 object-cover rounded-lg cursor-pointer transition-all ${borderClass}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Next Button */}
            <motion.button
              onClick={handleNext}
              disabled={!selectedAnswer || quizLoading || showAnswer}
              whileHover={{ scale: quizLoading ? 1 : 1.03 }}
              whileTap={{ scale: quizLoading ? 1 : 0.95 }}
              className={`mt-6 w-full flex justify-center items-center gap-2 
              ${quizLoading ? "bg-gray-600" : "bg-[#404040]"} 
              text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50`}
            >
              {quizLoading ? (
                <motion.div
                  className="w-6 h-6 border-4 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
              ) : currentIndex + 1 === questions.length ? (
                "Submit"
              ) : (
                "Next"
              )}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
