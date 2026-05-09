use crate::error::AppError;
use crate::models::ChatMessage;
use crate::storage::history::{HistoryRepository, DEFAULT_SESSION_ID};

#[tauri::command]
pub fn list_chat_history() -> Result<Vec<ChatMessage>, AppError> {
    HistoryRepository::production()?.list_messages(DEFAULT_SESSION_ID)
}
