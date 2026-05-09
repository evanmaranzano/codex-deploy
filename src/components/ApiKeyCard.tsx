import type { ApiKeyStatus } from "../lib/types";

interface ApiKeyCardProps {
  status: ApiKeyStatus;
  value: string;
  actionsEnabled?: boolean;
  isSaving?: boolean;
  isClearing?: boolean;
  isTesting?: boolean;
  connectionMessage?: string;
  onChange: (value: string) => void;
  onSave: () => void | Promise<void>;
  onClear: () => void | Promise<void>;
  onTestConnection: () => void | Promise<void>;
}

export function ApiKeyCard({
  status,
  value,
  actionsEnabled = true,
  isSaving = false,
  isClearing = false,
  isTesting = false,
  connectionMessage,
  onChange,
  onSave,
  onClear,
  onTestConnection
}: ApiKeyCardProps) {
  return (
    <section
      style={{
        display: "grid",
        gap: "12px",
        maxWidth: "480px",
        padding: "20px",
        borderRadius: "16px",
        background: "#ffffff",
        boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)"
      }}
    >
      <div>
        <h2 style={{ margin: 0 }}>API key</h2>
        <p style={{ margin: "8px 0 0", color: "#4b5563" }}>
          当前状态：{status === "configured" ? "已配置" : "未配置"}
        </p>
      </div>
      <label htmlFor="api-key-input" style={{ display: "grid", gap: "8px" }}>
        <span>API key</span>
        <input
          id="api-key-input"
          aria-label="API key"
          type="password"
          value={value}
          disabled={!actionsEnabled}
          onChange={(event) => onChange(event.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid #d1d5db"
          }}
        />
      </label>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={!actionsEnabled || isSaving}
          style={{
            width: "fit-content",
            padding: "10px 18px",
            border: 0,
            borderRadius: "999px",
            background: "#f59e0b",
            color: "#111827",
            fontWeight: 600,
            cursor: isSaving ? "progress" : "pointer"
          }}
        >
          保存
        </button>
        <button
          type="button"
          onClick={() => void onTestConnection()}
          disabled={!actionsEnabled || isTesting || status === "missing"}
          style={{
            width: "fit-content",
            padding: "10px 18px",
            borderRadius: "999px",
            border: "1px solid #d1d5db",
            background: "#ffffff",
            color: "#374151",
            fontWeight: 600,
            cursor: isTesting ? "progress" : "pointer"
          }}
        >
          测试连接
        </button>
        <button
          type="button"
          onClick={() => void onClear()}
          disabled={!actionsEnabled || isClearing || status === "missing"}
          style={{
            width: "fit-content",
            padding: "10px 18px",
            borderRadius: "999px",
            border: "1px solid #d1d5db",
            background: "#ffffff",
            color: "#374151",
            fontWeight: 600,
            cursor: isClearing ? "progress" : "pointer"
          }}
        >
          清除
        </button>
      </div>
      {connectionMessage ? (
        <p style={{ margin: 0, color: "#4b5563" }}>{connectionMessage}</p>
      ) : null}
    </section>
  );
}
