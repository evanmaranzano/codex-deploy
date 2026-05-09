import { tauriInvoke } from "./tauri";
import type { ImageGenerationResponse } from "./types";

export interface GenerateImageInput {
  model: string;
  prompt: string;
  count: number;
  aspectRatio: string;
}

export function generateImage(input: GenerateImageInput): Promise<ImageGenerationResponse> {
  return tauriInvoke<ImageGenerationResponse>("generate_image", {
    request: input
  });
}
