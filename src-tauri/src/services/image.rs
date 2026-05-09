use crate::error::AppError;
use crate::models::ImageGenerationResponse;
use crate::services::gemini::client::GeminiImageClient;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ImageRequest {
    pub model: String,
    pub prompt: String,
    pub count: u32,
    pub aspect_ratio: String,
}

pub trait GeminiImageClientLike: Send + Sync {
    fn generate_image(&self, request: ImageRequest) -> Result<ImageGenerationResponse, AppError>;
}

impl GeminiImageClientLike for GeminiImageClient {
    fn generate_image(&self, request: ImageRequest) -> Result<ImageGenerationResponse, AppError> {
        GeminiImageClient::generate_image(self, request)
    }
}

pub struct ImageService {
    client: Box<dyn GeminiImageClientLike>,
}

impl ImageService {
    pub fn new(client: Box<dyn GeminiImageClientLike>) -> Self {
        Self { client }
    }

    pub fn production(api_key: String, timeout_ms: u64) -> Self {
        Self::new(Box::new(GeminiImageClient::production(api_key, timeout_ms)))
    }

    pub fn generate(&self, request: ImageRequest) -> Result<ImageGenerationResponse, AppError> {
        if request.prompt.trim().is_empty() {
            return Err(AppError {
                code: "invalid_prompt".to_string(),
                message: "Prompt must not be empty".to_string(),
                details: None,
            });
        }

        self.client.generate_image(ImageRequest {
            prompt: request.prompt.trim().to_string(),
            ..request
        })
    }
}
