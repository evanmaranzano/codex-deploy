import type { InstallerComponentState } from "../lib/types";

interface InstallerStatusCardProps {
  component: InstallerComponentState;
}

const STATUS_LABELS: Record<InstallerComponentState["status"], string> = {
  not_installed: "未安装",
  checking: "检测中",
  installing: "安装中",
  installed: "已安装",
  failed: "失败",
  skipped: "已跳过"
};

const STATUS_COLORS: Record<InstallerComponentState["status"], string> = {
  not_installed: "#64748b",
  checking: "#2563eb",
  installing: "#ea580c",
  installed: "#16a34a",
  failed: "#dc2626",
  skipped: "#7c3aed"
};

export function InstallerStatusCard({ component }: InstallerStatusCardProps) {
  return (
    <article
      aria-label={`${component.label} 状态`}
      style={{
        display: "grid",
        gap: "12px",
        padding: "18px",
        borderRadius: "18px",
        border: "1px solid #dbe7f3",
        background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
        minWidth: 0
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px"
        }}
      >
        <strong style={{ fontSize: "1.05rem", lineHeight: 1.3 }}>{component.label}</strong>
        <span
          style={{
            color: STATUS_COLORS[component.status],
            fontWeight: 700,
            flexShrink: 0,
            textAlign: "right"
          }}
        >
          {STATUS_LABELS[component.status]}
        </span>
      </div>
      <p
        style={{
          margin: 0,
          color: "#334155",
          lineHeight: 1.6,
          overflowWrap: "anywhere",
          wordBreak: "break-word"
        }}
      >
        {component.detail}
      </p>
      <p style={{ margin: 0, color: "#64748b", fontSize: "0.92rem" }}>
        版本：{component.version ?? "未知"}
      </p>
    </article>
  );
}
