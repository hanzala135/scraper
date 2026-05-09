"use strict";

const express = require("express");
const ScrapeRun = require("../models/ScrapeRun");

const { scrapeNSWPlanning } = require("../scrapers/nswPlanning");
const { scrapeHounslowBuilding } = require("../scrapers/hounslowBuilding");

const router = express.Router();

// ─────────────────────────────
// SSE helper
// ─────────────────────────────

const send = (res, event, data) => {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
};

// ─────────────────────────────
// Route
// ─────────────────────────────

router.get("/:task", async (req, res) => {
  const { task } = req.params;

  if (!["nsw", "hounslow", "all"].includes(task)) {
    return res.status(400).json({ error: "Invalid task" });
  }

  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  res.flushHeaders();

  const log = (msg, level = "info") => {
    send(res, "log", { msg, level });
  };

  let run;

  try {
    run = await ScrapeRun.create({
      task,
      status: "running",
      startedAt: new Date(),
    });

    send(res, "run_created", { runId: run._id });

    const start = Date.now();

    let nsw = [];
    let hounslow = [];

    // NSW
    if (task === "nsw" || task === "all") {
      try {
        log("NSW scraping started");
        nsw = await scrapeNSWPlanning((m) => log(m));
        log(`NSW done: ${nsw.length}`, "success");
      } catch (e) {
        log(`NSW error: ${e.message}`, "error");
      }
    }

    // Hounslow
    if (task === "hounslow" || task === "all") {
      try {
        log("Hounslow scraping started");
        hounslow = await scrapeHounslowBuilding((m) => log(m));
        log(`Hounslow done: ${hounslow.length}`, "success");
      } catch (e) {
        log(`Hounslow error: ${e.message}`, "error");
      }
    }

    const duration = Date.now() - start;

    await ScrapeRun.findByIdAndUpdate(run._id, {
      status: "success",
      completedAt: new Date(),
      duration,
      recordCount: nsw.length + hounslow.length,
      results: { nswPlanning: nsw, hounslowBuilding: hounslow },
    });

    send(res, "result", {
      runId: run._id,
      data: { nsw, hounslow },
      duration,
    });

    res.end();
  } catch (err) {
    console.error(err);

    if (run) {
      await ScrapeRun.findByIdAndUpdate(run._id, {
        status: "error",
        completedAt: new Date(),
        error: err.message,
      });
    }

    send(res, "error", { message: err.message });
    res.end();
  }
});

module.exports = router;