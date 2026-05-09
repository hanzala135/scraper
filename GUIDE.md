# ScrapeKit — Developer Guide
## MERN Stack Planning Data Extractor

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Project Structure](#3-project-structure)
4. [Setup & Running](#4-setup--running)
5. [Backend Deep-Dive](#5-backend-deep-dive)
6. [Frontend Deep-Dive](#6-frontend-deep-dive)
7. [MongoDB Schema](#7-mongodb-schema)
8. [API Reference](#8-api-reference)
9. [Where to Update Things](#9-where-to-update-things)
10. [Adding a New Scraper](#10-adding-a-new-scraper)
11. [Common Errors & Fixes](#11-common-errors--fixes)

---

## 1. Project Overview

ScrapeKit is a full **MERN** stack application that:

- **Scrapes** planning and building control data from two government websites using `got` + `cheerio`
- **Saves** every scrape run (results + metadata) to **MongoDB** via Mongoose
- **Streams** live logs to the React frontend using **Server-Sent Events (SSE)**
- **Displays** results in React with a terminal UI and card-based results view
- **Tracks history** — all past runs are stored and viewable with full results

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| HTTP client | `got@11` (no Puppeteer/Playwright) |
| HTML parser | `cheerio` |
| Session cookies | `tough-cookie` |
| Live streaming | Server-Sent Events (SSE) |

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                  │
│  Dashboard page            History page                   │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐  │
│  │TaskCards │ │Terminal  │ │StatsBar   │ │Run list   │  │
│  │(trigger) │ │(SSE logs)│ │(MongoDB)  │ │(MongoDB)  │  │
│  └────┬─────┘ └────┬─────┘ └─────┬─────┘ └─────┬─────┘  │
│       │             │             │               │        │
│  EventSource     EventSource   axios.get       axios.get  │
└───────┼─────────────┼─────────────┼───────────────┼───────┘
        │             │             │               │
        ▼             ▼             ▼               ▼
┌─────────────────────────────────────────────────────────┐
│                  Express Backend (:5000)                  │
│                                                           │
│  GET /api/scrape/:task ──SSE──► runs scraper             │
│  GET /api/history           ──► list all runs            │
│  GET /api/history/stats     ──► aggregated stats         │
│  GET /api/history/:id       ──► full run + results       │
│  DELETE /api/history/:id    ──► delete one run           │
│  DELETE /api/history        ──► clear all                │
│                                                           │
│  ┌──────────────┐    ┌────────────────────────────────┐  │
│  │ nswPlanning  │    │ hounslowBuilding               │  │
│  │ scraper      │    │ scraper                        │  │
│  │ (got JSON)   │    │ (got + cheerio HTML parsing)   │  │
│  └──────┬───────┘    └───────────────┬────────────────┘  │
└─────────┼────────────────────────────┼───────────────────┘
          │                            │
          ▼                            ▼
┌─────────────────────────────────────────────────────────┐
│                       MongoDB                             │
│                                                           │
│   Collection: scraperuns                                  │
│   ┌──────────────────────────────────────────────────┐   │
│   │ { task, status, startedAt, completedAt,          │   │
│   │   duration, recordCount, error,                  │   │
│   │   results: { nswPlanning[], hounslowBuilding[] } │   │
│   │ }                                                │   │
│   └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Project Structure

```
mern-scraping/
│
├── backend/
│   ├── server.js                    ← Express entry point
│   ├── .env.example                 ← Copy to .env
│   ├── package.json
│   └── src/
│       ├── config/
│       │   ├── db.js                ← MongoDB connection
│       │   └── index.js             ← ALL scraper URLs / settings ← UPDATE HERE
│       ├── models/
│       │   └── ScrapeRun.js         ← Mongoose schema (MongoDB shape)
│       ├── routes/
│       │   ├── scrape.js            ← SSE scrape endpoints
│       │   └── history.js           ← CRUD history endpoints
│       ├── scrapers/
│       │   ├── nswPlanning.js       ← Task 1 scraper logic
│       │   └── hounslowBuilding.js  ← Task 2 scraper logic
│       └── utils/
│           ├── httpClient.js        ← got factory (DRY)
│           └── logger.js            ← timestamp logger
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js               ← Proxy /api → :5000
│   ├── package.json
│   └── src/
│       ├── api/
│       │   └── index.js             ← All axios calls to backend
│       ├── components/
│       │   ├── Header.jsx           ← Nav + logo
│       │   ├── TaskCard.jsx         ← Sidebar task trigger card
│       │   ├── Terminal.jsx         ← Live SSE log display
│       │   ├── ResultCard.jsx       ← NSW + Hounslow result cards
│       │   └── StatsBar.jsx         ← MongoDB stats (History page)
│       ├── hooks/
│       │   └── useScraper.js        ← SSE state management hook
│       ├── pages/
│       │   ├── Dashboard.jsx        ← Main scraper UI
│       │   └── History.jsx          ← Past runs from MongoDB
│       ├── App.jsx                  ← Root, page routing
│       ├── main.jsx                 ← React root mount
│       └── index.css                ← CSS variables + global styles
│
├── .gitignore
└── GUIDE.md                         ← This file
```

---

## 4. Setup & Running

### Prerequisites

| Tool | Minimum Version |
|---|---|
| Node.js | 18+ |
| MongoDB | 6+ (local or Atlas) |
| npm | 9+ |

### Step 1 — Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2 — Configure environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/scrapekit
```

For MongoDB Atlas, use your connection string:
```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/scrapekit
```

### Step 3 — Run (two terminals)

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev        # with hot-reload (nodemon)
# or
npm start          # production
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

### Step 4 — Open

```
http://localhost:5173
```

---

## 5. Backend Deep-Dive

### server.js

Entry point. Connects MongoDB, registers middleware, mounts routes.

```
CORS is configured for http://localhost:5173 (Vite dev server).
For production, update the origin in app.use(cors(...)).
```

### src/config/index.js ← **Main update file**

All scraper constants live here. See [Section 9](#9-where-to-update-things).

### src/scrapers/nswPlanning.js

| Step | What happens |
|---|---|
| 1 | `got.get(SEARCH_URL)` with council filter query params |
| 2 | Parses JSON response → unwraps Application array |
| 3 | Maps each item to `{ panNumber, type, coordinates }` |
| 4 | Calls `onLog(msg)` so SSE route can stream it live |

**Coordinate extraction** handles three formats:
- `Location[0].X / Y` (ePlanning v0 — current)
- `{ longitude, latitude }` flat fields
- GeoJSON `geometry.coordinates` array

### src/scrapers/hounslowBuilding.js

| Step | What happens |
|---|---|
| 1 | `got.get(SEARCH_URL)` — captures `__VIEWSTATE` hidden tokens |
| 2 | `got.post(SEARCH_URL)` with date range form data |
| 3 | `cheerio` parses result HTML → extracts `OnlineBuildingControlOverview` links |
| 4 | Loop: `got.get(detailUrl)` for each application |
| 5 | `cheerio` extracts `BC Application`, `Description of Work`, `Co-ordinates` |

**Why `tough-cookie`?** The NECSWS ASP.NET system is session-based. `tough-cookie` automatically persists the session cookie between requests so steps 1–4 appear as one browser session.

### src/routes/scrape.js (SSE flow)

```
Client opens EventSource('/api/scrape/nsw')
       │
       ├── Server creates ScrapeRun in MongoDB (status: 'running')
       ├── Emits run_created event  → { runId }
       │
       ├── Runs scraper
       │     └── Each log message → emits 'log' event → { msg, level }
       │
       ├── On success:
       │     ├── Updates ScrapeRun in MongoDB (status: 'success', results)
       │     └── Emits 'result' event → { runId, task, data, duration, recordCount }
       │
       └── On error:
             ├── Updates ScrapeRun in MongoDB (status: 'error')
             └── Emits 'error' event → { runId, message }
```

### src/routes/history.js

| Route | Returns |
|---|---|
| `GET /api/history` | All runs (no results data — lightweight list) |
| `GET /api/history/stats` | Aggregated: totalRuns, totalRecords, avgDuration, byTask |
| `GET /api/history/:id` | Single run with full results data |
| `DELETE /api/history/:id` | Delete one run |
| `DELETE /api/history` | Delete all runs |

---

## 6. Frontend Deep-Dive

### src/api/index.js

All HTTP calls in one place. If the backend URL changes, update only here.

```js
const api = axios.create({ baseURL: '/api' });
// '/api' is proxied to http://localhost:5000 by Vite (vite.config.js)
```

### src/hooks/useScraper.js

Manages the entire SSE lifecycle:

```
run(task) called
    │
    ├── setState: { running: true, logs: [], results: null }
    ├── new EventSource('/api/scrape/:task')
    │
    ├── on 'log'         → appends to logs[]
    ├── on 'run_created' → saves runId
    ├── on 'result'      → sets results, running: false, closes EventSource
    └── on 'error'       → sets error, running: false, closes EventSource
```

### src/pages/Dashboard.jsx

Sidebar (TaskCards) + Terminal (SSE logs) + Results grid (ResultCards).

The three task buttons call `useScraper.run('nsw' | 'hounslow' | 'all')`.

### src/pages/History.jsx

Fetches from MongoDB via REST API:
1. Load `GET /api/history` → list of runs
2. Load `GET /api/history/stats` → StatsBar
3. Click a run → load `GET /api/history/:id` → show full results

### vite.config.js

```js
proxy: {
  '/api': { target: 'http://localhost:5000', changeOrigin: true }
}
```

This means `fetch('/api/history')` in React goes to `http://localhost:5000/api/history`. **No CORS issues in development.**

---

## 7. MongoDB Schema

```js
ScrapeRun {
  task:        'nsw' | 'hounslow' | 'all'
  status:      'running' | 'success' | 'error'
  startedAt:   Date
  completedAt: Date
  duration:    Number (ms)
  recordCount: Number
  error:       String
  results: {
    nswPlanning: [{
      panNumber:   String   // e.g. "CDC-105160"
      type:        String   // e.g. "Complying Development Certificate Application"
      coordinates: {
        longitude: Number,
        latitude:  Number
      }
    }],
    hounslowBuilding: [{
      buildingControlApplication: String   // e.g. "IN/2026/0355/"
      descriptionOfWork:          String
      coordinates: {
        easting:  String,
        northing: String,
        raw:      String   // original text e.g. "Easting: 519123 Northing: 177456"
      }
      sourceUrl: String
    }]
  }
}
```

---

## 8. API Reference

### Scraping (SSE)

```
GET /api/scrape/:task
```

`:task` = `nsw` | `hounslow` | `all`

**SSE Events emitted:**

| Event | Payload |
|---|---|
| `log` | `{ msg: string, level: 'info'|'success'|'error'|'warn' }` |
| `run_created` | `{ runId: string }` |
| `result` | `{ runId, task, data: { nswPlanning[], hounslowBuilding[] }, duration, recordCount }` |
| `error` | `{ runId, message: string }` |

### History (REST)

```
GET    /api/history           → { success, count, data: Run[] }
GET    /api/history/stats     → { success, data: { totalRuns, totalRecords, avgDuration, byTask } }
GET    /api/history/:id       → { success, data: Run (with full results) }
DELETE /api/history/:id       → { success, message }
DELETE /api/history           → { success, message }
GET    /api/health            → { status: 'ok', time }
```

---

## 9. Where to Update Things

### Change the council (NSW)

```
backend/src/config/index.js
```
```js
NSW: {
  COUNCIL: 'Junee Shire Council',   // ← change this
  PAGE_SIZE: 5,                      // ← change number of results
}
```

### Change the date range (Hounslow)

```
backend/src/config/index.js
```
```js
HOUNSLOW: {
  FROM_DATE: '01/05/2026',   // ← DD/MM/YYYY
  TO_DATE:   '05/05/2026',   // ← DD/MM/YYYY
  MAX_RESULTS: 5,             // ← max applications to scrape
}
```

### Fix NSW API endpoint (if 404)

Open Chrome DevTools on `https://www.planningportal.nsw.gov.au/map`, apply the council filter, find the XHR request, copy the base URL, then:

```
backend/src/config/index.js
```
```js
NSW: {
  API_BASE: 'https://api.planningportal.nsw.gov.au/eplanning/data/v0',  // ← update
}
```

Also update the field mapping in `backend/src/scrapers/nswPlanning.js → mapApplication()` if field names changed.

### Fix Hounslow form field names (if POST fails)

Open Chrome DevTools on the Hounslow search page, submit the form, inspect the POST payload, then update `buildSearchForm()` in:

```
backend/src/scrapers/hounslowBuilding.js
```

### Add more result fields (NSW)

In `backend/src/scrapers/nswPlanning.js`:
```js
const mapApplication = (app) => ({
  panNumber:   app.PlanningPortalApplicationNumber ?? 'N/A',
  type:        app.ApplicationType ?? 'N/A',
  coordinates: extractCoordinates(app),
  // Add new fields:
  status:      app.Status ?? 'N/A',
  address:     app.Location?.[0]?.FullAddress ?? 'N/A',
  lodgeDate:   app.LodgementDate ?? 'N/A',
});
```

Then add the field to the Mongoose sub-schema in:
```
backend/src/models/ScrapeRun.js → NswApplicationSchema
```
```js
status:    { type: String, default: 'N/A' },
address:   { type: String, default: 'N/A' },
lodgeDate: { type: String, default: 'N/A' },
```

Then add it to the result card in:
```
frontend/src/components/ResultCard.jsx → NswCard
```
```jsx
<Field label="Status"  value={app.status} />
<Field label="Address" value={app.address} />
```

### Change port numbers

**Backend port:**
```
backend/.env → PORT=5000
```

**Frontend → backend proxy:**
```
frontend/vite.config.js → proxy target: 'http://localhost:5000'
```

**Frontend CORS on backend:**
```
backend/server.js → app.use(cors({ origin: 'http://localhost:5173' }))
```

### Change MongoDB database name

```
backend/.env → MONGO_URI=mongodb://localhost:27017/scrapekit
```
Replace `scrapekit` with your preferred DB name.

### Change number of applications scraped

```
backend/src/config/index.js
NSW.PAGE_SIZE = 10       // NSW: how many to request
HOUNSLOW.MAX_RESULTS = 10  // Hounslow: how many detail pages to visit
```

### Change UI colors / theme

All colors are CSS variables in:
```
frontend/src/index.css
```
```css
:root {
  --nsw:  #00e5a0;   /* NSW green accent */
  --hou:  #4db8ff;   /* Hounslow blue accent */
  --all:  #b06bff;   /* All-tasks purple accent */
  --bg:   #0a0c0f;   /* Page background */
  --sf:   #111418;   /* Surface / sidebar */
  --tx:   #c8d8e8;   /* Body text */
}
```

---

## 10. Adding a New Scraper

Say you want to add a **third council** scraper.

### Step 1 — Add config

`backend/src/config/index.js`:
```js
NEW_COUNCIL: {
  API_BASE: 'https://...',
  COUNCIL:  'Your Council Name',
  PAGE_SIZE: 5,
  HEADERS: { ... },
},
```

### Step 2 — Create the scraper

`backend/src/scrapers/newCouncil.js`:
```js
const scrapeNewCouncil = async (onLog) => {
  // ... your scraping logic
  return applications; // array of objects
};
module.exports = { scrapeNewCouncil };
```

### Step 3 — Update the route

`backend/src/routes/scrape.js` — add `'newcouncil'` to the allowed tasks enum, import the scraper, and call it in the handler.

### Step 4 — Update the Mongoose model

`backend/src/models/ScrapeRun.js` — add a sub-schema and add it to `results`.

### Step 5 — Add the result card

`frontend/src/components/ResultCard.jsx` — add a `NewCouncilCard` component.

### Step 6 — Add the task card

`frontend/src/pages/Dashboard.jsx` — add an entry to the `TASKS` array:
```js
{ id: 'newcouncil', name: 'New Council', desc: '...', tags: [...] }
```

---

## 11. Common Errors & Fixes

### NSW API returns 404

The endpoint URL has changed. Fix:
1. Open `https://www.planningportal.nsw.gov.au/map` in Chrome
2. DevTools → Network → XHR
3. Apply council filter
4. Copy the real URL
5. Update `NSW.API_BASE` in `backend/src/config/index.js`

### NSW API returns 0 results but 200 OK

The filter parameter names may have changed. Check the actual XHR request body in DevTools and update `scrapeNSWPlanning.js → searchParams`.

### Hounslow POST returns no results

Date range might be outside available data. Try:
- Changing `FROM_DATE` / `TO_DATE` in config
- The form field names may have changed — inspect the POST in DevTools

### MongoDB connection refused

- Make sure MongoDB is running: `mongod`
- Or use MongoDB Atlas and set the correct `MONGO_URI` in `.env`

### CORS error in browser

Make sure:
- Backend is running on port 5000
- `server.js` allows `http://localhost:5173`
- Vite proxy target is `http://localhost:5000`

### SSE stream closes immediately

The backend crashed. Check backend terminal for error output.

### Frontend shows blank page

```bash
cd frontend && npm run dev
```
Check browser console for import errors.
