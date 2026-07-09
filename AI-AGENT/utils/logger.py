import os
import logging
from logging.handlers import RotatingFileHandler
from dotenv import load_dotenv

# Ensure .env variables are loaded
load_dotenv()

LOG_LEVEL_STR = os.getenv("LOG_LEVEL", "INFO").upper()
LOG_FILE_PATH = os.getenv("LOG_FILE", "logs/app.log")

# Resolve numeric value for log level
log_level = getattr(logging, LOG_LEVEL_STR, logging.INFO)

# Make logs directory if file path is specified
if LOG_FILE_PATH:
    log_dir = os.path.dirname(LOG_FILE_PATH)
    if log_dir and not os.path.exists(log_dir):
        os.makedirs(log_dir, exist_ok=True)

# Format pattern
FORMAT_PATTERN = "%(asctime)s — %(name)s — %(levelname)s — %(message)s"
formatter = logging.Formatter(FORMAT_PATTERN)

# Root logger configuration
root_logger = logging.getLogger()
root_logger.setLevel(log_level)

# Clear existing handlers to avoid double logging in some environments
if root_logger.handlers:
    root_logger.handlers.clear()

# Stream handler (console)
console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)
root_logger.addHandler(console_handler)

# File handler (if log file path is provided)
if LOG_FILE_PATH:
    try:
        file_handler = RotatingFileHandler(
            LOG_FILE_PATH,
            maxBytes=5 * 1024 * 1024,  # 5MB
            backupCount=3,
            encoding="utf-8"
        )
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)
    except Exception as e:
        print(f"Error configuring logging file handler: {e}")

def get_logger(name: str) -> logging.Logger:
    """
    Returns a configured logger instance with the specified name.
    """
    return logging.getLogger(name)
