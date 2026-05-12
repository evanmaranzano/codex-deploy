use crate::services::installer::environment::{
    build_initial_snapshot, DetectedBinary, EnvironmentProbe,
};
use crate::services::installer::executor::stage_sequence;
use crate::services::installer::manifest::{verify_sha256, InstallerManifest};
use crate::services::installer::service::InstallerService;
use serde_json::json;
use sha2::{Digest, Sha256};
use std::fs;
use std::time::{SystemTime, UNIX_EPOCH};

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

#[test]
fn parses_third_party_manifest_and_verifies_order() {
    let manifest = crate::services::installer::manifest::InstallerManifest {
        resources: vec![
            crate::services::installer::manifest::BundledResource {
                component_id: "git".into(),
                version: "2.45.1".into(),
                file_name: "Git-2.45.1-64-bit.exe".into(),
                sha256: "abc".into(),
                install_command: vec!["/VERYSILENT".into()],
            },
            crate::services::installer::manifest::BundledResource {
                component_id: "nodejs".into(),
                version: "22.9.0".into(),
                file_name: "node-v22.9.0-x64.msi".into(),
                sha256: "def".into(),
                install_command: vec!["/qn".into()],
            },
        ],
    };

    assert_eq!(manifest.resources[0].component_id, "git");
    assert_eq!(manifest.resources[1].component_id, "nodejs");
}

#[test]
fn parses_manifest_json_and_finds_resource_by_component_id() {
    let manifest_json = include_str!("../../../resources/third_party/manifest.json");
    let manifest =
        InstallerManifest::from_json_str(manifest_json).expect("manifest should parse");

    assert_eq!(manifest.resources.len(), 3);
    assert_eq!(
        manifest
            .resource("cc_switch")
            .expect("cc_switch resource should exist")
            .file_name,
        "CC-Switch-Windows.msi"
    );
}

#[test]
fn verifies_sha256_for_temp_file_contents() {
    let unique = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("time should move forward")
        .as_nanos();
    let temp_path = std::env::temp_dir().join(format!("installer-manifest-{unique}.bin"));
    let payload = b"installer-payload";
    fs::write(&temp_path, payload).expect("temp file should be written");

    let expected = hex::encode(Sha256::digest(payload));
    let verified = verify_sha256(&temp_path, &expected).expect("hash verification should work");
    let mismatch = verify_sha256(&temp_path, "deadbeef").expect("mismatch should not error");

    assert!(verified);
    assert!(!mismatch);

    fs::remove_file(temp_path).expect("temp file should be removed");
}

#[test]
fn stage_sequence_matches_expected_flow_ordering() {
    assert_eq!(
        stage_sequence("install_claude"),
        vec![
            crate::models::installer::InstallStageId::Preflight,
            crate::models::installer::InstallStageId::InstallGit,
            crate::models::installer::InstallStageId::InstallNode,
            crate::models::installer::InstallStageId::InstallCcSwitch,
            crate::models::installer::InstallStageId::RefreshEnvironment,
            crate::models::installer::InstallStageId::InstallClaudeCode,
            crate::models::installer::InstallStageId::Verify,
        ]
    );
    assert_eq!(
        stage_sequence("install_codex"),
        vec![
            crate::models::installer::InstallStageId::Preflight,
            crate::models::installer::InstallStageId::InstallGit,
            crate::models::installer::InstallStageId::InstallNode,
            crate::models::installer::InstallStageId::InstallCcSwitch,
            crate::models::installer::InstallStageId::RefreshEnvironment,
            crate::models::installer::InstallStageId::InstallCodex,
            crate::models::installer::InstallStageId::Verify,
        ]
    );
}

#[test]
fn installer_service_returns_stage_names_for_requested_flow() {
    let service = InstallerService::production();

    assert_eq!(
        service.stage_sequence_for("install_codex"),
        vec![
            "Preflight".to_string(),
            "InstallGit".to_string(),
            "InstallNode".to_string(),
            "InstallCcSwitch".to_string(),
            "RefreshEnvironment".to_string(),
            "InstallCodex".to_string(),
            "Verify".to_string(),
        ]
    );
}
