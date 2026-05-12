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
        gap: "10px",
        padding: "16px",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        background: "#ffffff"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
        <strong>{component.label}</strong>
        <span
          style={{
            color: STATUS_COLORS[component.status],
            fontWeight: 700
          }}
        >
          {STATUS_LABELS[component.status]}
        </span>
      </div>
      <p style={{ margin: 0, color: "#475569" }}>{component.detail}</p>
      <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
        版本：{component.version ?? "未知"}
      </p>
    </article>
  );
}
