pub mod environment;

pub mod service {
    use super::environment::{
        build_initial_snapshot, DetectExecutionEnvironment, EnvironmentProbe,
    };
    use crate::error::AppError;
    use crate::models::installer::InstallerSnapshot;

    pub struct InstallerService<P = DetectExecutionEnvironment> {
        probe: P,
    }

    impl InstallerService<DetectExecutionEnvironment> {
        pub fn production() -> Self {
            Self {
                probe: DetectExecutionEnvironment,
            }
        }
    }

    impl<P> InstallerService<P>
    where
        P: EnvironmentProbe,
    {
        pub fn load_snapshot(&self) -> Result<InstallerSnapshot, AppError> {
            Ok(build_initial_snapshot(&self.probe))
        }
    }
}

#[cfg(test)]
mod tests;
