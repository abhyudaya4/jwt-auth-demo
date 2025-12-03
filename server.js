require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./authRoutes");
const n8nRoutes = require("./n8nroutes");





const app = express();


// ----------------------
// 🔐 SECURITY MIDDLEWARE
// ----------------------
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  })
);


// ----------------------
// 🌐 CORS CONFIG (FINAL FIXED VERSION)
// ----------------------
const allowedOrigins = [
  "https://academyone.netlify.app",
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server or tools (no origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS blocked for origin: " + origin));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight OPTIONS for ALL routes
app.options("/*", cors());


// ----------------------
// 📦 BODY PARSER
// ----------------------
app.use(express.json());


// ----------------------
// 🔗 MONGODB CONNECTION
// ----------------------
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "AcademyOne",
    });

    console.log("✅ MongoDB Connected Successfully");
    console.log(`📦 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

connectDB();


// ----------------------
// 🚪 ROUTES
// ----------------------
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "AcademyOne API is running 🚀",
    status: "OK",
  });
});

//n8n route
app.use("/api/chat", n8nRoutes);


// ----------------------
// 🚀 START SERVER
// ----------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("🌍 Allowed Origins:", allowedOrigins);
});
