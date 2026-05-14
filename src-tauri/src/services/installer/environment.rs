use std::process::Command;

use crate::models::installer::{
    InstallStageId, InstallerComponentState, InstallerComponentStatus, InstallerSnapshot,
};

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[derive(Debug, Clone)]
pub struct DetectedBinary {
    pub version: Option<String>,
    pub path: Option<String>,
}

pub trait EnvironmentProbe {
    fn is_admin(&self) -> bool;
    fn detect_binary(&self, command: &str) -> Option<DetectedBinary>;
    fn detect_known_install(&self, component_id: &str) -> Option<DetectedBinary>;
    fn detect_appx_package(&self, package_name: &str) -> Option<DetectedBinary>;
}

pub struct DetectExecutionEnvironment;

impl EnvironmentProbe for DetectExecutionEnvironment {
    fn is_admin(&self) -> bool {
        command_output("net", &["session"])
            .map(|output| output.status.success())
            .unwrap_or(false)
    }

    fn detect_binary(&self, command: &str) -> Option<DetectedBinary> {
        let path = detect_path(command);
        let version = match command {
            "cc-switch" | "cc-switch.exe" => None,
            _ => detect_version(command),
        };

        if path.is_none() && version.is_none() {
            None
        } else {
            Some(DetectedBinary { version, path })
        }
    }

    fn detect_known_install(&self, component_id: &str) -> Option<DetectedBinary> {
        match component_id {
            "cc_switch" => detect_cc_switch_local_install(),
            "python" => detect_python_local_install(),
            _ => None,
        }
    }

    fn detect_appx_package(&self, package_name: &str) -> Option<DetectedBinary> {
        detect_appx_package(package_name)
    }
}

