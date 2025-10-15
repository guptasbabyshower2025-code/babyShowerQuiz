// backend/index.js

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite database
const dbPath = path.resolve(__dirname, "database.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("DB Connection Error:", err.message);
  else console.log("Connected to SQLite database");
});

// Create results table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    score INTEGER,
    date TEXT
  )
`);

// Root route
app.get("/", (req, res) => {
  res.send("Backend is running! Use /api/results to GET or POST quiz results.");
});

// Save participant result
app.post("/api/results", (req, res) => {
  const { name, score, date } = req.body;

  if (!name || score === undefined) {
    return res.status(400).json({ success: false, message: "Name and score are required" });
  }

  db.run(
    `INSERT INTO results (name, score, date) VALUES (?, ?, ?)`,
    [name, score, date || new Date().toISOString()],
    function (err) {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.json({ success: true, message: "Result saved", id: this.lastID });
    }
  );
});

// Get all results sorted by highest score, earliest submission first
app.get("/api/results", (req, res) => {
  db.all(`SELECT * FROM results ORDER BY score DESC, date ASC`, [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json(rows);
  });
});

// Optional: clear all results (admin)
app.delete("/api/results", (req, res) => {
  db.run(`DELETE FROM results`, [], function (err) {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, message: "All results cleared" });
  });
});

// Start server
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
