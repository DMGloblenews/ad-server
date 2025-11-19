const express = require("express");
const cors = require("cors");
const multer = require("multer");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const uploadDir = path.join("/data", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

const db = new sqlite3.Database("/data/ads.db");

db.run(`
  CREATE TABLE IF NOT EXISTS ads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file TEXT,
    type TEXT,
    advertiser TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.post("/upload", upload.single("adfile"), (req, res) => {
  const file = req.file.filename;
  const type = req.file.mimetype.includes("video") ? "video" : "image";
  const advertiser = req.body.advertiser || "unknown";

  db.run(
    "INSERT INTO ads (file, type, advertiser) VALUES (?, ?, ?)",
    [file, type, advertiser],
    function () {
      res.json({ success: true, id: this.lastID, file });
    }
  );
});

app.use("/ads", express.static(uploadDir));

app.get("/serve", (req, res) => {
  db.get("SELECT * FROM ads ORDER BY RANDOM() LIMIT 1", (err, row) => {
    if (!row) return res.json({ error: "No ads available." });
    res.json({ id: row.id, type: row.type, url: `/ads/${row.file}` });
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Ad API running on port " + PORT));
