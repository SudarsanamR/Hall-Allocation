import sys
import os
import logging
import time
from logging.handlers import RotatingFileHandler

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

# Add current dir to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
logger.info(f"Current Dir: {current_dir}")

# Set database path to AppData BEFORE importing app
db_path = os.path.join(app_data_dir, "app.db")
os.environ['DATABASE_URL'] = f'sqlite:///{db_path}'
logger.info(f"Database path set to: {db_path}")

try:
    from app import create_app
    
    app = create_app()
    
    # Configure Upload Folder to Writable Directory
    upload_folder = os.path.join(app_data_dir, "uploads")
    os.makedirs(upload_folder, exist_ok=True)
    app.config['UPLOAD_FOLDER'] = upload_folder
    logger.info(f"Upload Folder set to: {upload_folder}")

    if __name__ == '__main__':
        # Parent process monitoring with better handling for PyInstaller
        import threading
        import select
        
        def monitor_parent():
            """
            Monitor if Tauri parent process is still alive.
            When Tauri closes, stdin will be closed, triggering shutdown.
            """
            try:
                # Wait a bit to let the server start properly
                time.sleep(2)
                
                # Check if running as frozen exe (PyInstaller)
                if getattr(sys, 'frozen', False):
                    # For frozen app, use a different approach
                    # Check periodically if stdin is closed
                    while True:
                        try:
                            # Try to read with timeout
                            if sys.platform == "win32":
                                import msvcrt
                                # On Windows, check if parent process handle is still valid
                                # by trying to read stdin (will fail if parent closed)
                                time.sleep(1)
                                # Check if stdin is still connected
                                if sys.stdin.closed:
                                    break
                            else:
                                # On Unix, use select
                                readable, _, _ = select.select([sys.stdin], [], [], 1.0)
                                if readable:
                                    data = sys.stdin.read(1)
                                    if not data:  # EOF - parent closed
                                        break
                        except Exception:
                            break
                else:
                    # For development, blocking read
                    sys.stdin.read()
            except Exception as e:
                logger.info(f"Parent monitor exception: {e}")
            
            logger.info("Parent process closed. Shutting down...")
            os._exit(0)
        
        # Start parent monitoring in background (daemon thread will be killed when main exits)
        monitor_thread = threading.Thread(target=monitor_parent, daemon=True)
        monitor_thread.start()

        logger.info("Starting Flask server on port 5001")
        # Use threaded mode for better handling
        app.run(debug=False, host='127.0.0.1', port=5001, threaded=True)

except Exception as e:
    logger.exception("Failed to start backend")
    sys.exit(1)
