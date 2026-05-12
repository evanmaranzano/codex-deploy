use std::process::Command;

use crate::models::installer::{
    InstallStageId, InstallerComponentState, InstallerComponentStatus, InstallerSnapshot,
};

#[derive(Debug, Clone)]
pub struct DetectedBinary {
    pub version: Option<String>,
    pub path: Option<String>,
}

pub trait EnvironmentProbe {
    fn is_admin(&self) -> bool;
    fn detect_binary(&self, command: &str) -> Option<DetectedBinary>;
}

pub struct DetectExecutionEnvironment;

impl EnvironmentProbe for DetectExecutionEnvironment {
    fn is_admin(&self) -> bool {
        Command::new("net")
            .arg("session")
            .output()
            .map(|output| output.status.success())
            .unwrap_or(false)
    }

    fn detect_binary(&self, command: &str) -> Option<DetectedBinary> {
        let path = detect_path(command);
        let version = detect_version(command);

        if path.is_none() && version.is_none() {
            None
        } else {
            Some(DetectedBinary { version, path })
        }
    }
}

pub fn build_initial_snapshot(probe: &dyn EnvironmentProbe) -> InstallerSnapshot {
    let components = vec![
        component_from_detection(probe, "git", "Git"),
        component_from_detection(probe, "node", "Node.js"),
        component_from_detection(probe, "cc-switch", "CC Switch"),
        component_from_detection(probe, "claude", "Claude Code"),
        component_from_detection(probe, "codex", "Codex"),
    ];

    InstallerSnapshot {
        current_stage: InstallStageId::Idle,
        progress_percent: 0,
        components,
        logs: vec![],
        last_error: if probe.is_admin() {
            None
        } else {
            Some("当前未以管理员身份运行。".into())
        },
    }
}

fn component_from_detection(
    probe: &dyn EnvironmentProbe,
    command: &str,
    label: &str,
) -> InstallerComponentState {
    match probe.detect_binary(command) {
        Some(found) => InstallerComponentState {
            id: component_id(label),
            label: label.to_string(),
            status: InstallerComponentStatus::Installed,
            detail: found.path.unwrap_or_else(|| "已检测到命令".into()),
            version: found.version,
        },
        None => InstallerComponentState {
            id: component_id(label),
            label: label.to_string(),
            status: InstallerComponentStatus::NotInstalled,
            detail: "未检测到".into(),
            version: None,
        },
    }
}

fn component_id(label: &str) -> String {
    label
        .to_ascii_lowercase()
        .replace('.', "")
        .replace(' ', "_")
}

fn detect_path(command: &str) -> Option<String> {
    let output = Command::new("where").arg(command).output().ok()?;
    if !output.status.success() {
        return None;
    }

    String::from_utf8(output.stdout)
        .ok()?
        .lines()
        .map(str::trim)
        .find(|line| !line.is_empty())
        .map(|line| line.to_string())
}

fn detect_version(command: &str) -> Option<String> {
    let flag = version_flag(command);
    let output = Command::new(command).arg(flag).output().ok()?;
    if !output.status.success() {
        return None;
    }

    let stdout = String::from_utf8(output.stdout).ok();
    let stderr = String::from_utf8(output.stderr).ok();

    stdout
        .into_iter()
        .chain(stderr)
        .flat_map(|text| text.lines().map(str::trim).map(str::to_owned).collect::<Vec<_>>())
        .find(|line| !line.is_empty())
}

fn version_flag(command: &str) -> &'static str {
    match command {
        "claude" => "-v",
        _ => "--version",
    }
}
