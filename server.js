require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

connectDB();

const app = express();

// 🔥 CORS MUST COME FIRST
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://expense-track-frontend-eight.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
  })
);

app.use(express.json());
app.use(cookieParser());

// Routes AFTER CORS
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/budget", require("./routes/budgetRoutes"));
app.use("/api/expense", require("./routes/expenseRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));