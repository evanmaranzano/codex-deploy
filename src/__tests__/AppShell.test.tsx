import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";

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

test("renders the installer shell by default", async () => {
  render(<App />);
  expect(await screen.findByRole("heading", { name: "AI Dev Installer", level: 1 })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "全部安装" })).toBeInTheDocument();
});
