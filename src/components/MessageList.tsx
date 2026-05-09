import type { ChatMessage } from "../lib/types";

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return <p style={{ margin: 0, color: "#6b7280" }}>暂时还没有消息。</p>;
  }

  return (
    <ul
      aria-label="消息列表"
      style={{ display: "grid", gap: "12px", padding: 0, margin: 0, listStyle: "none" }}
    >
      {messages.map((message, index) => (
        <li
          key={`${message.role}-${index}`}
          style={{
            padding: "12px 14px",
            borderRadius: "14px",
            background: message.role === "user" ? "#ffedd5" : "#f3f4f6"
          }}
        >
          <strong style={{ display: "block", marginBottom: "6px" }}>
            {message.role === "user"
              ? "你"
              : message.role === "assistant"
                ? "助手"
                : "系统"}
          </strong>
          <span>{message.content}</span>
        </li>
      ))}
    </ul>
  );
}
