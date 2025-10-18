"use client";

import { useEffect, useState } from "react";

interface Result {
  id: number;
  name: string;
  score: number;
  date: string;
}

export default function AdminPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizActive, setQuizActive] = useState(false);
  const [quizLoading, setQuizLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // ✅ Fetch quiz status
  useEffect(() => {
    const fetchQuizStatus = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/quiz-status");
        const data = await res.json();
        setQuizActive(data.active); // backend should return { active: true/false }
      } catch (err) {
        console.error("Error fetching quiz status:", err);
      } finally {
        setQuizLoading(false);
      }
    };
    fetchQuizStatus();
  }, []);

  // ✅ Fetch results
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(
          "https://babyshowerquiz.onrender.com/api/results"
        );
        const data = await res.json();

        // Sort: highest score first, then earliest submission
        const sorted = data.sort((a: Result, b: Result) => {
          if (b.score !== a.score) return b.score - a.score;
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        setResults(sorted);
      } catch (err) {
        console.error("Error fetching results:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  // ✅ Toggle quiz status
  const handleToggle = async () => {
    setUpdating(true);
    try {
      const res = await fetch("http://localhost:3001/api/quiz-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !quizActive }),
      });
      const data = await res.json();
      setQuizActive(data.active);
    } catch (err) {
      console.error("Error updating quiz status:", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-[#f9f9f9] p-6 flex flex-col items-center"
      style={{
        backgroundImage: 'url("/background/image.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1 className="text-3xl font-bold text-[#404040] mb-6">
        Quiz Results (Admin)
      </h1>

      {/* ✅ Quiz Control Toggle */}
      <div className="flex flex-col items-center mb-10">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Quiz Control
        </h2>

        {quizLoading ? (
          <p className="text-gray-500">Loading quiz status...</p>
        ) : (
          <button
            onClick={handleToggle}
            disabled={updating}
            className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all duration-300 ${
              quizActive ? "bg-green-500" : "bg-gray-400"
            } ${
              updating ? "opacity-70 cursor-not-allowed" : "hover:scale-105"
            }`}
          >
            <span
              className={`absolute left-1 top-1 h-8 w-8 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                quizActive ? "translate-x-10" : "translate-x-0"
              }`}
            />
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-black">Loading...</p>
      ) : results.length === 0 ? (
        <p className="text-black">No results yet.</p>
      ) : (
        <table className="w-full max-w-3xl table-auto border-collapse text-center shadow-lg bg-white/90 backdrop-blur-md rounded-l overflow-hidden">
          <thead>
            <tr className="bg-[#404040] text-white">
              <th className="border px-4 py-2">#</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Score</th>
              <th className="border px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {results.map((res, idx) => {
              const isTopTwo = idx === 0 || idx === 1;
              return (
                <tr
                  key={res.id + 1}
                  className={`text-black ${
                    isTopTwo ? "bg-yellow-200 font-bold" : "bg-white"
                  }`}
                >
                  <td className="border px-4 py-2">{idx + 1}</td>
                  <td className="border px-4 py-2">{res.name}</td>
                  <td className="border px-4 py-2">{res.score}</td>
                  <td className="border px-4 py-2">
                    {new Date(res.date).toLocaleDateString(undefined, {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    at{" "}
                    {new Date(res.date).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}
