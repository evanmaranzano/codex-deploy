use crate::models::SubtitleSegment;

fn format_timestamp(ms: u64) -> String {
    let hours = ms / 3_600_000;
    let minutes = (ms % 3_600_000) / 60_000;
    let seconds = (ms % 60_000) / 1_000;
    let millis = ms % 1_000;

    format!("{hours:02}:{minutes:02}:{seconds:02},{millis:03}")
}

pub fn render_srt(segments: &[SubtitleSegment]) -> String {
    segments
        .iter()
        .enumerate()
        .map(|(index, segment)| {
            format!(
                "{}\n{} --> {}\n{}\n",
                index + 1,
                format_timestamp(segment.start_ms),
                format_timestamp(segment.end_ms),
                segment.text
            )
        })
        .collect::<Vec<_>>()
        .join("\n")
}
