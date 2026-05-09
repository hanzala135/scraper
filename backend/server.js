// server.js
"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const scrapeRouter = require("./src/routes/scrape");
const historyRouter = require("./src/routes/history");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Database ────────────────────────────────────────────────────────────────
connectDB();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: ["http://localhost:5173", /\.vercel\.app$/],
    credentials: true,
  }),
);

app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/scrape", scrapeRouter);
app.use("/api/history", historyRouter);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/api/health", (_, res) =>
  res.json({
    status: "ok",
    time: new Date().toISOString(),
  }),
);

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_, res) => res.status(404).json({ error: "Route not found" }));

// ─── Local Development Only ─────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () =>
    console.log(`[SERVER] Running → http://localhost:${PORT}`),
  );
}

// ─── Export for Vercel ───────────────────────────────────────────────────────
module.exports = app;
