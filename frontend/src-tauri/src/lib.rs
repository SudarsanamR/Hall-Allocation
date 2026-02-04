use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandChild;
use tauri::Manager;
use std::sync::Mutex;

// Store the backend process handle globally so we can kill it on exit
struct BackendProcess(Mutex<Option<CommandChild>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app.get_webview_window("main").expect("no main window").set_focus();
        }))
        .manage(BackendProcess(Mutex::new(None)))
        .setup(|app| {
            // Start the backend sidecar
            let sidecar_command = app.shell().sidecar("backend").or_else(|err| {
                eprintln!("Failed to create sidecar command: {}", err);
                Err(err)
            });

            if let Ok(command) = sidecar_command {
                match command.spawn() {
                    Ok((_, child)) => {
                        println!("Backend sidecar started successfully");
                        // Store the child process for cleanup on exit
                        let state = app.state::<BackendProcess>();
                        *state.0.lock().unwrap() = Some(child);
                    }
                    Err(e) => {
                        eprintln!("Failed to spawn sidecar: {}", e);
                    }
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
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                // Kill the backend process when the window is destroyed
                let app = window.app_handle();
                if let Some(state) = app.try_state::<BackendProcess>() {
                    if let Ok(mut guard) = state.0.lock() {
                        if let Some(child) = guard.take() {
                            println!("Killing backend sidecar...");
                            let _ = child.kill();
                        }
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
