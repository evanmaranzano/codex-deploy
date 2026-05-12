use crate::error::AppError;
use crate::models::installer::InstallerSnapshot;
use crate::services::installer::environment::{
    build_initial_snapshot, DetectExecutionEnvironment,
};
use crate::services::installer::executor::stage_sequence;

pub struct InstallerService;

impl InstallerService {
    pub fn production() -> Self {
        Self
    }

    pub fn load_snapshot(&self) -> Result<InstallerSnapshot, AppError> {
        Ok(build_initial_snapshot(&DetectExecutionEnvironment))
    }

    pub fn stage_sequence_for(&self, flow: &str) -> Vec<String> {
        stage_sequence(flow)
            .into_iter()
            .map(|stage| format!("{stage:?}"))
            .collect()
    }
}
