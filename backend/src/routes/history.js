// src/routes/history.js
'use strict';

const express   = require('express');
const ScrapeRun = require('../models/ScrapeRun');

const router = express.Router();

// GET /api/history — all runs, newest first
router.get('/', async (req, res) => {
  try {
    const runs = await ScrapeRun
      .find()
      .sort({ startedAt: -1 })
      .select('-results.nswPlanning -results.hounslowBuilding') // exclude heavy data from list
      .lean();
    res.json({ success: true, count: runs.length, data: runs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/history/stats — aggregate stats for dashboard
router.get('/stats', async (req, res) => {
  try {
    const [total, byTask, totals] = await Promise.all([
      ScrapeRun.countDocuments({ status: 'success' }),
      ScrapeRun.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: '$task', count: { $sum: 1 }, records: { $sum: '$recordCount' } } },
      ]),
      ScrapeRun.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, totalRecords: { $sum: '$recordCount' }, avgDuration: { $avg: '$duration' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalRuns:     total,
        totalRecords:  totals[0]?.totalRecords  ?? 0,
        avgDuration:   totals[0]?.avgDuration   ?? 0,
        byTask,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/history/:id — single run with full results
router.get('/:id', async (req, res) => {
  try {
    const run = await ScrapeRun.findById(req.params.id).lean();
    if (!run) return res.status(404).json({ success: false, error: 'Run not found' });
    res.json({ success: true, data: run });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/history/:id — delete one run
router.delete('/:id', async (req, res) => {
  try {
    const run = await ScrapeRun.findByIdAndDelete(req.params.id);
    if (!run) return res.status(404).json({ success: false, error: 'Run not found' });
    res.json({ success: true, message: 'Run deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/history — delete all runs
router.delete('/', async (req, res) => {
  try {
    await ScrapeRun.deleteMany({});
    res.json({ success: true, message: 'All history cleared' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
