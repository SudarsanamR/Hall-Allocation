import sys
import os
import logging
from logging.handlers import RotatingFileHandler

# Define AppData directory for logs and uploads
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
sys.stdout = open(os.path.join(app_data_dir, "stdout.log"), "w")
sys.stderr = open(os.path.join(app_data_dir, "stderr.log"), "w")

logger.info(f"Starting backend... AppData Dir: {app_data_dir}")

# Add current dir to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
logger.info(f"Current Dir: {current_dir}")

try:
    from app import create_app
    
    app = create_app()
    
    # Configure Upload Folder to Writable Directory
    upload_folder = os.path.join(app_data_dir, "uploads")
    os.makedirs(upload_folder, exist_ok=True)
    app.config['UPLOAD_FOLDER'] = upload_folder
    logger.info(f"Upload Folder set to: {upload_folder}")

    if __name__ == '__main__':
        logger.info("Starting Flask server on port 5001")
        app.run(debug=False, host='127.0.0.1', port=5001)

except Exception as e:
    logger.exception("Failed to start backend")
    sys.exit(1)
