"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import io from "socket.io-client";

const socket = io("https://babyshowerquiz.onrender.com");

export default function WaitingRoom() {
  const [count, setCount] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();

  const quizId = "baby_quiz_001";
  const name = localStorage.getItem("playerName") || "";

  useEffect(() => {
    if (!quizId || !name) {
      router.push("/");
      return;
    }

    const handleCountUpdate = ({
      quizId: id,
      count,
    }: {
      quizId: string;
      count: number;
    }) => {
      if (id === quizId) setCount(count);
    };

    const handleQuizStart = ({ quizId: id }: { quizId: string }) => {
      if (id === quizId) router.push("/quiz");
    };

    socket.on("participant_count_update", handleCountUpdate);
    socket.on("quiz_started", handleQuizStart);

    socket.emit("join_room", { quizId, name }, (res: { success: boolean }) => {
      if (!res.success) alert("Failed to join the quiz");
    });

    return () => {
      socket.off("participant_count_update", handleCountUpdate);
      socket.off("quiz_started", handleQuizStart);
    };
  }, [quizId, name, router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-pink-100 p-2">
      <h1 className="text-3xl font-bold mb-4 text-black text-center">
        Waiting for the quiz to start...
      </h1>
      <p className="text-lg text-gray-700 font-extrabold">
        Participants joined: {count}
      </p>
      <p className="text-gray-500 mt-2">Please wait — admin will start soon!</p>
    </main>
  );
}
