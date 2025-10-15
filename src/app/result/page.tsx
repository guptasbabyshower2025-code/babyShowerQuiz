"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Confetti from "react-confetti";

export default function ResultPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [score, setScore] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const totalQuestions = 12;

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    const storedName = localStorage.getItem("playerName") || "Player";
    const storedScore = parseInt(localStorage.getItem("score") || "0", 10);

    setName(storedName);
    setScore(storedScore);
  }, []);

  const handleRestart = () => {
    localStorage.removeItem("score");
    localStorage.removeItem("playerName");
    router.push("/");
  };

  const getMessage = () => {
    const percent = (score / totalQuestions) * 100;
    if (percent === 100) return "Perfect! 🎉 You know your baby stuff!";
    if (percent >= 75) return "Great job! 👏 Almost perfect!";
    if (percent >= 50) return "Nice try! 😊 Keep learning!";
    return "Good effort! 😄 Better luck next time!";
  };

  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-pink-200 p-4"
      style={{
        backgroundImage: 'url("/background/image.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Confetti for high score */}
      {score / totalQuestions >= 0.75 && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={200}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center"
      >
        <h1 className="text-3xl font-bold text-[#404040] mb-4">
          Thank You!
        </h1>
        <p className="text-xl text-black mb-2">
          <span className="text-black font-semibold">{"We will announce the results soon."}</span>
        </p>
        {/* <p className=" text-2xl font-bold text-[#404040] mb-4">
          {score} / {totalQuestions}
        </p> */}
        {/* <p className="text-gray-700 mb-6">{getMessage()}</p> */}
      </motion.div>
    </main>
  );
}
