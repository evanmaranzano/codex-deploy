import { useState } from "react";
import { ImageGrid } from "../components/ImageGrid";
import { generateImage } from "../lib/image";
import type { GeneratedImage } from "../lib/types";

interface ImagePageProps {
  actionsEnabled?: boolean;
  defaultModel?: string;
}

export function ImagePage({
  actionsEnabled = true,
  defaultModel = "gemini-2.0-flash-preview-image-generation"
}: ImagePageProps) {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleGenerate() {
    const trimmedPrompt = prompt.trim();
    if (!actionsEnabled || !trimmedPrompt) {
      return;
    }

    setIsGenerating(true);
    try {
      setErrorMessage("");
      const response = await generateImage({
        model: defaultModel,
        prompt: trimmedPrompt,
        count: 1,
        aspectRatio: "1:1"
      });

      setImages(response.images);
      setErrorMessage("");
    } catch {
      setErrorMessage("生成失败，请稍后重试。");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section style={{ display: "grid", gap: "20px" }}>
      <header>
        <h1 style={{ margin: 0 }}>生图</h1>
        <p style={{ margin: "8px 0 0", color: "#4b5563" }}>
          通过本地 Rust command 调用 Gemini 图片生成。
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
        <label style={{ display: "grid", gap: "8px" }}>
          <span>输入图片提示词</span>
          <textarea
            aria-label="输入图片提示词"
            rows={4}
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
          onClick={() => void handleGenerate()}
          disabled={!actionsEnabled || isGenerating}
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
          生成
        </button>
        <ImageGrid images={images} />
      </div>
    </section>
  );
}
