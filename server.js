require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./authRoutes");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 requests per 15 min / IP
}));
// Middleware
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL,      // Netlify URL in production
].filter(Boolean);               // remove undefined

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));


app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/AcademyOne');
    
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📦 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ 
    message: "JWT Auth API Running...",
    endpoints: {
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      getUser: "GET /api/auth/me (protected)",
      updateProfile: "PUT /api/auth/profile (protected)",
      changePassword: "PUT /api/auth/change-password (protected)"
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});