use crate::error::AppError;
use crate::models::{ChatMessage, ChatRole};
use crate::storage::db::{default_history_db_path, ChatHistoryRow, HistoryDatabase};

pub const DEFAULT_SESSION_ID: &str = "default";

pub struct HistoryRepository {
    db: HistoryDatabase,
}

impl HistoryRepository {
    pub fn new(db: HistoryDatabase) -> Self {
        Self { db }
    }

    pub fn production() -> Result<Self, AppError> {
        Ok(Self::new(HistoryDatabase::open(default_history_db_path())?))
    }

    pub fn append_message(&self, session_id: &str, message: &ChatMessage) -> Result<(), AppError> {
        self.db.insert_chat_message(
            session_id,
            match message.role {
                ChatRole::System => "system",
                ChatRole::User => "user",
                ChatRole::Assistant => "assistant",
            },
            &message.content,
        )
    }

    pub fn list_messages(&self, session_id: &str) -> Result<Vec<ChatMessage>, AppError> {
        let rows = self.db.list_messages(session_id)?;
        Ok(rows.into_iter().map(chat_row_to_message).collect())
    }
}

fn chat_row_to_message(row: ChatHistoryRow) -> ChatMessage {
    ChatMessage {
        role: match row.role.as_str() {
            "system" => ChatRole::System,
            "assistant" => ChatRole::Assistant,
            _ => ChatRole::User,
        },
        content: row.content,
    }
}
