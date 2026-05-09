import { tauriInvoke } from "./tauri";
import type {
  AppSettings,
  GeminiModelOption,
  SettingsConnectionResult,
  WritableAppSettings
} from "./types";

export function loadSettings(): Promise<AppSettings> {
  return tauriInvoke<AppSettings>("load_settings");
}

export function saveApiKey(apiKey: string): Promise<AppSettings> {
  return tauriInvoke<AppSettings>("save_api_key", { apiKey });
}

export function clearApiKey(): Promise<AppSettings> {
  return tauriInvoke<AppSettings>("clear_api_key");
}

export function saveAppSettings(settings: WritableAppSettings): Promise<AppSettings> {
  return tauriInvoke<AppSettings>("save_app_settings", { settings });
}

export function testApiKeyConnection(): Promise<SettingsConnectionResult> {
  return tauriInvoke<SettingsConnectionResult>("test_api_key_connection");
}

export function listAvailableModels(): Promise<GeminiModelOption[]> {
  return tauriInvoke<GeminiModelOption[]>("list_available_models");
}
