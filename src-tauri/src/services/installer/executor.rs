use crate::error::AppError;
use crate::models::installer::{InstallStageId, InstallerLogEntry};

pub struct StageExecutionResult {
    pub next_stage: InstallStageId,
    pub logs: Vec<InstallerLogEntry>,
}

pub trait CommandRunner {
    fn run(
        &self,
        program: &str,
        args: &[String],
        stage: InstallStageId,
    ) -> Result<Vec<InstallerLogEntry>, AppError>;
}

pub fn stage_sequence(flow: &str) -> Vec<InstallStageId> {
    match flow {
        "install_claude" => vec![
            InstallStageId::Preflight,
            InstallStageId::InstallGit,
            InstallStageId::InstallNode,
            InstallStageId::InstallCcSwitch,
            InstallStageId::RefreshEnvironment,
            InstallStageId::InstallClaudeCode,
            InstallStageId::Verify,
        ],
        "install_codex" => vec![
            InstallStageId::Preflight,
            InstallStageId::InstallGit,
            InstallStageId::InstallNode,
            InstallStageId::InstallCcSwitch,
            InstallStageId::RefreshEnvironment,
            InstallStageId::InstallCodex,
            InstallStageId::Verify,
        ],
        _ => vec![
            InstallStageId::Preflight,
            InstallStageId::InstallGit,
            InstallStageId::InstallNode,
            InstallStageId::InstallCcSwitch,
            InstallStageId::RefreshEnvironment,
            InstallStageId::InstallClaudeCode,
            InstallStageId::InstallCodex,
            InstallStageId::Verify,
        ],
    }
}
