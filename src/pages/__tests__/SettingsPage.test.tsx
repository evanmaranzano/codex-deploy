import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsPage } from "../SettingsPage";

const MODEL_OPTIONS = [
  {
    modelId: "gemini-2.0-flash",
    displayName: "Gemini 2.0 Flash",
    supportedGenerationMethods: ["generateContent"],
    supportsChat: true,
    supportsImage: false
  },
  {
    modelId: "gemini-2.5-flash",
    displayName: "Gemini 2.5 Flash",
    supportedGenerationMethods: ["generateContent"],
    supportsChat: true,
    supportsImage: false
  },
  {
    modelId: "gemini-2.0-flash-preview-image-generation",
    displayName: "Gemini 2.0 Flash Preview Image Generation",
    supportedGenerationMethods: ["generateContent"],
    supportsChat: true,
    supportsImage: true
  },
  {
    modelId: "imagen-3",
    displayName: "Imagen 3",
    supportedGenerationMethods: ["generateContent"],
    supportsChat: false,
    supportsImage: true
  }
];

const BASE_SETTINGS = {
  apiKeyStatus: "configured" as const,
  defaultChatModel: "gemini-2.0-flash",
  defaultImageModel: "gemini-2.0-flash-preview-image-generation",
  defaultExportDir: "C:/exports",
  requestTimeoutMs: 30000
};

test("shows api key status and save controls", () => {
  render(
    <SettingsPage
      settings={{ ...BASE_SETTINGS, apiKeyStatus: "missing" }}
      chatModels={MODEL_OPTIONS.filter((model) => model.supportsChat)}
      imageModels={MODEL_OPTIONS.filter((model) => model.supportsImage)}
    />
  );

  expect(screen.getByRole("heading", { name: "API key", level: 2 })).toBeInTheDocument();
  expect(screen.getByText("当前状态：未配置")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "测试连接" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "清除" })).toBeDisabled();
  expect(screen.getByRole("heading", { name: "应用设置", level: 2 })).toBeInTheDocument();
});

test("shows configured status and enabled clear control", () => {
  render(
    <SettingsPage
      settings={BASE_SETTINGS}
      chatModels={MODEL_OPTIONS.filter((model) => model.supportsChat)}
      imageModels={MODEL_OPTIONS.filter((model) => model.supportsImage)}
    />
  );

  expect(screen.getByText("当前状态：已配置")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "清除" })).toBeEnabled();
});

test("submits the entered api key", async () => {
  const user = userEvent.setup();
  const onSave = vi.fn().mockResolvedValue(undefined);

  render(
    <SettingsPage
      settings={{ ...BASE_SETTINGS, apiKeyStatus: "missing" }}
      chatModels={MODEL_OPTIONS.filter((model) => model.supportsChat)}
      imageModels={MODEL_OPTIONS.filter((model) => model.supportsImage)}
      onSaveApiKey={onSave}
    />
  );

  await user.type(screen.getByLabelText("API key"), "abc123");
  await user.click(screen.getByRole("button", { name: "保存" }));

  expect(onSave).toHaveBeenCalledWith("abc123");
});

test("clears the saved api key", async () => {
  const user = userEvent.setup();
  const onClear = vi.fn().mockResolvedValue(undefined);

  render(
    <SettingsPage
      settings={BASE_SETTINGS}
      chatModels={MODEL_OPTIONS.filter((model) => model.supportsChat)}
      imageModels={MODEL_OPTIONS.filter((model) => model.supportsImage)}
      onClearApiKey={onClear}
    />
  );

  await user.click(screen.getByRole("button", { name: "清除" }));

  expect(onClear).toHaveBeenCalledTimes(1);
});

test("saves non-sensitive settings and tests connection", async () => {
  const user = userEvent.setup();
  const onSaveSettings = vi.fn().mockResolvedValue(undefined);
  const onTestConnection = vi.fn().mockResolvedValue({ ok: true, message: "连接成功" });

  render(
    <SettingsPage
      settings={BASE_SETTINGS}
      chatModels={MODEL_OPTIONS.filter((model) => model.supportsChat)}
      imageModels={MODEL_OPTIONS.filter((model) => model.supportsImage)}
      onSaveSettings={onSaveSettings}
      onTestConnection={onTestConnection}
    />
  );

  await user.selectOptions(screen.getByLabelText("默认聊天模型"), "gemini-2.5-flash");
  await user.selectOptions(
    screen.getByLabelText("默认生图模型"),
    "imagen-3"
  );
  await user.click(screen.getByRole("button", { name: "保存设置" }));
  await user.click(screen.getByRole("button", { name: "测试连接" }));

  expect(onSaveSettings).toHaveBeenCalledWith({
    defaultChatModel: "gemini-2.5-flash",
    defaultImageModel: "imagen-3",
    defaultExportDir: "C:/exports",
    requestTimeoutMs: 30000
  });
  expect(onTestConnection).toHaveBeenCalledTimes(1);
  expect(screen.getByText("连接成功")).toBeInTheDocument();
});

