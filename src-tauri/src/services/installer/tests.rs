use crate::services::installer::environment::{
    build_initial_snapshot, DetectedBinary, EnvironmentProbe,
};

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

#[test]
fn builds_snapshot_from_detected_machine_state() {
    let snapshot = build_initial_snapshot(&FakeProbe);
    assert_eq!(snapshot.current_stage, "idle");
    assert_eq!(snapshot.components.len(), 5);
    assert_eq!(snapshot.components[0].status, "installed");
}
