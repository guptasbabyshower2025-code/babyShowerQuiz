"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";

const socket = io("https://babyshowerquiz.onrender.com");

export default function WaitingRoom() {
  const [count, setCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // 🔹 Listen for participant count updates
    socket.on("participantCount", (n: number) => {
      setCount(n);
    });

    // 🔹 Listen for quiz start signal
    socket.on("quizStarted", () => {
      router.push("/quiz");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-pink-100">
      <h1 className="text-3xl font-bold mb-4">🎉 Waiting for the quiz to start...</h1>
      <p className="text-lg text-gray-700">👥 Participants joined: {count}</p>
      <p className="text-gray-500 mt-2">Please wait — admin will start soon!</p>
    </main>
  );
}
