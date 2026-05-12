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

function isBusyStage(stage: InstallerSnapshot["currentStage"]) {
  return !["idle", "completed", "failed"].includes(stage);
}

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function createInitializationFailureSnapshot(message: string): InstallerSnapshot {
  return {
    currentStage: "failed",
    progressPercent: 0,
    components: EMPTY_SNAPSHOT.components.map((component) => ({
      ...component,
      status: "failed",
      detail: "初始化安装器桥接失败"
    })),
    logs: [
      {
        timestamp: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
        stage: "failed",
        level: "error",
        message
      }
    ],
    lastError: message
  };
}

export default function App() {
  const [snapshot, setSnapshot] = useState<InstallerSnapshot>(EMPTY_SNAPSHOT);
  const [isBusy, setIsBusy] = useState(false);
  const [hasInitializationError, setHasInitializationError] = useState(false);

  useEffect(() => {
    let mounted = true;
    let unlisten: (() => void) | undefined;

    const failInitialization = (message: string) => {
      if (!mounted) {
        return;
      }

      setSnapshot(createInitializationFailureSnapshot(message));
      setIsBusy(false);
      setHasInitializationError(true);
    };

    void loadInstallerSnapshot()
      .then((value) => {
        if (mounted) {
          setSnapshot(value);
          setIsBusy(isBusyStage(value.currentStage));
          setHasInitializationError(false);
        }
      })
      .catch((error: unknown) => {
        failInitialization(`初始化失败：无法加载安装器状态。${toErrorMessage(error)}`);
      });

    void listenInstallerSnapshot((value) => {
      if (!mounted) {
        return;
      }

      setSnapshot(value);
      setIsBusy(isBusyStage(value.currentStage));
      setHasInitializationError(false);
    })
      .then((dispose) => {
        unlisten = dispose;
      })
      .catch((error: unknown) => {
        failInitialization(`初始化失败：无法订阅安装器状态更新。${toErrorMessage(error)}`);
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
          hasInitializationError={hasInitializationError}
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
