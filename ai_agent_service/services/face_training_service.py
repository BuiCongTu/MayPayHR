import logging
import numpy as np
import base64
import json
from datetime import datetime
from pathlib import Path
from PIL import Image
from io import BytesIO
import config
from .openai_service import get_openai_service

logger = logging.getLogger(__name__)

class FaceTrainingService:
    def __init__(self):
        self.openai_service = get_openai_service(config.OPENAI_API_KEY)

    def train_face(self, image_base64: str, user_id: int) -> dict:
        """
        Train/Register face for new employee
        """
        try:
            logger.info(f"Starting face training for user_id: {user_id}")

            # 1. Analyze face quality
            quality_analysis = self.openai_service.analyze_face_quality(image_base64)

            if not quality_analysis.get("face_detected"):
                return {
                    "success": False,
                    "user_id": user_id,
                    "message": "No face detected in image",
                    "quality_analysis": quality_analysis
                }

            if not quality_analysis.get("is_suitable_for_biometric"):
                return {
                    "success": False,
                    "user_id": user_id,
                    "message": f"Face quality not suitable. Issues: {quality_analysis.get('issues')}",
                    "quality_analysis": quality_analysis,
                    "suggestions": quality_analysis.get("suggestions")
                }

            # 2. Generate embedding
            embedding_result = self.openai_service.generate_face_embedding(image_base64)

            if not embedding_result.get("success"):
                return {
                    "success": False,
                    "user_id": user_id,
                    "message": f"Failed to generate embedding: {embedding_result.get('error')}"
                }

            # 3. Save embedding
            embedding = np.array(embedding_result["embedding"])
            embedding_path = self._save_embedding(embedding, user_id)

            # 4. Save training image
            image_path = self._save_image(image_base64, user_id, "train")

            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

            logger.info(f"Face training completed for user_id: {user_id}")

            return {
                "success": True,
                "user_id": user_id,
                "embedding_path": str(embedding_path),
                "image_path": str(image_path),
                "quality_score": quality_analysis.get("quality_score"),
                "embedding_dim": embedding_result.get("embedding_dim"),
                "model": embedding_result.get("model"),
                "timestamp": timestamp,
                "message": "Face training successful"
            }

        except Exception as e:
            logger.error(f"Error in train_face: {e}")
            return {
                "success": False,
                "user_id": user_id,
                "message": f"Face training failed: {str(e)}"
            }

    def _save_embedding(self, embedding: np.ndarray, user_id: int) -> Path:
        """Save embedding as numpy file"""
        embedding_path = config.EMBEDDINGS_DIR / f"user_{user_id}_embedding.npy"
        np.save(embedding_path, embedding)
        logger.info(f"Embedding saved to {embedding_path}")
        return embedding_path

    def _save_image(self, image_base64: str, user_id: int, prefix: str = "train") -> Path:
        """Save image from base64"""
        try:
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]

            image_data = base64.b64decode(image_base64)
            image = Image.open(BytesIO(image_data))

            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            image_path = config.SCANNED_IMAGES_DIR / f"user_{user_id}_{prefix}_{timestamp}.jpg"
            image.save(image_path)

            logger.info(f"Image saved to {image_path}")
            return image_path

        except Exception as e:
            logger.error(f"Error saving image: {e}")
            raise