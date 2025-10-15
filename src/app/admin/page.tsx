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

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch("https://babyshowerquiz.onrender.com/api/results");
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

  return (
    <main
      className="min-h-screen bg-[#f9f9f9] p-6"
      style={{
        backgroundImage: 'url("/background/image.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1 className="text-3xl font-bold text-[#404040] mb-6">
        Quiz Results (Admin)
      </h1>

      {loading ? (
        <p>Loading...</p>
      ) : results.length === 0 ? (
        <p>No results yet.</p>
      ) : (
        <table className="w-full table-auto border-collapse text-center shadow-lg">
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
              const isTopTwo = idx === 0 || idx === 1; // top 2 scorers
              return (
                <tr
                  key={res.id}
                  className={`bg-white text-black ${
                    isTopTwo ? "bg-yellow-200 font-bold" : ""
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
