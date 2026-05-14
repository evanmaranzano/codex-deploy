use std::fs::{self, OpenOptions};
use std::io::{Error, Write};
use std::path::PathBuf;

use crate::models::installer::InstallerLogEntry;

pub struct SessionLogWriter {
    pub text_path: PathBuf,
    pub jsonl_path: PathBuf,
}

impl SessionLogWriter {
    pub fn append(&self, entry: &InstallerLogEntry) -> std::io::Result<()> {
        if let Some(parent) = self.text_path.parent() {
            fs::create_dir_all(parent)?;
        }
        if let Some(parent) = self.jsonl_path.parent() {
            fs::create_dir_all(parent)?;
        }

        let mut text = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.text_path)?;
        let mut jsonl = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.jsonl_path)?;

        writeln!(
            text,
            "[{}][{:?}] {}",
            entry.timestamp, entry.stage, entry.message
        )?;
        let json = serde_json::to_string(entry)
            .map_err(|error| Error::other(format!("failed to serialize log entry: {error}")))?;
        writeln!(jsonl, "{json}")?;
        Ok(())
    }
}
