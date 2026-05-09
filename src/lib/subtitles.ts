import { tauriInvoke } from "./tauri";
import type { TranscriptResult } from "./types";

export interface ExtractSubtitlesInput {
  model: string;
  fileName: string;
  mimeType: string;
  data: number[];
}

export function extractSubtitles(input: ExtractSubtitlesInput): Promise<TranscriptResult> {
  return tauriInvoke<TranscriptResult>("extract_subtitles", {
    request: input
  });
}
