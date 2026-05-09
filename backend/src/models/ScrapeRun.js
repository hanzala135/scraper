// src/models/ScrapeRun.js
'use strict';

const mongoose = require('mongoose');

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

const CoordinatesSchema = new mongoose.Schema({
  longitude: Number,
  latitude:  Number,
  easting:   String,
  northing:  String,
  raw:       String,
}, { _id: false });

const NswApplicationSchema = new mongoose.Schema({
  panNumber:   { type: String, default: 'N/A' },
  type:        { type: String, default: 'N/A' },
  coordinates: { type: CoordinatesSchema, default: () => ({}) },
}, { _id: false });

const HounslowApplicationSchema = new mongoose.Schema({
  buildingControlApplication: { type: String, default: 'N/A' },
  descriptionOfWork:          { type: String, default: 'N/A' },
  coordinates:                { type: CoordinatesSchema, default: () => ({}) },
  sourceUrl:                  { type: String, default: '' },
}, { _id: false });

// ─── Main schema ─────────────────────────────────────────────────────────────

const ScrapeRunSchema = new mongoose.Schema(
  {
    task: {
      type:     String,
      enum:     ['nsw', 'hounslow', 'all'],
      required: true,
    },
    status: {
      type:    String,
      enum:    ['running', 'success', 'error'],
      default: 'running',
    },
    startedAt:   { type: Date, default: Date.now },
    completedAt: { type: Date },
    duration:    { type: Number },           // milliseconds
    recordCount: { type: Number, default: 0 },
    error:       { type: String, default: '' },

    results: {
      nswPlanning:       { type: [NswApplicationSchema],      default: [] },
      hounslowBuilding:  { type: [HounslowApplicationSchema], default: [] },
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// ─── Virtual: label ───────────────────────────────────────────────────────────
ScrapeRunSchema.virtual('label').get(function () {
  const map = { nsw: 'NSW Planning', hounslow: 'Hounslow BC', all: 'All Tasks' };
  return map[this.task] ?? this.task;
});

module.exports = mongoose.model('ScrapeRun', ScrapeRunSchema);
