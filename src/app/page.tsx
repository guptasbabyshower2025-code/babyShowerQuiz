"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import io from "socket.io-client";
const socket = io("https://babyshowerquiz.onrender.com");

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [quizActive, setQuizActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const quizId = "baby_quiz_001"; // Example quiz ID

  const handleStart = async () => {
    if (!name.trim()) {
      alert("Please enter your name!");
      nameInputRef.current?.focus();
      return;
    }

    localStorage.setItem("playerName", name);

    // Quiz not started yet → join waiting room
    setLoading(true);
    const isActive = await fetchQuizStatus(); // fetch the quiz status
    if (!isActive) {
      socket.emit(
        "join_room",
        { quizId, name },
        (res: { success: boolean }) => {
          if (res.success) router.push("/waiting-room");
        }
      );
      setLoading(false);
      router.push("/waiting-room");
      return;
    } else {
      router.push("/quiz");
    }
  };
  const fetchQuizStatus = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/quiz-status");
      const data = await res.json();
      setQuizActive(data.active); // backend should return { active: true/false }
      return data.active; // return the active status
    } catch (err) {
      console.error("Error fetching quiz status:", err);
      return false; // default to false in case of error
    } finally {
      setLoading(false);
    }
  };
  // const goToAdmin = () => {
  //   const password = prompt("Enter admin password:");
  //   if (password === "baby123") {
  //     // simple auth, change as needed
  //     router.push("/admin");
  //   } else {
  //     alert("Wrong password!");
  //   }
  // };
  const handleAdminLogin = () => {
    if (adminPassword === "baby123") {
      router.push("/admin");
    } else {
      alert("Wrong password!");
    }
    setAdminPassword("");
    setShowAdminInput(false);
  };
  

  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 to-pink-200 relative overflow-hidden"
      style={{
        backgroundImage: 'url("/background/image.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Admin Button / Field */}
      <div className="absolute top-5 right-5 flex items-center z-20">
        {showAdminInput ? (
          <div className="flex items-center gap-2">
            <input
              type="password"
              placeholder="Password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="border text-black border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:border-[#404040]"
            />
            <button
              onClick={handleAdminLogin}
              className="bg-gray-200 hover:bg-gray-300 text-black px-3 py-1 rounded-lg shadow-md transition-all"
            >
              Go
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAdminInput(true)}
            className="bg-[#f0f0f0] hover:bg-gray-300 text-black px-3 py-1 rounded-lg shadow-md transition-all"
          >
            Admin Login
          </button>
        )}
      </div>
      {/* Floating balloons effect */}
      <motion.div
        className="absolute w-20 h-20 bg-pink-300 rounded-full opacity-40"
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
        className="absolute w-12 h-12 bg-pink-200 rounded-full opacity-40"
        animate={{ y: [0, -25, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "30%", left: "80%" }}
      />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white shadow-xl rounded-2xl p-8 w-[90%] max-w-md text-center relative z-10"
      >
        <motion.h1
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-extrabold text-[#404040] mb-3"
        >
          Hey Baby Experts!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 mb-6"
        >
          Enter your name to begin the fun
        </motion.p>

        <motion.input
          type="text"
          name=""
          placeholder="Your Name"
          value={name}
          ref={nameInputRef}
          onChange={(e) => setName(e.target.value)}
          whileFocus={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-full border text-black border-[#404040] rounded-lg p-3 mb-5 focus:outline-none focus:ring-2 focus:[#e899a4]"
        />

        <motion.button
          onClick={handleStart}
          whileHover={{ scale: loading ? 1 : 1.05 }}
          whileTap={{ scale: loading ? 1 : 0.95 }}
          animate={!loading ? { y: [0, -5, 0] } : {}}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          disabled={loading}
          className={`w-full flex justify-center items-center gap-2 ${
            loading ? "bg-gray-600" : "bg-[#404040]"
          } text-white font-semibold py-3 rounded-lg shadow-lg transition-all`}
        >
          {loading ? (
            <motion.div
              className="w-6 h-6 border-4 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            "Start"
          )}
        </motion.button>
      </motion.div>
    </main>
  );
}
