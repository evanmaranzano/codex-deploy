use crate::error::AppError;
use crate::models::{ChatMessage, ChatResponse};
use crate::services::gemini::client::GeminiChatClient;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ChatRequest {
    pub model: String,
    pub prompt: String,
    pub history: Vec<ChatMessage>,
}

pub struct ChatService {
    client: Box<GeminiChatClient>,
}

impl ChatService {
    pub fn new(client: Box<GeminiChatClient>) -> Self {
        Self { client }
    }

    pub fn production(api_key: String, timeout_ms: u64) -> Self {
        Self::new(Box::new(GeminiChatClient::production(
            api_key, timeout_ms,
        )))
    }

    pub fn send(&self, request: ChatRequest) -> Result<ChatResponse, AppError> {
        if request.prompt.trim().is_empty() {
            return Err(AppError {
                code: "invalid_prompt".to_string(),
                message: "Prompt must not be empty".to_string(),
                details: None,
            });
        }

        self.client
            .chat_generate(request.model, request.prompt.trim().to_string(), request.history)
    }
}
