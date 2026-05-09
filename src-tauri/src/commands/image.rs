use crate::error::AppError;
use crate::models::ImageGenerationResponse;
use crate::services::image::{ImageRequest, ImageService};
use crate::services::settings::SettingsService;

fn image_service() -> Result<ImageService, AppError> {
    SettingsService::production().image_service()
}

#[tauri::command]
pub fn generate_image(request: ImageRequest) -> Result<ImageGenerationResponse, AppError> {
    image_service()?.generate(request)
}
