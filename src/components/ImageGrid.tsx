import type { GeneratedImage } from "../lib/types";

interface ImageGridProps {
  images: GeneratedImage[];
}

export function ImageGrid({ images }: ImageGridProps) {
  if (images.length === 0) {
    return <p style={{ margin: 0, color: "#6b7280" }}>暂时还没有生成结果。</p>;
  }

  return (
    <div
      aria-label="图片结果网格"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "16px"
      }}
    >
      {images.map((image, index) => (
        <figure
          key={`${image.mimeType}-${index}`}
          style={{
            margin: 0,
            padding: "12px",
            borderRadius: "16px",
            background: "#f8fafc"
          }}
        >
          <img
            alt={`生成结果 ${index + 1}`}
            src={`data:${image.mimeType};base64,${image.data}`}
            style={{ width: "100%", borderRadius: "12px", display: "block" }}
          />
        </figure>
      ))}
    </div>
  );
}
