"use strict";

const got = require("got");
const logger = require("../utils/logger");
const { NSW } = require("../config");

const SEARCH_URL = `${NSW.API_BASE}/DAApplicationTracker`;

// ───────────────────────────────────────────────
// Mapper
// ───────────────────────────────────────────────

const mapFeature = (feature) => {
  const p = feature?.properties || {};
  const coords = feature?.geometry?.coordinates || [];

  return {
    panNumber: p.PLANNING_PORTAL_APP_NUMBER || "N/A",
    council: p.COUNCIL_NAME || NSW.COUNCIL,
    status: p.STATUS || "N/A",
    type: p.TYPE_OF_DEVELOPMENT || "N/A",
    applicationType: p.APPLICATION_TYPE || "N/A",
    address: p.FULL_ADDRESS || "N/A",
    lodgedDate: p.LODGEMENT_DATE || null,
    decisionDate: p.DETERMINATION_DATE || null,
    coordinates: {
      longitude: coords[0] ?? null,
      latitude: coords[1] ?? null,
    },
  };
};

// ───────────────────────────────────────────────
// SCRAPER (DIRECT GOT VERSION)
// ───────────────────────────────────────────────

const scrapeNSWPlanning = async (onLog) => {
  const log = (msg) => {
    logger.info(msg);
    onLog?.(msg);
  };

  log("🌏 NSW Planning → scraping started");

  try {
    const payload = {
      PageNumber: Number(NSW.PAGE),
      PageSize: Number(NSW.PAGE_SIZE),
      ApplicationStatus: "ALL",
      CouncilDisplayName: NSW.COUNCIL,
      DevelopmentType: "ALL",
      LodgedDateFrom: "",
      LodgedDateTo: "",
    };

    const res = await got.post(SEARCH_URL, {
      json: payload, // ✅ correct got usage
      responseType: "json",
      throwHttpErrors: false,
      timeout: { request: 60000 },
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (res.statusCode !== 200) {
      throw new Error(`HTTP ${res.statusCode}: ${JSON.stringify(res.body)}`);
    }

    const features = res.body?.features || [];

    if (!Array.isArray(features) || features.length === 0) {
      log("⚠️ No applications returned");
      return [];
    }

    const results = features.map(mapFeature);

    log(`NSW → scraped ${results.length} record(s)`);

    return results;
  } catch (err) {
    log(`❌ NSW error: ${err.message}`);
    throw err;
  }
};

module.exports = { scrapeNSWPlanning };
