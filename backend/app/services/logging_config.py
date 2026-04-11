"""
Logging Configuration for Desktop Application
"""
import logging
import sys
import os
from logging.handlers import RotatingFileHandler

def setup_logging(app=None):
    """
    Configure structured logging for the desktop application.
    - Colored console output with DEBUG level
    - File logging with rotation
    """
    # Create logger
    logger = logging.getLogger('exam_hall')
    logger.setLevel(logging.DEBUG)
    
    # Clear existing handlers
    logger.handlers.clear()
    
    # Create logs directory
    if not os.path.exists('logs'):
        os.makedirs('logs')

    # Console Handler with colors
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    formatter = ColoredFormatter(
        '%(asctime)s | %(levelname)-8s | %(module)s:%(lineno)d | %(message)s',
        datefmt='%H:%M:%S'
    )
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # File Handlers
    # App Log - General Info/Debug
    app_handler = RotatingFileHandler('logs/server.log', maxBytes=10*1024*1024, backupCount=5)
    app_handler.setLevel(logging.INFO)
    app_handler.setFormatter(logging.Formatter('%(asctime)s | %(levelname)-8s | %(message)s'))
    logger.addHandler(app_handler)

    # Error Log - Errors only
    error_handler = RotatingFileHandler('logs/error.log', maxBytes=10*1024*1024, backupCount=5)
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(logging.Formatter('%(asctime)s | %(levelname)-8s | %(module)s | %(message)s'))
    logger.addHandler(error_handler)

    # Action Log - All user actions (replaces audit log DB in auth-less mode)
    action_handler = RotatingFileHandler('logs/actions.log', maxBytes=10*1024*1024, backupCount=5)
    action_handler.setLevel(logging.INFO)
    action_handler.setFormatter(logging.Formatter('%(asctime)s | %(message)s'))
    action_logger = logging.getLogger('exam_hall.actions')
    action_logger.addHandler(action_handler)
    action_logger.setLevel(logging.INFO)
    
    # Attach to Flask app if provided
    if app:
        app.logger.handlers = logger.handlers
        app.logger.setLevel(logger.level)
    
    return logger


class ColoredFormatter(logging.Formatter):
    """Custom formatter with colors for console output."""
    
    COLORS = {
        'DEBUG': '\033[36m',     # Cyan
        'INFO': '\033[32m',      # Green
        'WARNING': '\033[33m',   # Yellow
        'ERROR': '\033[31m',     # Red
        'CRITICAL': '\033[35m',  # Magenta
    }
    RESET = '\033[0m'
    
    def format(self, record):
        color = self.COLORS.get(record.levelname, self.RESET)
        record.levelname = f"{color}{record.levelname}{self.RESET}"
        return super().format(record)


# Create default logger instance
logger = setup_logging()


# Convenience functions
def log_info(message: str, **kwargs):
    """Log an info message with optional context."""
    if kwargs:
        message = f"{message} | {' '.join(f'{k}={v}' for k, v in kwargs.items())}"
    logger.info(message)


def log_error(message: str, error: Exception = None, **kwargs):
    """Log an error message with optional exception details."""
    if error:
        message = f"{message} | error={type(error).__name__}: {str(error)}"
    if kwargs:
        message = f"{message} | {' '.join(f'{k}={v}' for k, v in kwargs.items())}"
    logger.error(message)


def log_warning(message: str, **kwargs):
    """Log a warning message with optional context."""
    if kwargs:
        message = f"{message} | {' '.join(f'{k}={v}' for k, v in kwargs.items())}"
    logger.warning(message)


def log_debug(message: str, **kwargs):
    """Log a debug message with optional context."""
    if kwargs:
        message = f"{message} | {' '.join(f'{k}={v}' for k, v in kwargs.items())}"
    logger.debug(message)


def log_action(action: str, details: str = None):
    """Log a user action to the actions log file."""
    action_logger = logging.getLogger('exam_hall.actions')
    msg = f"ACTION: {action}"
    if details:
        msg += f" | {details}"
    action_logger.info(msg)
