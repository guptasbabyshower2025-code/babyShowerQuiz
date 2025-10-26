// backend/index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const port = process.env.PORT || 3001;

// --- Create HTTP server for both Express & Socket.IO ---
const server = http.createServer(app);

// --- Initialize Socket.IO server ---
const io = new Server(server, {
  cors: {
    origin: [
      "https://my-next-app-one-liart.vercel.app", // REPLACE with your actual Vercel URL
      "http://localhost:3000",
      "http://192.168.1.4:3000",
    ],
    methods: ["GET", "POST"],
  },
});

// --- SOCKET.IO REAL-TIME QUIZ LOGIC ---
const rooms = {}; // { quizId: Set<userNames> }

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // Participant joins a quiz room
  socket.on("join_room", ({ quizId, name }, callback) => {
    if (!quizId || !name) {
      console.log("⚠️ join_room missing quizId or name", { quizId, name });
      if (callback) callback({ success: false });
      return;
    }

    if (!rooms[quizId]) rooms[quizId] = new Set();
    rooms[quizId].add(name);

    socket.quizId = quizId;
    socket.name = name;

    socket.join(quizId); // add to Socket.IO room

    const count = [...rooms[quizId]].filter((name) => name !== "admin").length;
    io.to(quizId).emit("participant_count_update", { quizId, count });

    if (callback) callback({ success: true });
  });

  // Admin starts the quiz
  socket.on("start_quiz", ({ quizId }) => {
    if (!quizId || !rooms[quizId]) {
      console.log(`⚠️ Cannot start quiz. Quiz ${quizId} does not exist.`);
      return;
    }

    console.log(`🚀 Quiz ${quizId} started!`);
    io.to(quizId).emit("quiz_started", { quizId });
  });

  // Handle disconnects
  socket.on("disconnect", () => {
    const { quizId, name } = socket;
    if (quizId && rooms[quizId] && name) {
      rooms[quizId].delete(name);
      const count = rooms[quizId].size;
      io.to(quizId).emit("participant_count_update", { quizId, count });
      console.log(`🔴 User ${name} left quiz ${quizId}. Remaining: ${count}`);
    }
  });
});

// --- EXPRESS MIDDLEWARES ---
app.use(cors());
app.use(bodyParser.json());

// --- CONNECT TO MONGODB ---
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

// --- SCHEMAS AND MODELS ---
const resultSchema = new mongoose.Schema({
  name: String,
  score: Number,
  date: { type: Date, default: Date.now },
});

const quizControlSchema = new mongoose.Schema({
  active: { type: Boolean, default: false },
});

const Result = mongoose.model("Result", resultSchema);
const QuizControl = mongoose.model("QuizControl", quizControlSchema);

// --- ROUTES ---
app.get("/", (req, res) => {
  res.send("✅ Backend with Socket.IO is running fine!");
});

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

app.get("/api/results", async (req, res) => {
  try {
    const results = await Result.find().sort({ score: -1, date: 1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

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

// --- START SERVER ---
server.listen(port, () => {
  console.log(`🚀 Express + Socket.IO server running on port ${port}`);
});
