import React, { useEffect, useRef } from "react";

const LEVEL_COLOR = {
  info: "var(--tx)",
  success: "var(--ok)",
  error: "var(--err)",
  warn: "var(--warn)",
};

const Terminal = ({ logs, onClear }) => {
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [logs]);

  const fmt = (d) =>
    [d.getHours(), d.getMinutes(), d.getSeconds()]
      .map((n) => String(n).padStart(2, "0"))
      .join(":");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        maxHeight: "100%",
        border: "1px solid var(--bd)",
        borderRadius: "10px",
        overflow: "hidden",
        background: "#06080b",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: "38px",
          flexShrink: 0,
          background: "var(--sf2)",
          borderBottom: "1px solid var(--bd)",
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
        }}
      >
        <div style={{ display: "flex", gap: "6px" }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div
              key={c}
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: c,
              }}
            />
          ))}
        </div>

        <span
          style={{
            fontSize: "11px",
            color: "var(--muted)",
            marginLeft: "10px",
          }}
        >
          scrapekit / terminal
        </span>

        <button
          onClick={onClear}
          style={{
            marginLeft: "auto",
            background: "transparent",
            border: "1px solid var(--bd2)",
            color: "var(--muted)",
            fontSize: "10px",
            padding: "4px 10px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>

      {/* Body */}
      <div
        ref={bodyRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 14px",
          fontSize: "12px",
          lineHeight: "1.6",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        {logs.length === 0 && (
          <div style={{ color: "var(--muted)" }}>
            <span style={{ color: "var(--nsw)" }}>$</span> ScrapeKit ready —
            select a task and click Run.
          </div>
        )}

        {logs.map((l, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "4px",
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
            }}
          >
            <span style={{ color: "var(--dim)", flexShrink: 0 }}>
              {fmt(l.t)}
            </span>

            <span
              style={{
                color: LEVEL_COLOR[l.level] ?? "var(--tx)",
              }}
            >
              {l.msg}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Terminal;
