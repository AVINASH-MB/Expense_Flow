const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuid } = require("uuid");

const DIR = path.join(__dirname, "..", process.env.UPLOAD_DIR || "uploads");
fs.mkdirSync(DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuid()}${ext}`);
  },
});

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "application/pdf"]);

const upload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_UPLOAD_MB || 5) * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) return cb(new Error("Unsupported file type"));
    cb(null, true);
  },
});

module.exports = { upload };
