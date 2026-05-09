import { useEffect, useState } from "react";
import { MessageList } from "../components/MessageList";
import { sendChatMessage } from "../lib/chat";
import type { ChatMessage } from "../lib/types";

const EMPTY_MESSAGES: ChatMessage[] = [];

interface ChatPageProps {
  actionsEnabled?: boolean;
  defaultModel?: string;
  initialMessages?: ChatMessage[];
  onMessagesChange?: (messages: ChatMessage[]) => void;
}

export function ChatPage({
  actionsEnabled = true,
  defaultModel = "gemini-2.0-flash",
  initialMessages,
  onMessagesChange
}: ChatPageProps) {
  const syncedInitialMessages = initialMessages ?? EMPTY_MESSAGES;
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(syncedInitialMessages);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setMessages(syncedInitialMessages);
  }, [syncedInitialMessages]);

  async function handleSend() {
    const trimmedPrompt = prompt.trim();
    if (!actionsEnabled || !trimmedPrompt) {
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmedPrompt
    };

    setIsSending(true);
    try {
      setErrorMessage("");
      const response = await sendChatMessage({
        model: defaultModel,
        prompt: trimmedPrompt,
        history: messages
      });

      setMessages((current) => {
        const nextMessages = [...current, userMessage, response.message];
        onMessagesChange?.(nextMessages);
        return nextMessages;
      });
      setPrompt("");
      setErrorMessage("");
    } catch {
      setErrorMessage("发送失败，请稍后重试。");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section style={{ display: "grid", gap: "20px" }}>
      <header>
        <h1 style={{ margin: 0 }}>聊天</h1>
        <p style={{ margin: "8px 0 0", color: "#4b5563" }}>
          通过本地 Rust command 调用 Gemini 文本聊天。
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gap: "16px",
          padding: "20px",
          borderRadius: "16px",
          background: "#ffffff",
          boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)"
        }}
      >
        {errorMessage ? (
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
            {errorMessage}
          </p>
        ) : null}
        <MessageList messages={messages} />
        <label style={{ display: "grid", gap: "8px" }}>
          <span>输入消息</span>
          <textarea
            aria-label="输入消息"
            rows={5}
            value={prompt}
            disabled={!actionsEnabled}
            onChange={(event) => {
              setErrorMessage("");
              setPrompt(event.target.value);
            }}
            style={{
              resize: "vertical",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #d1d5db"
            }}
          />
        </label>
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={!actionsEnabled || isSending}
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
          发送
        </button>
      </div>
    </section>
  );
}
