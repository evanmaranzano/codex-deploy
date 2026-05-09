use crate::error::AppError;
use crate::models::{ChatMessage, ChatResponse, ChatRole};
use crate::services::chat::{ChatRequest, ChatService};
use crate::services::settings::SettingsService;
use crate::storage::history::{HistoryRepository, DEFAULT_SESSION_ID};

fn chat_service() -> Result<ChatService, AppError> {
    SettingsService::production().chat_service()
}

#[tauri::command]
pub fn send_chat_message(request: ChatRequest) -> Result<ChatResponse, AppError> {
    let user_message = ChatMessage {
        role: ChatRole::User,
        content: request.prompt.trim().to_string(),
    };
    let response = chat_service()?.send(request)?;
    let history = HistoryRepository::production()?;

    history.append_message(DEFAULT_SESSION_ID, &user_message)?;
    history.append_message(DEFAULT_SESSION_ID, &response.message)?;

    Ok(response)
}
