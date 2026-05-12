import { useEffect, useState } from "react";
import {
  loadInstallerSnapshot,
  listenInstallerSnapshot,
  retryCurrentStage,
  retryInstallAll,
  startInstallFlow
} from "./lib/installer";
import type { InstallerSnapshot } from "./lib/types";
import { InstallerPage } from "./pages/InstallerPage";

const EMPTY_SNAPSHOT: InstallerSnapshot = {
  currentStage: "idle",
  progressPercent: 0,
  components: [
    { id: "git", label: "Git", status: "checking", detail: "等待检测", version: null },
    { id: "nodejs", label: "Node.js", status: "checking", detail: "等待检测", version: null },
    { id: "cc_switch", label: "CC Switch", status: "checking", detail: "等待检测", version: null },
    {
      id: "claude_code",
      label: "Claude Code",
      status: "checking",
      detail: "等待检测",
      version: null
    },
    { id: "codex", label: "Codex", status: "checking", detail: "等待检测", version: null }
  ],
  logs: [],
  lastError: null
};

export default function App() {
  const [snapshot, setSnapshot] = useState<InstallerSnapshot>(EMPTY_SNAPSHOT);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    let unlisten: (() => void) | undefined;

    void loadInstallerSnapshot().then((value) => {
      if (mounted) {
        setSnapshot(value);
      }
    });

    void listenInstallerSnapshot((value) => {
      setSnapshot(value);
      setIsBusy(!["idle", "completed", "failed"].includes(value.currentStage));
    }).then((dispose) => {
      unlisten = dispose;
    });

    return () => {
      mounted = false;
      unlisten?.();
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px",
        fontFamily: "\"Segoe UI\", sans-serif",
        color: "#0f172a",
        background: "linear-gradient(180deg, #f8fafc 0%, #e0f2fe 100%)"
      }}
    >
      <div
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          padding: "28px",
          borderRadius: "24px",
          background: "rgba(255, 255, 255, 0.92)",
          boxShadow: "0 24px 80px rgba(15, 23, 42, 0.12)"
        }}
      >
        <InstallerPage
          snapshot={snapshot}
          isBusy={isBusy}
          onInstallClaude={() => void startInstallFlow("install_claude")}
          onInstallCodex={() => void startInstallFlow("install_codex")}
          onInstallAll={() => void startInstallFlow("install_all")}
          onRetryStage={() => void retryCurrentStage()}
          onRetryAll={() => void retryInstallAll()}
        />
      </div>
    </main>
  );
}