test("resyncs non-sensitive form values when settings prop changes", () => {
  const { rerender } = render(
    <SettingsPage
      settings={{ ...BASE_SETTINGS, apiKeyStatus: "missing" }}
      chatModels={MODEL_OPTIONS.filter((model) => model.supportsChat)}
      imageModels={MODEL_OPTIONS.filter((model) => model.supportsImage)}
    />
  );

  expect(screen.getByLabelText("默认聊天模型")).toHaveValue("gemini-2.0-flash");
  expect(screen.getByLabelText("默认导出目录")).toHaveValue("C:/exports");

  rerender(
    <SettingsPage
      settings={{
        apiKeyStatus: "configured",
        defaultChatModel: "gemini-2.5-flash",
        defaultImageModel: "imagen-3",
        defaultExportDir: "D:/workspace/exports",
        requestTimeoutMs: 15000
      }}
      chatModels={MODEL_OPTIONS.filter((model) => model.supportsChat)}
      imageModels={MODEL_OPTIONS.filter((model) => model.supportsImage)}
    />
  );

  expect(screen.getByLabelText("默认聊天模型")).toHaveValue("gemini-2.5-flash");
  expect(screen.getByLabelText("默认生图模型")).toHaveValue("imagen-3");
  expect(screen.getByLabelText("默认导出目录")).toHaveValue("D:/workspace/exports");
  expect(screen.getByLabelText("请求超时（毫秒）")).toHaveValue(15000);
});

test("shows connection test rejection message", async () => {
  const user = userEvent.setup();
  const onTestConnection = vi.fn().mockRejectedValue(new Error("network down"));

  render(
    <SettingsPage
      settings={BASE_SETTINGS}
      chatModels={MODEL_OPTIONS.filter((model) => model.supportsChat)}
      imageModels={MODEL_OPTIONS.filter((model) => model.supportsImage)}
      onTestConnection={onTestConnection}
    />
  );

  await user.click(screen.getByRole("button", { name: "测试连接" }));

  expect(screen.getByText("连接测试失败，请稍后重试。")).toBeInTheDocument();
});

test("clears stale connection message when api key or related settings change", async () => {
  const user = userEvent.setup();
  const onTestConnection = vi.fn().mockResolvedValue({ ok: true, message: "连接成功" });

  render(
    <SettingsPage
      settings={BASE_SETTINGS}
      chatModels={MODEL_OPTIONS.filter((model) => model.supportsChat)}
      imageModels={MODEL_OPTIONS.filter((model) => model.supportsImage)}
      onTestConnection={onTestConnection}
    />
  );

  await user.click(screen.getByRole("button", { name: "测试连接" }));
  expect(screen.getByText("连接成功")).toBeInTheDocument();

  await user.type(screen.getByLabelText("API key"), "abc123");
  expect(screen.queryByText("连接成功")).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "测试连接" }));
  expect(screen.getByText("连接成功")).toBeInTheDocument();

  await user.selectOptions(screen.getByLabelText("默认聊天模型"), "gemini-2.5-flash");
  expect(screen.queryByText("连接成功")).not.toBeInTheDocument();
});

test("disables risky actions when settings are not ready", () => {
  render(
    <SettingsPage
      settings={{
        apiKeyStatus: "missing",
        defaultChatModel: "gemini-2.0-flash",
        defaultImageModel: "gemini-2.0-flash-preview-image-generation",
        defaultExportDir: "C:/exports",
        requestTimeoutMs: 30000
      }}
      chatModels={MODEL_OPTIONS.filter((model) => model.supportsChat)}
      imageModels={MODEL_OPTIONS.filter((model) => model.supportsImage)}
      actionsEnabled={false}
    />
  );

  expect(screen.getByLabelText("API key")).toBeDisabled();
  expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "测试连接" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "保存设置" })).toBeDisabled();
  expect(screen.getByLabelText("默认聊天模型")).toBeDisabled();
});
