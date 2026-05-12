use std::fs;
use std::path::Path;

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

use crate::error::AppError;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct BundledResource {
    pub component_id: String,
    pub version: String,
    pub file_name: String,
    pub sha256: String,
    pub install_command: Vec<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct InstallerManifest {
    pub resources: Vec<BundledResource>,
}

impl InstallerManifest {
    pub fn resource(&self, component_id: &str) -> Option<&BundledResource> {
        self.resources
            .iter()
            .find(|item| item.component_id == component_id)
    }

    pub fn from_json_str(json: &str) -> Result<Self, AppError> {
        serde_json::from_str(json).map_err(|error| AppError {
            code: "installer_manifest_parse_failed".into(),
            message: "Failed to parse installer manifest".into(),
            details: Some(error.to_string()),
        })
    }
}

pub fn verify_sha256(path: &Path, expected_sha256: &str) -> Result<bool, AppError> {
    let bytes = fs::read(path).map_err(|error| AppError {
        code: "installer_manifest_read_failed".into(),
        message: "Failed to read bundled installer resource".into(),
        details: Some(error.to_string()),
    })?;
    let digest = Sha256::digest(bytes);
    let actual = hex::encode(digest);
    Ok(actual.eq_ignore_ascii_case(expected_sha256))
}
