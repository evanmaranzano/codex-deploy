import { tauriInvoke } from "./tauri";
import type { ChatMessage, ChatResponse } from "./types";

export interface SendChatMessageInput {
  model: string;
  prompt: string;
  history: ChatMessage[];
}

export function sendChatMessage(input: SendChatMessageInput): Promise<ChatResponse> {
  return tauriInvoke<ChatResponse>("send_chat_message", { request: input });
}
