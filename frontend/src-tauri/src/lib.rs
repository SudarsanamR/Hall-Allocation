use tauri_plugin_shell::ShellExt;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app.get_webview_window("main").expect("no main window").set_focus();
        }))
        .setup(|app| {
            // Start the backend sidecar
            let sidecar_command = app.shell().sidecar("backend").or_else(|err| {
                eprintln!("Failed to create sidecar command: {}", err);
                Err(err)
            });

            if let Ok(command) = sidecar_command {
                 if let Err(e) = command.spawn() {
                     eprintln!("Failed to spawn sidecar: {}", e);
                 }
            } else {
                 eprintln!("Could not find sidecar configuration.");
            }

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
