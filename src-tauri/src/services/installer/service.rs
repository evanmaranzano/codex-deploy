use crate::error::AppError;
use crate::models::installer::{InstallStageId, InstallerLogEntry, InstallerSnapshot};
use crate::services::installer::environment::{
    build_initial_snapshot, DetectExecutionEnvironment,
};
use crate::services::installer::executor::stage_sequence;
use tauri::{AppHandle, Emitter};

pub struct InstallerService;

impl InstallerService {
    pub fn production() -> Self {
        Self
    }

    pub fn load_snapshot(&self) -> Result<InstallerSnapshot, AppError> {
        Ok(build_initial_snapshot(&DetectExecutionEnvironment))
    }

    pub fn snapshot_updates_for(&self, flow: &str) -> Result<Vec<InstallerSnapshot>, AppError> {
        let mut snapshot = self.load_snapshot()?;
        let stages = stage_sequence(flow);
        let stage_count = stages.len();
        let mut snapshots = Vec::with_capacity(stage_count + 1);

        for (index, stage) in stages.iter().enumerate() {
            snapshot.current_stage = stage.clone();
            snapshot.progress_percent = (((index + 1) * 100) / (stage_count + 1)) as u8;
            snapshot.last_error = None;
            snapshot.logs.push(InstallerLogEntry {
                timestamp: format!("stage-{:02}", index + 1),
                stage: stage.clone(),
                level: "info".into(),
                message: format!("进入阶段 {}", format_stage(stage)),
            });
            snapshots.push(snapshot.clone());
        }

        snapshot.current_stage = InstallStageId::Completed;
        snapshot.progress_percent = 100;
        snapshot.last_error = None;
        snapshot.logs.push(InstallerLogEntry {
            timestamp: format!("stage-{:02}", stage_count + 1),
            stage: InstallStageId::Completed,
            level: "info".into(),
            message: "安装流程完成".into(),
        });
        snapshots.push(snapshot);

        Ok(snapshots)
    }

    pub fn retry_snapshots_for_stage(
        &self,
        failed_stage: InstallStageId,
    ) -> Result<Vec<InstallerSnapshot>, AppError> {
        let mut snapshot = self.load_snapshot()?;
        let flow = match failed_stage {
            InstallStageId::InstallCodex => "install_codex",
            InstallStageId::InstallClaudeCode => "install_claude",
            _ => "install_all",
        };
        let stages = stage_sequence(flow);
        let retry_start = stages
            .iter()
            .position(|stage| *stage == failed_stage)
            .unwrap_or(0);
        let retry_stages = &stages[retry_start..];
        let stage_count = retry_stages.len();
        let mut snapshots = Vec::with_capacity(stage_count + 1);

        for (index, stage) in retry_stages.iter().enumerate() {
            snapshot.current_stage = stage.clone();
            snapshot.progress_percent = (((index + 1) * 100) / (stage_count + 1)) as u8;
            snapshot.last_error = None;
            snapshot.logs.push(InstallerLogEntry {
                timestamp: format!("retry-{:02}", index + 1),
                stage: stage.clone(),
                level: "info".into(),
                message: format!("重试阶段 {}", format_stage(stage)),
            });
            snapshots.push(snapshot.clone());
        }

        snapshot.current_stage = InstallStageId::Completed;
        snapshot.progress_percent = 100;
        snapshot.last_error = None;
        snapshot.logs.push(InstallerLogEntry {
            timestamp: format!("retry-{:02}", stage_count + 1),
            stage: InstallStageId::Completed,
            level: "info".into(),
            message: "重试流程完成".into(),
        });
        snapshots.push(snapshot);

        Ok(snapshots)
    }

    pub async fn run_flow(&self, app: &AppHandle, flow: &str) -> Result<(), AppError> {
        for snapshot in self.snapshot_updates_for(flow)? {
            app.emit("installer://snapshot", snapshot)
                .map_err(Self::emit_error)?;
        }

        Ok(())
    }

    pub async fn retry_current_stage(&self, app: &AppHandle) -> Result<(), AppError> {
        let snapshot = self.load_snapshot()?;
        let failed_stage = if snapshot.current_stage == InstallStageId::Failed {
            snapshot
                .logs
                .iter()
                .rev()
                .find_map(|entry| {
                    if entry.stage != InstallStageId::Failed {
                        Some(entry.stage.clone())
                    } else {
                        None
                    }
                })
                .unwrap_or(InstallStageId::Preflight)
        } else {
            snapshot.current_stage.clone()
        };

        for retry_snapshot in self.retry_snapshots_for_stage(failed_stage)? {
            app.emit("installer://snapshot", retry_snapshot)
                .map_err(Self::emit_error)?;
        }

        Ok(())
    }

    pub fn stage_sequence_for(&self, flow: &str) -> Vec<String> {
        stage_sequence(flow)
            .into_iter()
            .map(|stage| format!("{stage:?}"))
            .collect()
    }

    fn emit_error(error: impl ToString) -> AppError {
        AppError {
            code: "installer_emit_failed".into(),
            message: "Failed to emit installer snapshot".into(),
            details: Some(error.to_string()),
        }
    }
}

fn format_stage(stage: &InstallStageId) -> &'static str {
    match stage {
        InstallStageId::Idle => "idle",
        InstallStageId::Preflight => "preflight",
        InstallStageId::InstallGit => "install_git",
        InstallStageId::InstallNode => "install_node",
        InstallStageId::InstallCcSwitch => "install_cc_switch",
        InstallStageId::RefreshEnvironment => "refresh_environment",
        InstallStageId::InstallClaudeCode => "install_claude_code",
        InstallStageId::InstallCodex => "install_codex",
        InstallStageId::Verify => "verify",
        InstallStageId::Completed => "completed",
        InstallStageId::Failed => "failed",
    }
}
