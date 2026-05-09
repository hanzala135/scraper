import React, { useState, useCallback } from "react";
import TaskCard, { SpinnerStyle } from "../components/TaskCard";
import Terminal from "../components/Terminal";
import { NswCard, HounslowCard } from "../components/ResultCard";
import { useScraper } from "../hooks/useScraper";

const TASKS = [
  {
    id: "nsw",
    name: "NSW Planning Portal",
    desc: "Scrapes planning applications via API.",
    tags: ["PAN Number", "Type", "Geometry"],
  },
  {
    id: "hounslow",
    name: "Hounslow Building Control",
    desc: "Scrapes BC applications via parsing.",
    tags: ["BC App #", "Description", "Coordinates"],
  },
  {
    id: "all",
    name: "Run All Tasks",
    desc: "Runs both scrapers sequentially.",
    tags: ["NSW + Hounslow"],
  },
];

const Dashboard = ({ onRunComplete }) => {
  const [showJSON, setShowJSON] = useState(false);

  const { running, logs, results, task, error, run, reset } =
    useScraper(onRunComplete);

  const handleRun = useCallback(
    (t) => {
      setShowJSON(false);
      run(t);
    },
    [run],
  );

  const nswApps = results?.nswPlanning || [];
  const houApps = results?.hounslowBuilding || [];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <SpinnerStyle />

      {/* ───────── SIDEBAR ───────── */}
      <aside
        style={{
          background: "var(--sf)",
          borderRight: "1px solid var(--bd)",
          padding: "20px 16px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          minHeight: 0,
        }}
      >
        <div style={{ fontSize: "10px", color: "var(--muted)" }}>Tasks</div>

        {TASKS.map((t) => (
          <TaskCard
            key={t.id}
            task={t.id}
            name={t.name}
            desc={t.desc}
            tags={t.tags}
            onRun={handleRun}
            disabled={running}
          />
        ))}
      </aside>

      {/* ───────── RIGHT PANEL ───────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          minHeight: 0, // ⭐ IMPORTANT
          overflow: "hidden",
        }}
      >
        {/* TERMINAL */}
        <div style={{ flexShrink: 0, height: 220 }}>
          <Terminal logs={logs} onClear={reset} />
        </div>

        {/* PROGRESS BAR */}
        {running && (
          <div style={{ height: 2, flexShrink: 0 }}>
            <div
              style={{
                height: "100%",
                background:
                  "linear-gradient(90deg,var(--nsw),var(--hou),var(--all))",
                backgroundSize: "300% 100%",
                animation: "pgbar 1.6s linear infinite",
              }}
            />
          </div>
        )}

        {/* ───────── SCROLLABLE RESULTS AREA ───────── */}
        <div
          style={{
            flex: 1,
            minHeight: 0, // ⭐ CRITICAL FIX
            overflowY: "auto",
            marginBottom: 0,
            padding: "20px 24px",
            paddingBottom: "100px",
          }}
        >
          {error && (
            <div style={{ color: "red", marginBottom: 10 }}>❌ {error}</div>
          )}

          {!results && !error && (
            <div style={{ color: "var(--muted)" }}>
              Run scraper to see results
            </div>
          )}

          {results && (
            <>
              {/* HEADER */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 40,
                  alignItems: "center",
                }}
              >
                <div style={{ color: "#fff", fontWeight: 700 }}>
                  {task === "nsw"
                    ? "NSW Planning"
                    : task === "hounslow"
                      ? "Hounslow Building"
                      : "All Tasks"}
                </div>

                <button
                  onClick={() => setShowJSON((v) => !v)}
                  style={{
                    border: "1px solid var(--bd)",
                    background: "transparent",
                    color: "#fff",
                    padding: "4px 10px",
                    fontSize: "10px",
                    borderRadius: 5,
                    cursor: "pointer",
                  }}
                >
                  {showJSON ? "Hide JSON" : "{ } JSON"}
                </button>
              </div>

              {/* CARDS GRID (FIXED DISPLAY) */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "12px",
                  alignItems: "stretch",
                  width: "100%",
                }}
              >
                {nswApps.map((app, i) => (
                  <NswCard key={`nsw-${i}`} app={app} />
                ))}

                {houApps.map((app, i) => (
                  <HounslowCard key={`hou-${i}`} app={app} />
                ))}
              </div>

              {/* JSON VIEW */}
              {showJSON && (
                <pre
                  style={{
                    marginTop: 16,
                    background: "#080a0d",
                    border: "1px solid var(--bd)",
                    borderRadius: 8,
                    padding: 16,
                    fontSize: 11,
                    color: "#a8c4d8",
                    overflowX: "auto",
                  }}
                >
                  {JSON.stringify(results ?? {}, null, 2)}
                </pre>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
