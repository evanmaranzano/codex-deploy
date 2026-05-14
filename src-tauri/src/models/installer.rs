use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum InstallStageId {
    Idle,
    Preflight,
    InstallGit,
    InstallPython,
    InstallNode,
    InstallCcSwitch,
    RefreshEnvironment,
    InstallCodex,
    Verify,
    Completed,
    Failed,
}

impl InstallStageId {
    fn as_str(&self) -> &'static str {
        match self {
            Self::Idle => "idle",
            Self::Preflight => "preflight",
            Self::InstallGit => "install_git",
            Self::InstallPython => "install_python",
            Self::InstallNode => "install_node",
            Self::InstallCcSwitch => "install_cc_switch",
            Self::RefreshEnvironment => "refresh_environment",
            Self::InstallCodex => "install_codex",
            Self::Verify => "verify",
            Self::Completed => "completed",
            Self::Failed => "failed",
        }
    }
}

impl PartialEq<&str> for InstallStageId {
    fn eq(&self, other: &&str) -> bool {
        self.as_str() == *other
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum InstallerComponentStatus {
    NotInstalled,
    Checking,
    Installing,
    Installed,
    Failed,
    Skipped,
}

impl InstallerComponentStatus {
    fn as_str(&self) -> &'static str {
        match self {
            Self::NotInstalled => "not_installed",
            Self::Checking => "checking",
            Self::Installing => "installing",
            Self::Installed => "installed",
            Self::Failed => "failed",
            Self::Skipped => "skipped",
        }
    }
}

impl PartialEq<&str> for InstallerComponentStatus {
    fn eq(&self, other: &&str) -> bool {
        self.as_str() == *other
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstallerComponentState {
    pub id: String,
    pub label: String,
    pub status: InstallerComponentStatus,
    pub detail: String,
    pub version: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstallerLogEntry {
    pub timestamp: String,
    pub stage: InstallStageId,
    pub level: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallerSnapshot {
    pub current_stage: InstallStageId,
    pub progress_percent: u8,
    pub components: Vec<InstallerComponentState>,
    pub logs: Vec<InstallerLogEntry>,
    pub last_error: Option<String>,
}
