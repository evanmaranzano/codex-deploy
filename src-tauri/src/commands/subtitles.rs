use crate::error::AppError;
use crate::models::TranscriptResult;
use crate::services::settings::SettingsService;
use crate::services::subtitles::{SubtitleExtractionRequest, SubtitleService};

fn subtitle_service() -> Result<(SubtitleService, String), AppError> {
    let settings_service = SettingsService::production();
    let settings = settings_service.load()?;
    Ok((
        settings_service.subtitle_service()?,
        settings.default_export_dir,
    ))
}

#[tauri::command]
pub fn extract_subtitles(request: SubtitleExtractionRequest) -> Result<TranscriptResult, AppError> {
    let (service, export_dir) = subtitle_service()?;
    service.extract(request, export_dir)
}