pub fn build_initial_snapshot(probe: &dyn EnvironmentProbe) -> InstallerSnapshot {
    let components = vec![
        component_from_detection(probe, "git", "Git"),
        python_component_from_detection(probe),
        component_from_detection(probe, "node", "Node.js"),
        cc_switch_component_from_detection(probe),
        codex_component_from_detection(probe),
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

fn cc_switch_component_from_detection(probe: &dyn EnvironmentProbe) -> InstallerComponentState {
    let candidates = ["cc-switch", "cc-switch.exe"];

    for command in candidates {
        if let Some(found) = probe.detect_binary(command) {
            return InstallerComponentState {
                id: "cc_switch".into(),
                label: "CC Switch".into(),
                status: InstallerComponentStatus::Installed,
                detail: found.path.unwrap_or_else(|| "已检测到命令".into()),
                version: found.version,
            };
        }
    }

    if let Some(found) = probe.detect_known_install("cc_switch") {
        return InstallerComponentState {
            id: "cc_switch".into(),
            label: "CC Switch".into(),
            status: InstallerComponentStatus::Installed,
            detail: found.path.unwrap_or_else(|| "已检测到本地安装".into()),
            version: found.version,
        };
    }

    InstallerComponentState {
        id: "cc_switch".into(),
        label: "CC Switch".into(),
        status: InstallerComponentStatus::NotInstalled,
        detail: "未检测到".into(),
        version: None,
    }
}

fn detect_cc_switch_local_install() -> Option<DetectedBinary> {
    let path = std::env::var_os("LOCALAPPDATA")
        .map(|base| {
            std::path::PathBuf::from(base)
                .join("Programs")
                .join("CC Switch")
                .join("cc-switch.exe")
        })
        .filter(|path| path.exists())?;

    Some(DetectedBinary {
        version: None,
        path: Some(path.display().to_string()),
    })
}

fn codex_component_from_detection(probe: &dyn EnvironmentProbe) -> InstallerComponentState {
    if let Some(found) = probe.detect_binary("codex") {
        InstallerComponentState {
            id: "codex".into(),
            label: "Codex".into(),
            status: InstallerComponentStatus::Installed,
            detail: found.path.unwrap_or_else(|| "已检测到命令".into()),
            version: found.version,
        }
    } else if let Some(found) = probe.detect_appx_package("OpenAI.Codex") {
        InstallerComponentState {
            id: "codex".into(),
            label: "Codex".into(),
            status: InstallerComponentStatus::Installed,
            detail: found.path.unwrap_or_else(|| "Microsoft Store app".into()),
            version: found.version,
        }
    } else {
        InstallerComponentState {
            id: "codex".into(),
            label: "Codex".into(),
            status: InstallerComponentStatus::NotInstalled,
            detail: "未检测到".into(),
            version: None,
        }
    }
}

fn python_component_from_detection(probe: &dyn EnvironmentProbe) -> InstallerComponentState {
    if let Some(found) = probe.detect_binary("python") {
        let detail = found.path.unwrap_or_else(|| "已检测到命令".into());
        return InstallerComponentState {
            id: "python".into(),
            label: "Python".into(),
            status: InstallerComponentStatus::Installed,
            detail,
            version: found.version,
        };
    }

    if let Some(found) = probe.detect_known_install("python") {
        let detail = found.path.unwrap_or_else(|| "已检测到本地安装".into());
        return InstallerComponentState {
            id: "python".into(),
            label: "Python".into(),
            status: InstallerComponentStatus::Installed,
            detail,
            version: found.version,
        };
    }

    for command in ["py"] {
        if let Some(found) = probe.detect_binary(command) {
            let detail = found.path.unwrap_or_else(|| "已检测到命令".into());
            return InstallerComponentState {
                id: "python".into(),
                label: "Python".into(),
                status: InstallerComponentStatus::Installed,
                detail,
                version: found.version,
            };
        }
    }

    InstallerComponentState {
        id: "python".into(),
        label: "Python".into(),
        status: InstallerComponentStatus::NotInstalled,
        detail: "未检测到".into(),
        version: None,
    }
}

fn detect_python_local_install() -> Option<DetectedBinary> {
    let mut candidates = vec![
        std::path::PathBuf::from(r"C:\Program Files\Python312\python.exe"),
        std::path::PathBuf::from(r"C:\Program Files\Python313\python.exe"),
    ];

    if let Some(base) = std::env::var_os("LOCALAPPDATA") {
        candidates.push(
            std::path::PathBuf::from(&base)
                .join("Programs")
                .join("Python")
                .join("Python312")
                .join("python.exe"),
        );
        candidates.push(
            std::path::PathBuf::from(base)
                .join("Programs")
                .join("Python")
                .join("Python313")
                .join("python.exe"),
        );
    }

    for candidate in candidates {
        if candidate.exists() {
            let version = candidate
                .to_str()
                .and_then(|path| command_output(path, &["--version"]).ok())
                .and_then(first_non_empty_output_line);

            return Some(DetectedBinary {
                version,
                path: Some(candidate.display().to_string()),
            });
        }
    }

    None
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
    let output = command_output("where", &[command]).ok()?;
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
    let output = command_output(command, &[flag]).ok()?;
    if !output.status.success() {
        return None;
    }

    first_non_empty_output_line(output)
}

fn detect_appx_package(package_name: &str) -> Option<DetectedBinary> {
    let script = format!(
        "(Get-AppxPackage -Name '{package_name}' -ErrorAction SilentlyContinue | Select-Object -First 1 | ForEach-Object {{ \"{{0}}|{{1}}\" -f $_.Version, $_.InstallLocation }})"
    );
    let output = command_output("powershell.exe", &["-NoProfile", "-Command", &script]).ok()?;
    if !output.status.success() {
        return None;
    }

    let line = String::from_utf8(output.stdout).ok()?;
    let trimmed = line.trim();
    if trimmed.is_empty() {
        return None;
    }

    let mut parts = trimmed.splitn(2, '|');
    let version = parts
        .next()
        .map(str::trim)
        .filter(|value| !value.is_empty());
    let path = parts
        .next()
        .map(str::trim)
        .filter(|value| !value.is_empty());

    Some(DetectedBinary {
        version: version.map(|value| value.to_string()),
        path: path.map(|value| value.to_string()),
    })
}

fn command_output(program: &str, args: &[&str]) -> std::io::Result<std::process::Output> {
    let mut command = Command::new(program);
    command.args(args);
    #[cfg(target_os = "windows")]
    {
        command.creation_flags(CREATE_NO_WINDOW);
    }
    command.output()
}

fn first_non_empty_output_line(output: std::process::Output) -> Option<String> {
    let stdout = String::from_utf8(output.stdout).ok();
    let stderr = String::from_utf8(output.stderr).ok();

    stdout
        .into_iter()
        .chain(stderr)
        .flat_map(|text| {
            text.lines()
                .map(str::trim)
                .map(str::to_owned)
                .collect::<Vec<_>>()
        })
        .find(|line| !line.is_empty())
}

fn version_flag(command: &str) -> &'static str {
    match command {
        "claude" => "-v",
        "py" => "--version",
        _ => "--version",
    }
}
