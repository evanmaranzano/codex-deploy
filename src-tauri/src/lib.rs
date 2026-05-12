pub mod error;
pub mod models {
    include!("models.rs");
    pub mod installer;
}
pub mod commands {
    pub mod chat;
    pub mod history;
    pub mod image;
    pub mod installer;
    pub mod settings;
    pub mod subtitles;
}
pub mod storage {
    pub mod db;
    pub mod history;
}
pub mod services {
    pub mod chat;
    pub mod credentials;
    pub mod gemini {
        pub mod client;
    }
    pub mod image;
    pub mod installer;
    pub mod settings;
    pub mod srt;
    pub mod subtitles;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::chat::send_chat_message,
            commands::history::list_chat_history,
            commands::image::generate_image,
            commands::installer::load_installer_snapshot,
            commands::settings::load_settings,
            commands::settings::save_api_key,
            commands::settings::clear_api_key,
            commands::settings::save_app_settings,
            commands::settings::test_api_key_connection,
            commands::settings::list_available_models,
            commands::subtitles::extract_subtitles
        ])
        .run(tauri::generate_context!())
        .expect("failed to run AI Dev Installer");
}
