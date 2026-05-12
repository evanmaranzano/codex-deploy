import { InstallerLogPanel } from "../components/InstallerLogPanel";
import { InstallerProgressPanel } from "../components/InstallerProgressPanel";
import { InstallerStatusCard } from "../components/InstallerStatusCard";
import type { InstallerSnapshot } from "../lib/types";

interface InstallerPageProps {
  snapshot: InstallerSnapshot;
  isBusy: boolean;
  onInstallClaude: () => void;
  onInstallCodex: () => void;
  onInstallAll: () => void;
  onRetryStage: () => void;
  onRetryAll: () => void;
}

export function InstallerPage({
  snapshot,
  isBusy,
  onInstallClaude,
  onInstallCodex,
  onInstallAll,
  onRetryStage,
  onRetryAll
}: InstallerPageProps) {
  return (
    <section style={{ display: "grid", gap: "24px" }}>
      <header>
        <h1 style={{ margin: 0 }}>AI Dev Installer</h1>
        <p style={{ margin: "8px 0 0", color: "#475569" }}>
          Windows 一键安装 Git、Node.js、CC Switch、Claude Code 和 Codex。
        </p>
      </header>
      <InstallerProgressPanel snapshot={snapshot} />
      <section style={{ display: "grid", gap: "12px" }}>
        <h2 style={{ margin: 0 }}>组件状态</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px"
          }}
        >
          {snapshot.components.map((component) => (
            <InstallerStatusCard key={component.id} component={component} />
          ))}
        </div>
      </section>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button type="button" disabled={isBusy} onClick={onInstallClaude}>
          安装 Claude Code
        </button>
        <button type="button" disabled={isBusy} onClick={onInstallCodex}>
          安装 Codex
        </button>
        <button type="button" disabled={isBusy} onClick={onInstallAll}>
          全部安装
        </button>
        <button
          type="button"
          disabled={isBusy || snapshot.currentStage !== "failed"}
          onClick={onRetryStage}
        >
          重试当前阶段
        </button>
        <button
          type="button"
          disabled={isBusy || snapshot.currentStage !== "failed"}
          onClick={onRetryAll}
        >
          重新执行全部安装
        </button>
      </div>
      <InstallerLogPanel logs={snapshot.logs} />
    </section>
  );
}
