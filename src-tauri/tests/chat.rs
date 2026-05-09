use molspark_desktop::models::ChatMessage;
use molspark_desktop::services::chat::{ChatRequest, ChatService};
use molspark_desktop::services::gemini::client::{
    GeminiChatClient, GeminiTransport, GeminiTransportRequest, GeminiTransportResponse,
};

use molspark_desktop::error::AppError;

struct FakeGeminiTransport {
    reply_text: String,
}

impl FakeGeminiTransport {
    fn reply_text(reply_text: &str) -> Self {
        Self {
            reply_text: reply_text.to_string(),
        }
    }
}

impl GeminiTransport for FakeGeminiTransport {
    fn send_chat(
        &self,
        _request: GeminiTransportRequest,
    ) -> Result<GeminiTransportResponse, AppError> {
        Ok(GeminiTransportResponse {
            reply_text: self.reply_text.clone(),
        })
    }
}

#[test]
fn rejects_empty_prompt_and_normalizes_reply() {
    let client = GeminiChatClient::new(Box::new(FakeGeminiTransport::reply_text(
        "hello from gemini",
    )));
    let service = ChatService::new(Box::new(client));

    let err = service
        .send(ChatRequest {
            model: "gemini-2.0-flash".to_string(),
            prompt: String::new(),
            history: vec![],
        })
        .unwrap_err();

    assert_eq!(err.code, "invalid_prompt");
}

#[test]
fn sends_model_prompt_history_and_returns_assistant_message() {
    let client = GeminiChatClient::new(Box::new(FakeGeminiTransport::reply_text(
        "hello from gemini",
    )));
    let service = ChatService::new(Box::new(client));

    let response = service
        .send(ChatRequest {
            model: "gemini-2.0-flash".to_string(),
            prompt: "你好".to_string(),
            history: vec![ChatMessage {
                role: molspark_desktop::models::ChatRole::User,
                content: "之前的消息".to_string(),
            }],
        })
        .unwrap();

    assert_eq!(response.message.role, molspark_desktop::models::ChatRole::Assistant);
    assert_eq!(response.message.content, "hello from gemini");
}
