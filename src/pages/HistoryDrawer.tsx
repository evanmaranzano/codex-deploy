import type { ChatMessage } from "../lib/types";

interface HistoryDrawerProps {
  messages: ChatMessage[];
}

export function HistoryDrawer({ messages }: HistoryDrawerProps) {
  return (
    <aside
      aria-label="历史记录"
      style={{
        display: "grid",
        gap: "12px",
        padding: "20px",
        borderRadius: "16px",
        background: "#ffffff",
        boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)"
      }}
    >
      <h2 style={{ margin: 0 }}>历史记录</h2>
      {messages.length === 0 ? (
        <p style={{ margin: 0, color: "#6b7280" }}>暂时还没有历史消息。</p>
      ) : (
        <ul
          style={{ display: "grid", gap: "10px", padding: 0, margin: 0, listStyle: "none" }}
        >
          {messages.map((message, index) => (
            <li
              key={`${message.role}-${index}`}
              style={{
                padding: "10px 12px",
                borderRadius: "12px",
                background: "#f8fafc"
              }}
            >
              <strong style={{ display: "block", marginBottom: "4px" }}>
                {message.role === "assistant" ? "助手" : message.role === "user" ? "你" : "系统"}
              </strong>
              <span>{message.content}</span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
