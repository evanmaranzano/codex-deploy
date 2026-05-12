import type { InstallerLogEntry } from "../lib/types";

interface InstallerLogPanelProps {
  logs: InstallerLogEntry[];
}

const LEVEL_COLORS: Record<InstallerLogEntry["level"], string> = {
  info: "#0f172a",
  warn: "#b45309",
  error: "#b91c1c"
};

export function InstallerLogPanel({ logs }: InstallerLogPanelProps) {
  return (
    <section
      style={{
        display: "grid",
        gap: "12px",
        padding: "20px",
        borderRadius: "20px",
        border: "1px solid #e2e8f0",
        background: "#ffffff"
      }}
    >
      <div>
        <h2 style={{ margin: 0 }}>状态日志</h2>
        <p style={{ margin: "8px 0 0", color: "#64748b" }}>
          记录安装流程中的检查、执行和错误信息。
        </p>
      </div>
      {logs.length === 0 ? (
        <p style={{ margin: 0, color: "#64748b" }}>暂无日志，开始安装后会在这里显示。</p>
      ) : (
        <ul
          style={{
            display: "grid",
            gap: "10px",
            margin: 0,
            padding: 0,
            listStyle: "none"
          }}
        >
          {logs.map((entry, index) => (
            <li
              key={`${entry.timestamp}-${entry.stage}-${index}`}
              style={{
                padding: "12px 14px",
                borderRadius: "14px",
                background: "#f8fafc",
                color: LEVEL_COLORS[entry.level]
              }}
            >
              <strong>{entry.timestamp}</strong>
              <p style={{ margin: "6px 0 0" }}>{entry.message}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
