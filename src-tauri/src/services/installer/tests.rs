use crate::services::installer::environment::{
    build_initial_snapshot, DetectedBinary, EnvironmentProbe,
};
use serde_json::json;

struct FakeProbe;

impl EnvironmentProbe for FakeProbe {
    fn is_admin(&self) -> bool {
        true
    }

    fn detect_binary(&self, command: &str) -> Option<DetectedBinary> {
        match command {
            "git" => Some(DetectedBinary {
                version: Some("2.45.1".into()),
                path: Some("C:\\Program Files\\Git\\bin\\git.exe".into()),
            }),
            "node" => Some(DetectedBinary {
                version: Some("v22.9.0".into()),
                path: Some("C:\\Program Files\\nodejs\\node.exe".into()),
            }),
            "npm" => Some(DetectedBinary {
                version: Some("10.8.3".into()),
                path: Some("C:\\Program Files\\nodejs\\npm.cmd".into()),
            }),
            _ => None,
        }
    }
}

struct NonAdminProbe;

impl EnvironmentProbe for NonAdminProbe {
    fn is_admin(&self) -> bool {
        false
    }

    fn detect_binary(&self, command: &str) -> Option<DetectedBinary> {
        match command {
            "claude" => Some(DetectedBinary {
                version: None,
                path: None,
            }),
            _ => None,
        }
    }
}

#[test]
fn builds_snapshot_from_detected_machine_state() {
    let snapshot = build_initial_snapshot(&FakeProbe);

    assert_eq!(snapshot.current_stage, "idle");
    assert_eq!(snapshot.progress_percent, 0);
    assert_eq!(snapshot.last_error, None);
    assert_eq!(snapshot.components.len(), 5);
    assert_eq!(snapshot.components[0].id, "git");
    assert_eq!(snapshot.components[0].label, "Git");
    assert_eq!(snapshot.components[0].status, "installed");
    assert_eq!(
        snapshot.components[0].detail,
        "C:\\Program Files\\Git\\bin\\git.exe"
    );
    assert_eq!(snapshot.components[0].version.as_deref(), Some("2.45.1"));
    assert_eq!(snapshot.components[1].id, "nodejs");
    assert_eq!(snapshot.components[1].label, "Node.js");
    assert_eq!(snapshot.components[1].status, "installed");
    assert_eq!(
        snapshot.components[1].detail,
        "C:\\Program Files\\nodejs\\node.exe"
    );
    assert_eq!(snapshot.components[1].version.as_deref(), Some("v22.9.0"));
    assert_eq!(snapshot.components[2].id, "cc_switch");
    assert_eq!(snapshot.components[2].status, "not_installed");
    assert_eq!(snapshot.components[2].detail, "未检测到");
    assert_eq!(snapshot.components[3].id, "claude_code");
    assert_eq!(snapshot.components[4].id, "codex");
    assert!(snapshot.logs.is_empty());
}

#[test]
fn builds_non_admin_snapshot_with_error_and_detected_fallback_detail() {
    let snapshot = build_initial_snapshot(&NonAdminProbe);

    assert_eq!(
        snapshot.last_error.as_deref(),
        Some("当前未以管理员身份运行。")
    );
    assert_eq!(snapshot.components[3].id, "claude_code");
    assert_eq!(snapshot.components[3].status, "installed");
    assert_eq!(snapshot.components[3].detail, "已检测到命令");
    assert_eq!(snapshot.components[3].version, None);
}

#[test]
fn installer_snapshot_serializes_with_camel_case_contract() {
    let snapshot = build_initial_snapshot(&FakeProbe);
    let value = serde_json::to_value(&snapshot).expect("snapshot should serialize");

    assert_eq!(value["currentStage"], json!("idle"));
    assert_eq!(value["progressPercent"], json!(0));
    assert_eq!(value["lastError"], serde_json::Value::Null);
    assert!(value.get("current_stage").is_none());
    assert!(value.get("progress_percent").is_none());
    assert!(value.get("last_error").is_none());
}
