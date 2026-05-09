use crate::error::AppError;
use crate::models::{
    AppSettings, GeminiModelOption, SettingsConnectionResult, WritableAppSettings,
};
use crate::services::settings::SettingsService;

fn settings_service() -> SettingsService {
    SettingsService::production()
}

async fn run_blocking_settings_task<T, F>(task: F) -> Result<T, AppError>
where
    T: Send + 'static,
    F: FnOnce() -> Result<T, AppError> + Send + 'static,
{
    tauri::async_runtime::spawn_blocking(task)
        .await
        .map_err(|error| AppError {
            code: "settings_task_failed".to_string(),
            message: "Settings task failed".to_string(),
            details: Some(error.to_string()),
        })?
}

#[tauri::command]
pub async fn load_settings() -> Result<AppSettings, AppError> {
    run_blocking_settings_task(|| settings_service().load()).await
}

#[tauri::command]
pub async fn save_api_key(api_key: String) -> Result<AppSettings, AppError> {
    run_blocking_settings_task(move || settings_service().save_api_key(&api_key)).await
}

#[tauri::command]
pub async fn clear_api_key() -> Result<AppSettings, AppError> {
    run_blocking_settings_task(|| settings_service().clear_api_key()).await
}

#[tauri::command]
pub async fn save_app_settings(settings: WritableAppSettings) -> Result<AppSettings, AppError> {
    run_blocking_settings_task(move || settings_service().save_app_settings(settings)).await
}

#[tauri::command]
pub async fn test_api_key_connection() -> Result<SettingsConnectionResult, AppError> {
    run_blocking_settings_task(|| settings_service().test_api_key_connection()).await
}

#[tauri::command]
pub async fn list_available_models() -> Result<Vec<GeminiModelOption>, AppError> {
    run_blocking_settings_task(|| settings_service().list_available_models()).await
}
