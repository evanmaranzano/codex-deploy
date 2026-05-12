import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import type { InstallStageId } from "../lib/types";

vi.mock("../lib/installer", () => ({
  loadInstallerSnapshot: vi.fn().mockResolvedValue({
    currentStage: "idle",
    progressPercent: 0,
    components: [],
    logs: [],
    lastError: null
  }),
  listenInstallerSnapshot: vi.fn().mockResolvedValue(() => undefined),
  retryCurrentStage: vi.fn(),
  retryInstallAll: vi.fn(),
  startInstallFlow: vi.fn()
}));

import App from "../App";
import { loadInstallerSnapshot } from "../lib/installer";

const mockedLoadInstallerSnapshot = vi.mocked(loadInstallerSnapshot);

test("renders the installer shell by default", async () => {
  render(<App />);
  expect(await screen.findByRole("heading", { name: "AI Dev Installer", level: 1 })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "全部安装" })).toBeInTheDocument();
});

test("disables install actions when the initial snapshot is already running", async () => {
  mockedLoadInstallerSnapshot.mockResolvedValueOnce({
    currentStage: "preflight" satisfies InstallStageId,
    progressPercent: 10,
    components: [],
    logs: [],
    lastError: null
  });

  render(<App />);

  expect(await screen.findByRole("heading", { name: "AI Dev Installer", level: 1 })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "全部安装" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "安装 Claude Code" })).toBeDisabled();
});
