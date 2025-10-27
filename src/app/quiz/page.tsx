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
  const [score, setScore] = useState(1);
  const [timeLeft, setTimeLeft] = useState(20); // 20s per question
  const [playerName, setPlayerName] = useState("");
  const [quizActive, setQuizActive] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [ripples, setRipples] = useState<Record<string, Ripple[]>>({});

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
  const handleRipple = (
    e: React.MouseEvent<HTMLButtonElement>,
    opt: string
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => ({
      ...prev,
      [opt]: [...(prev[opt] || []), { x, y, id }],
    }));

    // remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => ({
        ...prev,
        [opt]: (prev[opt] || []).filter((r) => r.id !== id),
      }));
    }, 800);
  };

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    if (timeLeft <= 0) handleNext();

    return () => clearInterval(timer);
  }, [timeLeft]);
  const submitResult = async (playerName: string, score: number) => {
    try {
      const res = await fetch(
        "https://babyshowerquiz.onrender.com/api/results",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: playerName,
            score,
            date: new Date().toISOString(),
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        console.log("Result saved:", data);
      } else {
        console.error("Error saving result:", data.error);
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  };

  const handleNext = async () => {
    if (selectedAnswer) {
      if (
        (currentQuestion.type === "short" &&
          selectedAnswer.trim().toLowerCase() ===
            currentQuestion.answer.toLowerCase()) ||
        (currentQuestion.type === "mcq" &&
          selectedAnswer === currentQuestion.answer) ||
        (currentQuestion.type === "image" &&
          selectedAnswer === currentQuestion.answer)
      ) {
        setScore(score + 1);
      }
    }

    setSelectedAnswer("");
    setTimeLeft(20);
    setShowAnswer(false);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // ⏳ Start loader for final submission
      setQuizLoading(true);

      const isActive = await fetchQuizStatus();

      if (isActive) {
        await submitResult(playerName, score);
        setQuizLoading(false);
        router.push("/result");
      } else {
        setQuizLoading(false);
        alert("Quiz is no longer active!");
        router.push("/");
      }
    }
  };

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
                initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 45 * (1 - timeLeft / 20),
                }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </svg>

            {/* Timer Text */}
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

                  let bgClass = "bg-gray-100";
                  if (showAnswer) {
                    if (isSelected && isCorrect) bgClass = "border-green-500";
                    else if (isSelected && !isCorrect)
                      bgClass = "border-[#f1553e]";
                    else if (isCorrect) bgClass = "border-green-500";
                    else bgClass = "border-[#404040]";
                  } else if (isSelected) bgClass = "border-[#404040]";

                  return (
                    <motion.button
                      key={opt}
                      onClick={(e) => {
                        if (!showAnswer) {
                          handleRipple(e, opt);
                          setSelectedAnswer(opt);
                          setShowAnswer(true);
                        }
                      }}
                      disabled={showAnswer}
                      className={`relative overflow-hidden border-[2px] border-[#404040] text-black bg-gray-100 rounded-lg p-3 flex justify-between items-center transition-all ${bgClass}`}
                    >
                      {/* ✅ Ripple only for clicked option */}
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
                              backgroundColor:
                                isSelected && isCorrect
                                  ? "rgba(34,197,94,0.3)" // green ripple
                                  : "rgba(241,85,62,0.3)", // red ripple
                              borderRadius: "50%",
                              pointerEvents: "none",
                              transform: "translate(-50%, -50%)",
                            }}
                          />
                        ))}
                      </AnimatePresence>

                      {/* Option text */}
                      <span>{opt}</span>

                      {/* ✅ Tick / Cross icon */}
                      {showAnswer &&
                        isSelected &&
                        (isCorrect ? (
                          <TiTick className="text-green-600 h-6 w-6" />
                        ) : (
                          <GiCrossMark className="text-[#f1553e] h-5 w-5" />
                        ))}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === "short" && (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={selectedAnswer}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  placeholder="Type your answer here"
                  disabled={showAnswer} // disable once checked
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !showAnswer &&
                      selectedAnswer.trim()
                    ) {
                      setShowAnswer(true);
                    }
                  }}
                  className={`w-full text-black border rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-[#404040]
        ${showAnswer ? "bg-gray-100 cursor-not-allowed" : ""}`}
                />

                <AnimatePresence>
                  {!showAnswer && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      onClick={() =>
                        selectedAnswer.trim() && setShowAnswer(true)
                      }
                      className={`self-start mt-1 px-4 py-1.5 bg-[#404040] text-white text-sm font-medium rounded-md shadow-sm transition-all`}
                    >
                      Check
                    </motion.button>
                  )}
                </AnimatePresence>

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

            {/* Image Options */}
            {currentQuestion.type === "image" && currentQuestion.images && (
              <div className="flex flex-col gap-4">
                {/* Sample Image */}
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
                    let label = "";
                    let labelColor = "";

                    if (showAnswer) {
                      if (isSelected && isCorrect) {
                        borderClass = "border-green-500 border-4";
                        labelColor = "text-green-600";
                      } else if (isSelected && !isCorrect) {
                        borderClass = "border-red-500 border-4";
                        labelColor = "text-red-600";
                      } else if (isCorrect) {
                        borderClass = "border-green-400 border-4";
                        labelColor = "text-green-600";
                      }
                    } else if (isSelected) {
                      borderClass = "border-[#404040] border-4";
                    }

                    return (
                      <motion.div
                        key={img}
                        className="relative"
                        whileHover={{ scale: showAnswer ? 1 : 1.05 }}
                        whileTap={{ scale: showAnswer ? 1 : 0.95 }}
                      >
                        <img
                          src={img}
                          alt="option"
                          onClick={() => {
                            if (!showAnswer) {
                              setSelectedAnswer(img);
                              setShowAnswer(true);
                            }
                          }}
                          className={`h-40 w-40 object-cover rounded-lg cursor-pointer transition-all ${borderClass}`}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Next Button */}

            <motion.button
              onClick={handleNext}
              disabled={!selectedAnswer || quizLoading}
              whileHover={{ scale: quizLoading ? 1 : 1.03 }}
              whileTap={{ scale: quizLoading ? 1 : 0.95 }}
              className={`mt-6 w-full flex justify-center items-center gap-2 
        ${quizLoading ? "bg-gray-600" : "bg-[#404040]"} 
        text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50`}
            >
              {quizLoading ? (
                // 🌀 Framer Motion Loader
                <motion.div
                  className="w-6 h-6 border-4 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
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
