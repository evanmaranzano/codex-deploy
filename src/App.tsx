import { useEffect, useState } from "react";
import { loadChatHistory } from "./lib/history";
import {
  clearApiKey,
  listAvailableModels,
  loadSettings,
  saveApiKey,
  saveAppSettings,
  testApiKeyConnection
} from "./lib/settings";
import type { AppRouteId, AppSettings, GeminiModelOption } from "./lib/types";
import { ChatPage } from "./pages/ChatPage";
import { HistoryDrawer } from "./pages/HistoryDrawer";
import { ImagePage } from "./pages/ImagePage";
import { SettingsPage } from "./pages/SettingsPage";
import { SubtitlePage } from "./pages/SubtitlePage";
import { routes } from "./routes";

export default function App() {
  const [activeRoute, setActiveRoute] = useState<AppRouteId>("chat");
  const [hasLoadedSettings, setHasLoadedSettings] = useState(false);
  const [settingsLoadError, setSettingsLoadError] = useState("");
  const [historyMessages, setHistoryMessages] = useState<
    { role: "system" | "user" | "assistant"; content: string }[]
  >([]);
  const [availableModels, setAvailableModels] = useState<GeminiModelOption[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelLoadError, setModelLoadError] = useState("");
  const [settings, setSettings] = useState<AppSettings>({
    apiKeyStatus: "missing",
    defaultChatModel: "gemini-2.0-flash",
    defaultImageModel: "gemini-2.0-flash-preview-image-generation",
    defaultExportDir: "C:/exports",
    requestTimeoutMs: 30000
  });

  useEffect(() => {
    let isMounted = true;

    void loadSettings()
      .then((loadedSettings) => {
        if (isMounted) {
          setSettings(loadedSettings);
          setHasLoadedSettings(true);
          setSettingsLoadError("");
        }
      })
      .catch(() => {
        if (isMounted) {
          setHasLoadedSettings(false);
          setSettingsLoadError("设置加载失败，请先排查本地配置或凭据存储。");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    void loadChatHistory()
      .then((messages) => {
        if (isMounted) {
          setHistoryMessages(messages);
        }
      })
      .catch(() => {
        if (isMounted) {
          setHistoryMessages([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function refreshAvailableModels() {
    if (!hasLoadedSettings || settings.apiKeyStatus !== "configured") {
      setAvailableModels([]);
      setModelLoadError("");
      return;
    }

    setIsLoadingModels(true);
    try {
      const models = await listAvailableModels();
      setAvailableModels(models);
      setModelLoadError("");
    } catch {
      setAvailableModels([]);
      setModelLoadError("模型列表加载失败，请确认 API key 可用后重试。");
    } finally {
      setIsLoadingModels(false);
    }
  }

  useEffect(() => {
    if (!hasLoadedSettings) {
      return;
    }

    if (settings.apiKeyStatus !== "configured") {
      setAvailableModels([]);
      setModelLoadError("");
      return;
    }

    void refreshAvailableModels();
  }, [hasLoadedSettings, settings.apiKeyStatus]);

  const chatModels = availableModels.filter((model) => model.supportsChat);
  const imageModels =
    availableModels.filter((model) => model.supportsImage).length > 0
      ? availableModels.filter((model) => model.supportsImage)
      : chatModels;

  let activePage = (
    <>
      <ChatPage
        defaultModel={settings.defaultChatModel}
        actionsEnabled={hasLoadedSettings}
        initialMessages={historyMessages}
        onMessagesChange={setHistoryMessages}
      />
      <HistoryDrawer messages={historyMessages} />
    </>
  );

  if (activeRoute === "image") {
    activePage = (
      <ImagePage
        defaultModel={settings.defaultImageModel}
        actionsEnabled={hasLoadedSettings}
      />
    );
  } else if (activeRoute === "subtitles") {
    activePage = (
      <SubtitlePage
        defaultModel={settings.defaultChatModel}
        actionsEnabled={hasLoadedSettings}
      />
    );
  } else if (activeRoute === "settings") {
    activePage = (
      <SettingsPage
        settings={settings}
        actionsEnabled={hasLoadedSettings}
        chatModels={chatModels}
        imageModels={imageModels}
        isLoadingModels={isLoadingModels}
        modelLoadError={modelLoadError}
        onSaveApiKey={async (apiKey) => {
          if (!hasLoadedSettings) {
            throw new Error("settings_not_loaded");
          }
          const nextSettings = await saveApiKey(apiKey);
          setSettings(nextSettings);
        }}
        onClearApiKey={async () => {
          if (!hasLoadedSettings) {
            throw new Error("settings_not_loaded");
          }
          const nextSettings = await clearApiKey();
          setSettings(nextSettings);
        }}
        onSaveSettings={async (nextSettings) => {
          if (!hasLoadedSettings) {
            throw new Error("settings_not_loaded");
          }
          const savedSettings = await saveAppSettings(nextSettings);
          setSettings(savedSettings);
        }}
        onTestConnection={async () => {
          if (!hasLoadedSettings) {
            throw new Error("settings_not_loaded");
          }
          return testApiKeyConnection();
        }}
        onRefreshModels={refreshAvailableModels}
      />
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "220px 1fr",
        minHeight: "100vh",
        fontFamily: "\"Segoe UI\", sans-serif",
        color: "#1f2937",
        background:
          "radial-gradient(circle at top left, #fef3c7 0%, #fff7ed 32%, #f8fafc 100%)"
      }}
    >
      <nav
        aria-label="主导航"
        style={{
          padding: "32px 20px",
          borderRight: "1px solid #e5e7eb",
          background: "rgba(255, 255, 255, 0.86)",
          backdropFilter: "blur(12px)"
        }}
      >
        <h1 style={{ margin: "0 0 24px", fontSize: "1.4rem" }}>MolSpark</h1>
        <ul style={{ display: "grid", gap: "12px", padding: 0, margin: 0, listStyle: "none" }}>
          {routes.map((route) => (
            <li key={route.id}>
              <button
                type="button"
                onClick={() => setActiveRoute(route.id)}
                aria-pressed={activeRoute === route.id}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: 0,
                  borderRadius: "14px",
                  background: activeRoute === route.id ? "#0f172a" : "transparent",
                  color: activeRoute === route.id ? "#ffffff" : "#0f172a",
                  textAlign: "left",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                {route.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <main style={{ padding: "32px" }}>
        <div
          aria-label="内容区域"
          style={{
            minHeight: "240px",
            borderRadius: "20px",
            background: "rgba(255, 255, 255, 0.9)",
            boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
            padding: "24px"
          }}
        >
          {settingsLoadError ? (
            <p
              role="alert"
              style={{
                marginTop: 0,
                marginBottom: "16px",
                padding: "12px 14px",
                borderRadius: "12px",
                background: "#fee2e2",
                color: "#991b1b"
              }}
            >
              {settingsLoadError}
            </p>
          ) : null}
          <div style={{ display: "grid", gap: "24px" }}>{activePage}</div>
        </div>
      </main>
    </div>
  );
}
