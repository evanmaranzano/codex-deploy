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
import { listenInstallerSnapshot, loadInstallerSnapshot } from "../lib/installer";

const mockedLoadInstallerSnapshot = vi.mocked(loadInstallerSnapshot);
const mockedListenInstallerSnapshot = vi.mocked(listenInstallerSnapshot);

test("renders the installer shell by default", async () => {
  render(<App />);
  expect(await screen.findByRole("heading", { name: "AI Dev Installer", level: 1 })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "全部安装" })).toBeInTheDocument();
  expect(screen.getByText("当前阶段：等待执行")).toBeInTheDocument();
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
  expect(screen.getByText("当前阶段：执行安装前检查")).toBeInTheDocument();
});

test("shows initialization failure state when snapshot loading fails", async () => {
  mockedLoadInstallerSnapshot.mockRejectedValueOnce(new Error("bridge missing"));

  render(<App />);

  expect(await screen.findByRole("heading", { name: "初始化失败", level: 2 })).toBeInTheDocument();
  expect(screen.getByRole("alert")).toHaveTextContent(
    "初始化失败：无法加载安装器状态。bridge missing"
  );
  expect(screen.getByRole("button", { name: "全部安装" })).toBeDisabled();
  expect(screen.getAllByText("初始化失败：无法加载安装器状态。bridge missing")).toHaveLength(2);
  mockedLoadInstallerSnapshot.mockClear();
});

test("shows initialization failure state when snapshot listener setup fails", async () => {
  mockedListenInstallerSnapshot.mockRejectedValueOnce(new Error("event bridge missing"));

  render(<App />);

  expect(await screen.findByRole("heading", { name: "初始化失败", level: 2 })).toBeInTheDocument();
  expect(screen.getByRole("alert")).toHaveTextContent(
    "初始化失败：无法订阅安装器状态更新。event bridge missing"
  );
  expect(screen.getByRole("button", { name: "安装 Codex" })).toBeDisabled();
  expect(screen.getByText("[FAILED]")).toBeInTheDocument();
  expect(screen.getByText("ERROR")).toBeInTheDocument();
  mockedListenInstallerSnapshot.mockClear();
});
