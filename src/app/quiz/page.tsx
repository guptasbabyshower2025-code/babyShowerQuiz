"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { questions, Question } from "@/data/questions";

export default function QuizPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(1);
  const [timeLeft, setTimeLeft] = useState(20); // 20s per question
  const [playerName, setPlayerName] = useState("");
  const [quizActive, setQuizActive] = useState(false);
  const [quizLoading, setQuizLoading] = useState(true);

  const currentQuestion: Question = questions[currentIndex];
  useEffect(() => {
    const storedName = localStorage.getItem("playerName");
    if (storedName) setPlayerName(storedName);
  }, []);
  const fetchQuizStatus = async (): Promise<boolean> => {
    try {
      const res = await fetch("https://babyshowerquiz.onrender.com/api/quiz-status");
      const data = await res.json();

      setQuizActive(data.active);

      return data.active;
    } catch (error) {
      console.error("Failed to fetch quiz status:", error);
      return false;
    }
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
    // Check answer
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
        console.log("Score,", score, selectedAnswer, currentQuestion.answer);
        setScore(score + 1);
      }
    }

    setSelectedAnswer("");
    setTimeLeft(20);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const isActive = await fetchQuizStatus();
      if (isActive) {
        submitResult(playerName, score);
        router.push("/result");
      } else {
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
                {currentQuestion.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedAnswer(opt)}
                    className={`border text-black rounded-lg p-3 text-left ${
                      selectedAnswer === opt
                        ? "bg-[#404040] text-white"
                        : "bg-gray-100 hover:bg-pink-100"
                    } transition-all`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === "short" && (
              <input
                type="text"
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                placeholder="Type your answer here"
                className="w-full text-black border border-[#404040] rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-[#404040]"
              />
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

                {/* Options */}
                <div className="grid grid-cols-2 gap-3">
                  {currentQuestion.images.map((img) => (
                    <motion.img
                      key={img}
                      src={img}
                      alt="option"
                      onClick={() => setSelectedAnswer(img)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`border h-40 w-40 aspect-auto rounded-lg cursor-pointer transition-all ${
                        selectedAnswer === img
                          ? "border-[#404040] border-4"
                          : "border-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={!selectedAnswer}
              className="mt-6 w-full bg-[#404040]  text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
            >
              {currentIndex + 1 === questions.length ? "Submit" : "Next"}
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
