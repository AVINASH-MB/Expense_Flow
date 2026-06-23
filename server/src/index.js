require("dotenv").config();
const express = require("express");
const cors = require("cors");

const auth = require("./routes/auth");
const transactions = require("./routes/transactions");
const budgets = require("./routes/budgets");
const goals = require("./routes/goals");
const notifications = require("./routes/notifications");
const settings = require("./routes/settings");
const admin = require("./routes/admin");

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || true, credentials: false }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", auth);
app.use("/api/transactions", transactions);
app.use("/api/budgets", budgets);
app.use("/api/goals", goals);
app.use("/api/notifications", notifications);
app.use("/api/settings", settings);
app.use("/api/admin", admin);

// Centralized error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Server error" });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`ExpenseFlow API listening on :${port}`));
