import sys
import os
import logging
import atexit
import signal

# Define AppData directory for logs, uploads, and database
app_name = "GCEE Exam Hall Allotment"
if sys.platform == "win32":
    app_data_dir = os.path.join(os.environ["APPDATA"], app_name)
else:
    app_data_dir = os.path.join(os.path.expanduser("~"), ".gcee_hall_allotment")

os.makedirs(app_data_dir, exist_ok=True)

# Setup Logging
log_file = os.path.join(app_data_dir, "backend.log")
logging.basicConfig(
    filename=log_file,
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Redirect stdout/stderr to log file
sys.stdout = open(os.path.join(app_data_dir, "stdout.log"), "w", buffering=1)
sys.stderr = open(os.path.join(app_data_dir, "stderr.log"), "w", buffering=1)

logger.info(f"Starting backend... AppData Dir: {app_data_dir}")
logger.info(f"Process ID: {os.getpid()}")

# Add current dir to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
logger.info(f"Current Dir: {current_dir}")

# Set database path to AppData BEFORE importing app
db_path = os.path.join(app_data_dir, "app.db")
os.environ['DATABASE_URL'] = f'sqlite:///{db_path}'
logger.info(f"Database path set to: {db_path}")

def cleanup():
    """Cleanup function called on exit"""
    logger.info("Backend cleanup - shutting down...")

atexit.register(cleanup)

# Handle termination signals gracefully
def signal_handler(signum, frame):
    logger.info(f"Received signal {signum}, shutting down...")
    sys.exit(0)

if sys.platform == "win32":
    # On Windows, handle CTRL+C and CTRL+BREAK
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGBREAK, signal_handler)
else:
    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)

try:
    from app import create_app
    
    app = create_app()
    
    # Configure Upload Folder to Writable Directory
    upload_folder = os.path.join(app_data_dir, "uploads")
    os.makedirs(upload_folder, exist_ok=True)
    app.config['UPLOAD_FOLDER'] = upload_folder
    logger.info(f"Upload Folder set to: {upload_folder}")

    if __name__ == '__main__':
        import threading
        import socket

        # --- Prevent duplicate instances ---
        # If port 5001 is already in use, another backend is running. Exit cleanly.
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            sock.bind(('127.0.0.1', 5001))
            sock.close()  # Release; Flask will bind it properly
        except OSError:
            logger.info("Port 5001 already in use. Another backend instance is running. Exiting.")
            sys.exit(0)

        # --- Watch stdin pipe for Tauri lifecycle ---
        # When Tauri spawns the sidecar, it holds the stdin pipe open.
        # When the frontend window closes, Tauri closes the pipe → stdin hits EOF.
        # We detect this and shut down the backend cleanly.
        original_stdin = sys.__stdin__  # Use original stdin, not redirected one

        def watch_stdin():
            """Watch for stdin EOF — indicates Tauri has exited."""
            try:
                if original_stdin is not None:
                    while True:
                        line = original_stdin.readline()
                        if not line:  # EOF
                            logger.info("Stdin closed (Tauri exited). Shutting down backend.")
                            os._exit(0)
                else:
                    logger.info("No stdin available. Skipping stdin watcher.")
            except Exception:
                logger.info("Stdin read error. Shutting down backend.")
                os._exit(0)

        watcher = threading.Thread(target=watch_stdin, daemon=True)
        watcher.start()

        logger.info("Starting Flask server on port 5001")
        # Use threaded mode for better handling
        app.run(debug=False, host='127.0.0.1', port=5001, threaded=True)

except Exception as e:
    logger.exception("Failed to start backend")
    sys.exit(1)

