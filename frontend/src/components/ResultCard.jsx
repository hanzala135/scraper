import React from "react";

const Field = ({ label, value }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "90px 1fr",
      gap: "8px",
      padding: "8px 0",
      borderBottom: "1px solid var(--bd)",
      fontSize: "11px",
      alignItems: "start",
    }}
  >
    <span
      style={{
        color: "var(--muted)",
        flexShrink: 0,
        fontWeight: 600,
      }}
    >
      {label}
    </span>

    <span
      style={{
        color: "var(--tx)",
        wordBreak: "break-word",
        overflowWrap: "anywhere",
        lineHeight: 1.6,
      }}
    >
      {value ?? "N/A"}
    </span>
  </div>
);

const Coord = ({ label, value }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      background: "rgba(255,255,255,.04)",
      border: "1px solid var(--bd2)",
      borderRadius: "6px",
      padding: "4px 8px",
      fontSize: "10px",
      whiteSpace: "nowrap",
      backdropFilter: "blur(4px)",
    }}
  >
    <span
      style={{
        color: "var(--muted)",
        fontWeight: 600,
      }}
    >
      {label}
    </span>

    <span
      style={{
        color: "#fff",
      }}
    >
      {value ?? "—"}
    </span>
  </span>
);

// shared card style
const cardStyle = {
  background:
    "linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.015))",
  border: "1px solid var(--bd)",
  borderRadius: "18px",
  padding: "16px",
  transition: "all .25s ease",
  animation: "cardIn .3s ease both",
  overflow: "hidden",
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  position: "relative",
  backdropFilter: "blur(10px)",
  boxShadow: "0 10px 30px rgba(0,0,0,.25)",
};

// ───────────────── NSW ─────────────────

export const NswCard = ({ app, delay = 0 }) => (
  <div
    style={{
      ...cardStyle,
      animationDelay: `${delay}s`,
      border: "1px solid rgba(0,229,160,.18)",
    }}
  >
    {/* glow */}
    <div
      style={{
        position: "absolute",
        top: "-40px",
        right: "-40px",
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        background: "rgba(0,229,160,.12)",
        filter: "blur(40px)",
        pointerEvents: "none",
      }}
    />

    {/* Header */}
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "10px",
        marginBottom: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <span
          style={{
            fontSize: "14px",
            fontWeight: 800,
            color: "#fff",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            lineHeight: 1.4,
          }}
        >
          {app.panNumber}
        </span>

        <span
          style={{
            fontSize: "10px",
            color: "var(--nsw)",
            fontWeight: 600,
            letterSpacing: ".4px",
          }}
        >
          NSW Planning Application
        </span>
      </div>

      <span
        style={{
          flexShrink: 0,
          fontSize: "9px",
          padding: "4px 10px",
          borderRadius: "999px",
          background: "rgba(0,229,160,.12)",
          color: "var(--nsw)",
          border: "1px solid rgba(0,229,160,.35)",
          textTransform: "uppercase",
          letterSpacing: ".7px",
          fontWeight: 700,
          boxShadow: "0 0 12px rgba(0,229,160,.18)",
        }}
      >
        NSW
      </span>
    </div>

    {/* Highlight Box */}
    <div
      style={{
        background: "rgba(0,229,160,.06)",
        border: "1px solid rgba(0,229,160,.14)",
        borderRadius: "12px",
        padding: "10px 12px",
        marginBottom: "4px",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          color: "var(--muted)",
          marginBottom: "4px",
          textTransform: "uppercase",
          letterSpacing: ".6px",
        }}
      >
        Application Type
      </div>

      <div
        style={{
          color: "#fff",
          fontSize: "12px",
          fontWeight: 700,
          lineHeight: 1.5,
        }}
      >
        {app.type || "N/A"}
      </div>
    </div>

    {/* Coordinates */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "90px 1fr",
        gap: "8px",
        paddingTop: "8px",
        alignItems: "start",
      }}
    >
      <span
        style={{
          color: "var(--muted)",
          fontWeight: 600,
        }}
      >
        Coordinates
      </span>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
        }}
      >
        <Coord label="lng" value={app.coordinates?.longitude} />
        <Coord label="lat" value={app.coordinates?.latitude} />
      </div>
    </div>

    <style>{`
      @keyframes cardIn {
        from {
          opacity: 0;
          transform: translateY(10px) scale(.98);
        }

        to {
          opacity: 1;
          transform: none;
        }
      }
    `}</style>
  </div>
);

// ───────────────── HOUNSLOW ─────────────────

export const HounslowCard = ({ app, delay = 0 }) => (
  <div
    style={{
      ...cardStyle,
      animationDelay: `${delay}s`,
      border: "1px solid rgba(77,184,255,.18)",
    }}
  >
    {/* glow */}
    <div
      style={{
        position: "absolute",
        top: "-40px",
        right: "-40px",
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        background: "rgba(77,184,255,.12)",
        filter: "blur(40px)",
        pointerEvents: "none",
      }}
    />

    {/* Header */}
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "10px",
        marginBottom: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <span
          style={{
            fontSize: "14px",
            fontWeight: 800,
            color: "#fff",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            lineHeight: 1.4,
          }}
        >
          {app.buildingControlApplication}
        </span>

        <span
          style={{
            fontSize: "10px",
            color: "var(--hou)",
            fontWeight: 600,
            letterSpacing: ".4px",
          }}
        >
          Hounslow Building Control
        </span>
      </div>

      <span
        style={{
          flexShrink: 0,
          fontSize: "9px",
          padding: "4px 10px",
          borderRadius: "999px",
          background: "rgba(77,184,255,.12)",
          color: "var(--hou)",
          border: "1px solid rgba(77,184,255,.35)",
          textTransform: "uppercase",
          letterSpacing: ".7px",
          fontWeight: 700,
          boxShadow: "0 0 12px rgba(77,184,255,.18)",
        }}
      >
        Hounslow
      </span>
    </div>

    {/* Highlight Description */}
    <div
      style={{
        background: "rgba(77,184,255,.06)",
        border: "1px solid rgba(77,184,255,.14)",
        borderRadius: "12px",
        padding: "10px 12px",
        marginBottom: "4px",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          color: "var(--muted)",
          marginBottom: "4px",
          textTransform: "uppercase",
          letterSpacing: ".6px",
        }}
      >
        Description Of Work
      </div>

      <div
        style={{
          color: "#fff",
          fontSize: "12px",
          fontWeight: 700,
          lineHeight: 1.6,
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}
      >
        {app.descriptionOfWork || "N/A"}
      </div>
    </div>

    {/* Coordinates */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "90px 1fr",
        gap: "8px",
        paddingTop: "8px",
        alignItems: "start",
      }}
    >
      <span
        style={{
          color: "var(--muted)",
          fontWeight: 600,
        }}
      >
        Coordinates
      </span>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
        }}
      >
        <Coord label="E" value={app.coordinates?.easting} />
        <Coord label="N" value={app.coordinates?.northing} />
      </div>
    </div>
  </div>
);