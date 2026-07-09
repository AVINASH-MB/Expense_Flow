require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

const origins = process.env.CORS_ORIGIN?.split(",").map((s) => s.trim()).filter(Boolean) || true;
app.use(cors({ origin: origins, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, process.env.UPLOAD_DIR || "uploads")));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth",          require("./routes/auth"));
app.use("/api/dashboard",     require("./routes/dashboard"));
app.use("/api/transactions",  require("./routes/transactions"));
app.use("/api/income",        require("./routes/income"));
app.use("/api/categories",    require("./routes/categories"));
app.use("/api/budgets",       require("./routes/budgets"));
app.use("/api/goals",         require("./routes/goals"));
app.use("/api/analytics",     require("./routes/analytics"));
app.use("/api/settings",      require("./routes/settings"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/receipts",      require("./routes/receipts"));
app.use("/api/admin",         require("./routes/admin"));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`ExpenseFlow API listening on :${port}`));
