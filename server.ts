import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DB_FILE = path.join(__dirname, "chores_db.json");
const PARENT_PASSWORD = process.env.PARENT_PASSWORD || "admin123";

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize DB if not exists
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
  }

  // API Routes
  app.get("/api/chores", (req, res) => {
    try {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      res.json(JSON.parse(data));
    } catch (err) {
      res.status(500).json({ error: "Failed to read data" });
    }
  });

  app.post("/api/chores", (req, res) => {
    const { user, chore, date, points, password } = req.body;

    if (password !== PARENT_PASSWORD) {
      return res.status(403).json({ error: "Incorrect Parent Password" });
    }

    try {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const logs = JSON.parse(data);
      
      const newEntry = {
        id: Date.now().toString(),
        user,
        chore,
        date,
        points,
        timestamp: new Date().toISOString()
      };

      logs.push(newEntry);
      fs.writeFileSync(DB_FILE, JSON.stringify(logs, null, 2));
      res.json({ success: true, entry: newEntry });
    } catch (err) {
      res.status(500).json({ error: "Failed to save data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
