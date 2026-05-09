export type AppRouteId = "chat" | "image" | "subtitles" | "settings";

export interface AppRoute {
  id: AppRouteId;
  label: string;
}

export type ApiKeyStatus = "missing" | "configured";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  message: ChatMessage;
}

export interface GeneratedImage {
  mimeType: string;
  data: string;
}

export interface ImageGenerationResponse {
  images: GeneratedImage[];
}

export interface SubtitleSegment {
  startMs: number;
  endMs: number;
  text: string;
}

export interface ExportArtifact {
  path: string;
  kind: "srt";
}

export interface TranscriptResult {
  segments: SubtitleSegment[];
  artifact: ExportArtifact;
}

export interface AppSettings {
  apiKeyStatus: ApiKeyStatus;
  defaultChatModel: string;
  defaultImageModel: string;
  defaultExportDir: string;
  requestTimeoutMs: number;
}

export interface GeminiModelOption {
  modelId: string;
  displayName: string;
  supportedGenerationMethods: string[];
  supportsChat: boolean;
  supportsImage: boolean;
}

export interface AppError {
  code: string;
  message: string;
  details: string | null;
}

export interface SettingsConnectionResult {
  ok: boolean;
  message: string;
}

export interface WritableAppSettings {
  defaultChatModel: string;
  defaultImageModel: string;
  defaultExportDir: string;
  requestTimeoutMs: number;
}
