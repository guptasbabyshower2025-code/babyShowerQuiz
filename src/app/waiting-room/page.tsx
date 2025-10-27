"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";
import { motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const socket = io("https://babyshowerquiz.onrender.com");

export default function WaitingRoom() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState<string | null>(null);
  const router = useRouter();
  const quizId = "baby_quiz_001";

  useEffect(() => {
    const playerName = localStorage.getItem("playerName") || "Player";
    setName(playerName);
  }, []);

  useEffect(() => {
    if (!name) return; // wait until name is loaded
    if (!quizId) {
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
    <main
      className="flex flex-col items-center justify-center min-h-screen bg-pink-100 p-2"
      style={{
        backgroundImage: 'url("/background/image.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute top-[8rem] mix-blend-multiply">
        {/* <DotLottieReact
          src="https://lottie.host/235bfd1c-a531-4bdf-ba82-abd065921d06/1Er2ogAqi8.lottie"
          loop
          autoplay
        /> */}
        <DotLottieReact
          src="https://lottie.host/1ba250c6-d6cc-458e-91d2-1969e861d871/g2S9Xuqsml.lottie"
          loop
          autoplay
        />
      </div>
      <motion.div
        className="absolute w-20 h-20 bg-pink-400 rounded-full opacity-40"
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "10%", left: "20%" }}
      />
      <motion.div
        className="absolute w-16 h-16 bg-pink-400 rounded-full opacity-40"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "70%", left: "70%" }}
      />
      <motion.div
        className="absolute w-20 h-20 bg-pink-400 rounded-full opacity-40"
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "90%", left: "20%" }}
      />
      <motion.div
        className="absolute w-12 h-12 bg-pink-200 rounded-full opacity-40"
        animate={{ y: [0, -25, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "30%", left: "80%" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-md text-center"
      >
        <h2 className="text-3xl font-bold mb-4 text-black text-center">
          Waiting for the quiz to start...
        </h2>
        <h3 className="text-xl font-bold text-[#404040] mb-4">
          You along with{" "}
          {count - 1 == 1 ? count - 1 + " other is" : count - 1 + " others are"}{" "}
          waiting
        </h3>
        <p className="text-gray-500 mt-2">
          Please wait — Muskan Gupta will start the quiz soon!
        </p>
      </motion.div>
    </main>
  );
}
