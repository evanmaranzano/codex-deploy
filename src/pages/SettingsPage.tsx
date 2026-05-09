import { useEffect, useState } from "react";
import { ApiKeyCard } from "../components/ApiKeyCard";
import type {
  AppSettings,
  GeminiModelOption,
  SettingsConnectionResult,
  WritableAppSettings
} from "../lib/types";

interface SettingsPageProps {
  settings: AppSettings;
  actionsEnabled?: boolean;
  chatModels?: GeminiModelOption[];
  imageModels?: GeminiModelOption[];
  isLoadingModels?: boolean;
  modelLoadError?: string;
  onSaveApiKey?: (apiKey: string) => Promise<void> | void;
  onClearApiKey?: () => Promise<void> | void;
  onSaveSettings?: (settings: WritableAppSettings) => Promise<void> | void;
  onTestConnection?: () => Promise<SettingsConnectionResult> | SettingsConnectionResult;
  onRefreshModels?: () => Promise<void> | void;
}

function ensureSelectedModel(
  options: GeminiModelOption[] | undefined,
  selectedModel: string
): GeminiModelOption[] {
  const modelOptions = options ?? [];
  if (modelOptions.some((option) => option.modelId === selectedModel)) {
    return modelOptions;
  }

  if (!selectedModel) {
    return modelOptions;
  }

  return [
    ...modelOptions,
    {
      modelId: selectedModel,
      displayName: `${selectedModel}（当前已保存）`,
      supportedGenerationMethods: [],
      supportsChat: true,
      supportsImage: true
    }
  ];
}

export function SettingsPage({
  settings,
  actionsEnabled = true,
  chatModels = [],
  imageModels = [],
  isLoadingModels = false,
  modelLoadError = "",
  onSaveApiKey = async () => undefined,
  onClearApiKey = async () => undefined,
  onSaveSettings = async () => undefined,
  onTestConnection = async () => ({ ok: true, message: "连接成功" }),
  onRefreshModels = async () => undefined
}: SettingsPageProps) {
  const [apiKey, setApiKey] = useState("");
  const [formState, setFormState] = useState<WritableAppSettings>({
    defaultChatModel: settings.defaultChatModel,
    defaultImageModel: settings.defaultImageModel,
    defaultExportDir: settings.defaultExportDir,
    requestTimeoutMs: settings.requestTimeoutMs
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState("");

  useEffect(() => {
      setFormState({
        defaultChatModel: settings.defaultChatModel,
        defaultImageModel: settings.defaultImageModel,
        defaultExportDir: settings.defaultExportDir,
      requestTimeoutMs: settings.requestTimeoutMs
    });
  }, [
    settings.defaultChatModel,
    settings.defaultImageModel,
    settings.defaultExportDir,
    settings.requestTimeoutMs
  ]);

  useEffect(() => {
    setConnectionMessage("");
  }, [apiKey]);

  async function handleSave() {
    setIsSaving(true);
    try {
      setConnectionMessage("");
      await onSaveApiKey(apiKey);
      setApiKey("");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleClear() {
    setIsClearing(true);
    try {
      setConnectionMessage("");
      await onClearApiKey();
      setApiKey("");
    } finally {
      setIsClearing(false);
    }
  }

  async function handleSaveSettings() {
    setIsSavingSettings(true);
    try {
      setConnectionMessage("");
      await onSaveSettings(formState);
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function handleTestConnection() {
    setIsTesting(true);
    try {
      const result = await onTestConnection();
      setConnectionMessage(result.message);
    } catch {
      setConnectionMessage("连接测试失败，请稍后重试。");
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <section style={{ display: "grid", gap: "20px" }}>
      <header>
        <h1 style={{ margin: 0 }}>设置</h1>
        <p style={{ margin: "8px 0 0", color: "#4b5563" }}>
          管理本地保存的 Google AI Studio API key。
        </p>
      </header>
        <ApiKeyCard
          status={settings.apiKeyStatus}
          value={apiKey}
          actionsEnabled={actionsEnabled}
          isSaving={isSaving}
        isClearing={isClearing}
        isTesting={isTesting}
        connectionMessage={connectionMessage}
        onChange={setApiKey}
        onSave={handleSave}
        onClear={handleClear}
          onTestConnection={handleTestConnection}
        />
      {modelLoadError ? (
        <p
          role="alert"
          style={{
            margin: 0,
            padding: "12px 14px",
            borderRadius: "12px",
            background: "#fee2e2",
            color: "#991b1b"
          }}
        >
          {modelLoadError}
        </p>
      ) : null}
      <section
        style={{
          display: "grid",
          gap: "12px",
          maxWidth: "560px",
          padding: "20px",
          borderRadius: "16px",
          background: "#ffffff",
          boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)"
        }}
        >
          <h2 style={{ margin: 0 }}>应用设置</h2>
        <label style={{ display: "grid", gap: "8px" }}>
          <span>默认聊天模型</span>
          <select
            aria-label="默认聊天模型"
            value={formState.defaultChatModel}
            disabled={!actionsEnabled || isLoadingModels}
            onChange={(event) => {
              setConnectionMessage("");
              setFormState((current) => ({
                ...current,
                defaultChatModel: event.target.value
              }));
            }}
          >
            {ensureSelectedModel(chatModels, formState.defaultChatModel).map((model) => (
              <option key={model.modelId} value={model.modelId}>
                {model.displayName}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "grid", gap: "8px" }}>
          <span>默认生图模型</span>
          <select
            aria-label="默认生图模型"
            value={formState.defaultImageModel}
            disabled={!actionsEnabled || isLoadingModels}
            onChange={(event) => {
              setConnectionMessage("");
              setFormState((current) => ({
                ...current,
                defaultImageModel: event.target.value
              }));
            }}
          >
            {ensureSelectedModel(imageModels, formState.defaultImageModel).map((model) => (
              <option key={model.modelId} value={model.modelId}>
                {model.displayName}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "grid", gap: "8px" }}>
          <span>默认导出目录</span>
          <input
            aria-label="默认导出目录"
            value={formState.defaultExportDir}
            disabled={!actionsEnabled}
            onChange={(event) => {
              setConnectionMessage("");
              setFormState((current) => ({
                ...current,
                defaultExportDir: event.target.value
              }));
            }}
          />
        </label>
        <label style={{ display: "grid", gap: "8px" }}>
          <span>请求超时（毫秒）</span>
          <input
            aria-label="请求超时（毫秒）"
            type="number"
            value={formState.requestTimeoutMs}
            disabled={!actionsEnabled}
            onChange={(event) => {
              setConnectionMessage("");
              setFormState((current) => ({
                ...current,
                requestTimeoutMs: Number(event.target.value)
              }));
            }}
          />
        </label>
        <button
          type="button"
          onClick={() => void handleSaveSettings()}
          disabled={!actionsEnabled || isSavingSettings}
          style={{
            width: "fit-content",
            padding: "10px 18px",
            border: 0,
            borderRadius: "999px",
            background: "#0f172a",
            color: "#ffffff",
            fontWeight: 600
          }}
          >
          保存设置
        </button>
        <button
          type="button"
          onClick={() => void onRefreshModels()}
          disabled={!actionsEnabled || isLoadingModels}
          style={{
            width: "fit-content",
            padding: "10px 18px",
            border: "1px solid #cbd5e1",
            borderRadius: "999px",
            background: "#ffffff",
            color: "#0f172a",
            fontWeight: 600
          }}
        >
          {isLoadingModels ? "正在刷新模型..." : "刷新模型列表"}
        </button>
      </section>
    </section>
  );
}
