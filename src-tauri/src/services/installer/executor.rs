use std::path::Path;
use std::path::PathBuf;

use crate::error::AppError;
use crate::models::installer::{InstallStageId, InstallerLogEntry};

pub struct StageExecutionResult {
    pub next_stage: InstallStageId,
    pub logs: Vec<InstallerLogEntry>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PlannedCommand {
    pub program: String,
    pub args: Vec<String>,
}

pub trait CommandRunner {
    fn run(
        &self,
        program: &str,
        args: &[String],
        stage: InstallStageId,
    ) -> Result<Vec<InstallerLogEntry>, AppError>;
}

pub fn codex_install_commands() -> Vec<PlannedCommand> {
    vec![PlannedCommand {
        program: winget_program(),
        args: vec![
            "install".into(),
            "--id".into(),
            "9PLM9XGG6VKS".into(),
            "--source".into(),
            "msstore".into(),
            "--accept-source-agreements".into(),
            "--accept-package-agreements".into(),
            "--silent".into(),
        ],
    }]
}

pub fn claude_code_install_commands() -> Vec<PlannedCommand> {
    vec![PlannedCommand {
        program: find_program_on_path("npm").unwrap_or_else(|| "npm".into()),
        args: vec![
            "install".into(),
            "-g".into(),
            "@anthropic-ai/claude-code".into(),
        ],
    }]
}

pub fn winget_program() -> String {
    find_program_on_path("winget")
        .or_else(|| {
            winget_candidate_paths()
                .into_iter()
                .find(|path| path.exists())
                .map(|path| path.display().to_string())
        })
        .unwrap_or_else(|| "winget".into())
}

pub fn winget_candidate_paths() -> Vec<PathBuf> {
    let mut candidates = Vec::new();

    if let Some(local_app_data) = std::env::var_os("LOCALAPPDATA") {
        candidates.push(
            PathBuf::from(local_app_data)
                .join("Microsoft")
                .join("WindowsApps")
                .join("winget.exe"),
        );
    }

    if let Some(user_profile) = std::env::var_os("USERPROFILE") {
        candidates.push(
            PathBuf::from(user_profile)
                .join("AppData")
                .join("Local")
                .join("Microsoft")
                .join("WindowsApps")
                .join("winget.exe"),
        );
    }

    candidates
}

fn find_program_on_path(program: &str) -> Option<String> {
    let path = std::env::var_os("PATH")?;

    for dir in std::env::split_paths(&path) {
        for candidate_name in executable_names(program) {
            let candidate = dir.join(candidate_name);
            if candidate.exists() {
                return Some(candidate.display().to_string());
            }
        }
    }

    None
}

fn executable_names(program: &str) -> Vec<String> {
    let lower = program.to_ascii_lowercase();
    if lower.ends_with(".exe") || lower.ends_with(".cmd") || lower.ends_with(".bat") {
        vec![program.to_string()]
    } else {
        vec![
            format!("{program}.exe"),
            format!("{program}.cmd"),
            format!("{program}.bat"),
            program.to_string(),
        ]
    }
}

pub fn third_party_install_command(
    _component_id: &str,
    file_name: &str,
    install_args: &[String],
    resource_root: &Path,
) -> Result<PlannedCommand, AppError> {
    let resource_path = resource_root.join(file_name);
    let normalized = normalize_installer_resource_path(&resource_path);

    if file_name.to_ascii_lowercase().ends_with(".msi") {
        let mut args = vec!["/i".into(), normalized];
        args.extend(install_args.iter().cloned());

        return Ok(PlannedCommand {
            program: "msiexec.exe".into(),
            args,
        });
    }

    Ok(PlannedCommand {
        program: normalized,
        args: install_args.to_vec(),
    })
}

fn normalize_installer_resource_path(path: &Path) -> String {
    let raw = path.to_string_lossy();
    raw.strip_prefix(r"\\?\").unwrap_or(&raw).to_string()
}

pub fn command_display(command: &PlannedCommand) -> String {
    if command.args.is_empty() {
        command.program.clone()
    } else {
        format!("{} {}", command.program, command.args.join(" "))
    }
}

pub fn stage_sequence(flow: &str) -> Vec<InstallStageId> {
    match flow {
        "install_codex" => vec![
            InstallStageId::Preflight,
            InstallStageId::InstallGit,
            InstallStageId::InstallPython,
            InstallStageId::InstallNode,
            InstallStageId::InstallCcSwitch,
            InstallStageId::RefreshEnvironment,
            InstallStageId::InstallCodex,
            InstallStageId::Verify,
        ],
        "install_claude_code" => vec![
            InstallStageId::Preflight,
            InstallStageId::InstallGit,
            InstallStageId::InstallPython,
            InstallStageId::InstallNode,
            InstallStageId::InstallCcSwitch,
            InstallStageId::RefreshEnvironment,
            InstallStageId::InstallClaudeCode,
            InstallStageId::Verify,
        ],
        "install_all" => vec![
            InstallStageId::Preflight,
            InstallStageId::InstallGit,
            InstallStageId::InstallPython,
            InstallStageId::InstallNode,
            InstallStageId::InstallCcSwitch,
            InstallStageId::RefreshEnvironment,
            InstallStageId::InstallCodex,
            InstallStageId::InstallClaudeCode,
            InstallStageId::Verify,
        ],
        _ => vec![
            InstallStageId::Preflight,
            InstallStageId::InstallGit,
            InstallStageId::InstallPython,
            InstallStageId::InstallNode,
            InstallStageId::InstallCcSwitch,
            InstallStageId::RefreshEnvironment,
            InstallStageId::InstallCodex,
            InstallStageId::Verify,
        ],
    }
}
