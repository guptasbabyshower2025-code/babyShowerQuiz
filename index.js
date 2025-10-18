// backend/index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB Atlas
const mongoURI =
  process.env.MONGO_URI ||
  "mongodb+srv://guptasbabyshower2025_db_user:D6rd1Su1CFTPyTvl@cluster0.srj6ouo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Schema and Model
const resultSchema = new mongoose.Schema({
  name: String,
  score: Number,
  date: { type: Date, default: Date.now },
});

const quizControlSchema = new mongoose.Schema({
  active: {
    type: Boolean,
    default: false,
  },
});

const Result = mongoose.model("Result", resultSchema);
const QuizControl = mongoose.model("QuizControl", quizControlSchema);

// Root route
app.get("/", (req, res) => {
  res.send("Backend is running! Use /api/results to GET or POST quiz results.");
});

// POST - Save participant result
app.post("/api/results", async (req, res) => {
  try {
    const { name, score, date } = req.body;
    if (!name || score === undefined)
      return res
        .status(400)
        .json({ success: false, message: "Name and score are required" });

    const result = new Result({ name, score, date });
    await result.save();
    res.json({ success: true, message: "Result saved", id: result._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET - Fetch results (sorted: highest score, then earliest submission)
app.get("/api/results", async (req, res) => {
  try {
    const results = await Result.find().sort({ score: -1, date: 1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE - Clear all results (Admin)
app.delete("/api/results", async (req, res) => {
  try {
    await Result.deleteMany({});
    res.json({ success: true, message: "All results cleared" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/quiz-status", async (req, res) => {
  try {
    let quizControl = await QuizControl.findOne();
    if (!quizControl) {
      quizControl = new QuizControl();
      await quizControl.save();
    }
    res.json({ active: quizControl.active });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/quiz-status", async (req, res) => {
  try {
    const { active } = req.body;
    let quizControl = await QuizControl.findOne();
    if (!quizControl) {
      quizControl = new QuizControl({ active });
    } else {
      quizControl.active = active;
    }
    await quizControl.save();
    res.json({
      success: true,
      message: "Quiz status updated",
      active: quizControl.active,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start server
app.listen(port, () =>
  console.log(`🚀 Server running on http://localhost:${port}`)
);
