import { tauriInvoke } from "./tauri";
import type { ChatMessage } from "./types";

export function loadChatHistory(): Promise<ChatMessage[]> {
  return tauriInvoke<ChatMessage[]>("list_chat_history");
}
