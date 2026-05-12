import type { InstallerSnapshot } from "../lib/types";

interface InstallerProgressPanelProps {
  snapshot: InstallerSnapshot;
  hasInitializationError: boolean;
}

const STAGE_LABELS: Record<InstallerSnapshot["currentStage"], string> = {
  idle: "等待执行",
  preflight: "执行安装前检查",
  install_git: "安装 Git",
  install_node: "安装 Node.js",
  install_cc_switch: "安装 CC Switch",
  refresh_environment: "刷新环境变量",
  install_claude_code: "安装 Claude Code",
  install_codex: "安装 Codex",
  verify: "验证安装结果",
  completed: "安装完成",
  failed: "安装失败"
};

export function InstallerProgressPanel({
  snapshot,
  hasInitializationError
}: InstallerProgressPanelProps) {
  const progressValue = Math.max(0, Math.min(100, snapshot.progressPercent));

  return (
    <section
      aria-label="安装进度"
      style={{
        display: "grid",
        gap: "12px",
        padding: "20px",
        borderRadius: "20px",
        background: "#eff6ff",
        border: "1px solid #bfdbfe"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
        <div>
          <h2 style={{ margin: 0 }}>安装进度</h2>
          {hasInitializationError ? (
            <h2 style={{ margin: "8px 0 0", color: "#991b1b", fontSize: "1rem" }}>初始化失败</h2>
          ) : null}
          <p style={{ margin: "8px 0 0", color: "#1d4ed8" }}>
            当前阶段：{STAGE_LABELS[snapshot.currentStage]}
          </p>
        </div>
        <strong style={{ fontSize: "1.2rem", color: "#0f172a" }}>{progressValue}%</strong>
      </div>
      <div
        aria-hidden="true"
        style={{
          height: "12px",
          borderRadius: "999px",
          background: "rgba(37, 99, 235, 0.16)",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: `${progressValue}%`,
            height: "100%",
            borderRadius: "999px",
            background: "linear-gradient(90deg, #2563eb 0%, #0ea5e9 100%)"
          }}
        />
      </div>
      {snapshot.lastError ? (
        <p
          role="alert"
          style={{
            margin: 0,
            padding: "12px 14px",
            borderRadius: "12px",
            background: "#fee2e2",
            color: "#991b1b"
          }}
        >
          {snapshot.lastError}
        </p>
      ) : null}
    </section>
  );
}
