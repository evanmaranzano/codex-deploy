import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { InstallFlowKind, InstallerSnapshot } from "./types";
import { tauriInvoke } from "./tauri";

export function loadInstallerSnapshot(): Promise<InstallerSnapshot> {
  return tauriInvoke<InstallerSnapshot>("load_installer_snapshot");
}

export function refreshInstallerSnapshot(): Promise<InstallerSnapshot> {
  return tauriInvoke<InstallerSnapshot>("refresh_installer_snapshot");
}

export function startInstallFlow(flow: InstallFlowKind): Promise<void> {
  return tauriInvoke("start_install_flow", { flow });
}

export function retryCurrentStage(): Promise<void> {
  return tauriInvoke("retry_current_install_stage");
}

export function retryInstallAll(): Promise<void> {
  return tauriInvoke("retry_install_all");
}

export function listenInstallerSnapshot(
  onSnapshot: (snapshot: InstallerSnapshot) => void
): Promise<UnlistenFn> {
  return listen<InstallerSnapshot>("installer://snapshot", (event) => {
    onSnapshot(event.payload);
  });
}
