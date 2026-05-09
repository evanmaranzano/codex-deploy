import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectTypeOf } from "vitest";
import type {
  AppSettings,
  ChatMessage,
  GeminiModelOption,
  ImageGenerationResponse,
  TranscriptResult
} from "../lib/types";

vi.mock("../lib/settings", () => ({
  clearApiKey: vi.fn(),
  loadSettings: vi.fn().mockResolvedValue({
    apiKeyStatus: "configured",
    defaultChatModel: "gemini-2.0-flash",
    defaultImageModel: "gemini-2.0-flash-preview-image-generation",
    defaultExportDir: "C:/exports",
    requestTimeoutMs: 30000
  }),
  saveApiKey: vi.fn(),
  saveAppSettings: vi.fn(),
  listAvailableModels: vi.fn().mockResolvedValue([
    {
      modelId: "gemini-2.0-flash",
      displayName: "Gemini 2.0 Flash",
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
    }
  ] satisfies GeminiModelOption[]),
  testApiKeyConnection: vi.fn()
}));

vi.mock("../lib/history", () => ({
  loadChatHistory: vi.fn().mockResolvedValue([
    { role: "user", content: "已保存的历史消息" }
  ])
}));

import App from "../App";
import { loadChatHistory } from "../lib/history";
import { listAvailableModels, loadSettings } from "../lib/settings";

const mockedLoadSettings = vi.mocked(loadSettings);
const mockedLoadChatHistory = vi.mocked(loadChatHistory);
const mockedListAvailableModels = vi.mocked(listAvailableModels);

test("renders the tool-first nav shell and switches pages from the sidebar", async () => {
  const user = userEvent.setup();
  render(<App />);

  await waitFor(() => {
    expect(mockedLoadSettings).toHaveBeenCalledTimes(1);
    expect(mockedLoadChatHistory).toHaveBeenCalledTimes(1);
    expect(mockedListAvailableModels).toHaveBeenCalledTimes(1);
  });

  expect(screen.getByRole("navigation")).toHaveTextContent("聊天");
  expect(screen.getByRole("navigation")).toHaveTextContent("生图");
  expect(screen.getByRole("navigation")).toHaveTextContent("字幕提取");
  expect(screen.getByRole("navigation")).toHaveTextContent("设置");
  expect(screen.getByRole("heading", { name: "聊天", level: 1 })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "历史记录", level: 2 })).toBeInTheDocument();
  expect(
    within(screen.getByRole("complementary", { name: "历史记录" })).getByText(
      "已保存的历史消息"
    )
  ).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "生图" }));
  expect(screen.getByRole("heading", { name: "生图", level: 1 })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "聊天", level: 1 })).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "设置" }));
  expect(screen.getByRole("heading", { name: "设置", level: 1 })).toBeInTheDocument();
});

test("exports a transcript wire contract shape", () => {
  expectTypeOf<TranscriptResult>().toMatchTypeOf<{
    segments: {
      startMs: number;
      endMs: number;
      text: string;
    }[];
    artifact: {
      path: string;
      kind: "srt";
    };
  }>();
});

test("exports a shared chat role contract", () => {
  expectTypeOf<ChatMessage>().toMatchTypeOf<{
    role: "system" | "user" | "assistant";
    content: string;
  }>();
});

test("exports model option contract", () => {
  expectTypeOf<GeminiModelOption>().toMatchTypeOf<{
    modelId: string;
    displayName: string;
    supportedGenerationMethods: string[];
    supportsChat: boolean;
    supportsImage: boolean;
  }>();
});

test("exports app settings with api key status contract", () => {
  expectTypeOf<AppSettings>().toMatchTypeOf<{
    apiKeyStatus: "missing" | "configured";
    defaultChatModel: string;
    defaultImageModel: string;
    defaultExportDir: string;
    requestTimeoutMs: number;
  }>();
});

test("exports image generation response with camelCase wire fields", () => {
  expectTypeOf<ImageGenerationResponse>().toMatchTypeOf<{
    images: {
      mimeType: string;
      data: string;
    }[];
  }>();
});
