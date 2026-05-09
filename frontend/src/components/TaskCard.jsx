import React from "react";

const THEME = {
  nsw: {
    color: "var(--nsw)",
    bg: "var(--nsw-bg)",
    glow: "var(--nsw-glow)",
    label: "Task 1",
    icon: "🌏",
  },

  hounslow: {
    color: "var(--hou)",
    bg: "var(--hou-bg)",
    glow: "var(--hou-glow)",
    label: "Task 2",
    icon: "🇬🇧",
  },

  all: {
    color: "var(--all)",
    bg: "var(--all-bg)",
    glow: "var(--all-glow)",
    label: "Both",
    icon: "🚀",
  },
};

const TaskCard = ({ task, name, desc, tags, onRun, disabled, isRunning }) => {
  const th = THEME[task];

  const [hover, setHover] = React.useState(false);

  return (
    <div
      style={{
        background: "var(--sf2)",
        border: `1px solid ${hover ? th.color : "var(--bd)"}`,
        borderRadius: "var(--radius)",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        transition: "all .2s",
        boxShadow: hover ? `0 4px 20px ${th.glow}` : "none",
        position: "relative",
        overflow: "visible",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* hover bg */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: th.bg,
          opacity: hover ? 1 : 0,
          transition: "opacity .2s",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "18px" }}>{th.icon}</span>

          <span
            style={{
              fontSize: "9px",
              padding: "2px 8px",
              borderRadius: "20px",
              background: th.bg,
              color: th.color,
              border: `1px solid ${th.color}`,
              textTransform: "uppercase",
            }}
          >
            {th.label}
          </span>
        </div>

        {/* title */}
        <div
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#fff",
            marginTop: "6px",
          }}
        >
          {name}
        </div>

        {/* desc */}
        <div
          style={{
            fontSize: "11px",
            color: "var(--muted)",
            lineHeight: 1.5,
          }}
        >
          {desc}
        </div>

        {/* tags */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "5px",
            marginTop: "8px",
          }}
        >
          {tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>

        {/* button */}
        <div style={{ marginTop: "auto", paddingTop: "12px" }}>
          <button
            onClick={() => onRun(task)}
            disabled={disabled}
            style={{
              width: "100%",
              padding: "12px",
              background: `color-mix(in srgb, ${th.color} 15%, #000)`,
              border: `1px solid ${th.color}`,
              borderRadius: "8px",
              color: th.color,
              fontSize: "11px",
              fontFamily: "var(--mono)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              opacity: disabled ? 0.45 : 1,
              cursor: disabled ? "not-allowed" : "pointer",
              position: "relative",
              zIndex: 2,
            }}
          >
            {isRunning && (
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  border: `2px solid ${th.color}`,
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin .7s linear infinite",
                }}
              />
            )}

            {isRunning ? "Running..." : `▶ Run ${name.split(" ")[0]}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export const SpinnerStyle = () => (
  <style>{`
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `}</style>
);

export default TaskCard;
