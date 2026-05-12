use crate::error::AppError;
use crate::models::installer::InstallerSnapshot;
use crate::services::installer::service::InstallerService;

#[tauri::command]
pub async fn load_installer_snapshot() -> Result<InstallerSnapshot, AppError> {
    tauri::async_runtime::spawn_blocking(|| InstallerService::production().load_snapshot())
        .await
        .map_err(|error| AppError {
            code: "installer_task_failed".into(),
            message: "Installer task failed".into(),
            details: Some(error.to_string()),
        })?
}
