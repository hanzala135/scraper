"use strict";

const got = require("got");
const cheerio = require("cheerio");
const { CookieJar } = require("tough-cookie");
const { HttpsProxyAgent } = require("hpagent");
const logger = require("../utils/logger");
const proj4 = require("proj4");

// ───────────────────────────────────────────────
// COORDINATE CONVERSION
// ───────────────────────────────────────────────

const osgb36 =
  "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs";

const wgs84 = proj4.WGS84;

const convertToLatLng = (easting, northing) => {
  if (!easting || !northing) return { lat: null, lng: null };

  const [lng, lat] = proj4(osgb36, wgs84, [
    parseFloat(easting),
    parseFloat(northing),
  ]);

  return { lat, lng };
};

// ───────────────────────────────────────────────
// CONFIG
// ───────────────────────────────────────────────

const BASE = "https://planningandbuilding.hounslow.gov.uk";

const SEARCH_PAGE =
  BASE +
  "/NECSWS/ES/Presentation/BuildingControl/OnlineBuildingControl/OnlineBuildingControlSearch";

const SEARCH_RESULTS =
  BASE +
  "/NECSWS/ES/Presentation/BuildingControl/OnlineBuildingControl/OnlineBuildingControlSearchResults";

const DETAILS_URL =
  BASE +
  "/NECSWS/ES/Presentation/BuildingControl/OnlineBuildingControl/OnlineBuildingControlApplicationDetails?key=";

const PROXY = "http://mkcoyqdg:y518nbexcsyd@45.38.107.97:6014";

// ───────────────────────────────────────────────
// CLIENT
// ───────────────────────────────────────────────

const cookieJar = new CookieJar();
const agent = new HttpsProxyAgent({ proxy: PROXY });

const client = got.extend({
  cookieJar,
  agent: { https: agent },
  responseType: "text",
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36",
  },
});

// ───────────────────────────────────────────────
// HELPERS
// ───────────────────────────────────────────────

const getSearchPage = async () => {
  const res = await client.get(SEARCH_PAGE);
  return res.body;
};

const searchApplications = async () => {
  const res = await client.post(SEARCH_RESULTS, {
    form: {
      SearchFor: "BCApplications",
      StatusOptions: "CustomDateRange",
      SortOptions: "SortedByMostRecent",
      FromDate: "02/05/2026",
      ToDate: "06/05/2026",
      DisplayMapSearch: "False",
    },
  });

  return res.body;
};

const parseApplications = (html) => {
  const $ = cheerio.load(html);

  const jsonText = $("#hidSearchResultsJson").val();

  if (!jsonText) {
    throw new Error("hidSearchResultsJson not found");
  }

  const data = JSON.parse(jsonText);

  return (data.SearchResults || []).slice(0, 5).map((item) => ({
    application: item.ApplicationId,
    description: item.Description,
    key: item.UniqueKey,
  }));
};

// ───────────────────────────────────────────────
// GIS (REAL SOURCE OF COORDINATES)
// ───────────────────────────────────────────────

const getCoordinatesFromGIS = async (applicationId) => {
  try {
    const res = await client.post(
      BASE + "/NECSWS/ES/Presentation/Gis/building/siteLocationAddressList",
      {
        json: { applicationId },
        responseType: "json",
      },
    );

    return res.body;
  } catch (err) {
    console.log("GIS ERROR:", err.message);
    return null;
  }
};

// ───────────────────────────────────────────────
// HTML FALLBACK (NOT RELIABLE BUT KEPT)
// ───────────────────────────────────────────────

const extractCoordinatesFromHTML = (html) => {
  if (!html) return null;

  const clean = html.replace(/\s+/g, " ");

  const match = clean.match(/Easting:\s*(\d+)\s*Northing:\s*(\d+)/i);

  if (!match) return null;

  return {
    easting: parseInt(match[1]),
    northing: parseInt(match[2]),
  };
};

// ───────────────────────────────────────────────
// DETAILS PAGE
// ───────────────────────────────────────────────

const getDetails = async (key) => {
  const res = await client.get(DETAILS_URL + key);

  const coords = extractCoordinatesFromHTML(res.body);

  return {
    coordinates: coords,
  };
};

// ───────────────────────────────────────────────
// MAIN SCRAPER
// ───────────────────────────────────────────────

const scrapeHounslowBuilding = async (onLog) => {
  const log = (msg) => {
    logger.info(msg);
    onLog?.(msg);
  };

  log("🏗️ Hounslow Building Control → scraping started");

  try {
    await getSearchPage();

    const html = await searchApplications();
    const apps = parseApplications(html);

    if (!apps.length) {
      log("⚠️ No applications found");
      return [];
    }

    const results = [];

    for (const app of apps) {
      try {
        // 🔥 PRIMARY SOURCE (GIS)
        const gis = await getCoordinatesFromGIS(app.application);
        console.log("GIS RESULT:", gis);

        // 🔥 FALLBACK (HTML)
        const detail = await getDetails(app.key);

        let finalCoords = null;

        if (gis?.easting && gis?.northing) {
          const { lat, lng } = convertToLatLng(gis.easting, gis.northing);

          finalCoords = {
            easting: gis.easting,
            northing: gis.northing,
            latitude: lat,
            longitude: lng,
          };
        } else if (detail.coordinates) {
          const { lat, lng } = convertToLatLng(
            detail.coordinates.easting,
            detail.coordinates.northing,
          );

          finalCoords = {
            ...detail.coordinates,
            latitude: lat,
            longitude: lng,
          };
        }

        results.push({
          buildingControlApplication: app.application,
          descriptionOfWork: app.description,
          coordinates: finalCoords,
          sourceUrl: DETAILS_URL + app.key,
        });
      } catch (err) {
        log(`❌ Detail error (${app.application}): ${err.message}`);
      }
    }

    log(`Hounslow → scraped ${results.length} record(s)`);

    return results;
  } catch (err) {
    log(`❌ Hounslow error: ${err.message}`);
    throw err;
  }
};

module.exports = { scrapeHounslowBuilding };
