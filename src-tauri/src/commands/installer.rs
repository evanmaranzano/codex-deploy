use crate::error::AppError;
use crate::models::installer::InstallerSnapshot;
use crate::services::installer::service::InstallerService;
use tauri::AppHandle;

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

#[tauri::command]
pub async fn start_install_flow(app: AppHandle, flow: String) -> Result<(), AppError> {
    tauri::async_runtime::spawn(async move {
        let service = InstallerService::production();
        let _ = service.run_flow(&app, &flow).await;
    });

    Ok(())
}

#[tauri::command]
pub async fn retry_current_install_stage(app: AppHandle) -> Result<(), AppError> {
    tauri::async_runtime::spawn(async move {
        let service = InstallerService::production();
        let _ = service.retry_current_stage(&app).await;
    });

    Ok(())
}

#[tauri::command]
pub async fn retry_install_all(app: AppHandle) -> Result<(), AppError> {
    tauri::async_runtime::spawn(async move {
        let service = InstallerService::production();
        let _ = service.run_flow(&app, "install_all").await;
    });

    Ok(())
}
