import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InstallerPage } from "../InstallerPage";

test("renders installer actions, component states, and log panel", async () => {
  const user = userEvent.setup();
  const onInstallAll = vi.fn();

  render(
    <InstallerPage
      snapshot={{
        currentStage: "idle",
        progressPercent: 0,
        components: [
          { id: "git", label: "Git", status: "not_installed", detail: "未检测", version: null },
          {
            id: "nodejs",
            label: "Node.js",
            status: "not_installed",
            detail: "未检测",
            version: null
          },
          {
            id: "cc_switch",
            label: "CC Switch",
            status: "not_installed",
            detail: "未检测",
            version: null
          },
          {
            id: "claude_code",
            label: "Claude Code",
            status: "not_installed",
            detail: "未检测",
            version: null
          },
          { id: "codex", label: "Codex", status: "not_installed", detail: "未检测", version: null }
        ],
        logs: [],
        lastError: null
      }}
      isBusy={false}
      onInstallClaude={vi.fn()}
      onInstallCodex={vi.fn()}
      onInstallAll={onInstallAll}
      onRetryStage={vi.fn()}
      onRetryAll={vi.fn()}
    />
  );

  expect(screen.getByRole("heading", { name: "AI Dev Installer", level: 1 })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "安装 Claude Code" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "安装 Codex" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "全部安装" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "状态日志", level: 2 })).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "全部安装" }));
  expect(onInstallAll).toHaveBeenCalledTimes(1);
});
