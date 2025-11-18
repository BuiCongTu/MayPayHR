import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).parent
STORAGE_DIR = BASE_DIR / "storage"
EMBEDDINGS_DIR = STORAGE_DIR / "embeddings"
SCANNED_IMAGES_DIR = STORAGE_DIR / "scanned_images"

os.makedirs(EMBEDDINGS_DIR, exist_ok=True)
os.makedirs(SCANNED_IMAGES_DIR, exist_ok=True)

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL_VISION = "gpt-4-vision-preview"
OPENAI_MODEL_EMBEDDING = "text-embedding-3-small"

# Face Recognition Config
CONFIDENCE_THRESHOLD = 0.65
FACE_EMBEDDING_DIM = 1536  # Ada embedding dimension
MAX_IMAGE_SIZE = (224, 224)

# Flask Config
FLASK_DEBUG = os.getenv("FLASK_DEBUG", True)
FLASK_PORT = int(os.getenv("FLASK_PORT", 5001))
FLASK_HOST = os.getenv("FLASK_HOST", "0.0.0.0")

# Spring Boot config
SPRING_BOOT_URL = "http://localhost:9999"

# Logging
LOG_LEVEL = "INFO"
LOG_FILE = BASE_DIR / "logs" / "app.log"
os.makedirs(LOG_FILE.parent, exist_ok=True)