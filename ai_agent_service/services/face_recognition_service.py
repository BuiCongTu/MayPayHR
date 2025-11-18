import logging
import numpy as np
from pathlib import Path
import config
from .openai_service import get_openai_service

logger = logging.getLogger(__name__)

class FaceRecognitionService:
    def __init__(self):
        self.openai_service = get_openai_service(config.OPENAI_API_KEY)

    def scan_face(self, image_base64: str) -> dict:
        """
        Scan face and match with trained embeddings
        """
        try:
            logger.info("Starting face scan...")

            # 1. Analyze face quality
            quality_analysis = self.openai_service.analyze_face_quality(image_base64)

            if not quality_analysis.get("face_detected"):
                return {
                    "success": False,
                    "user_id": None,
                    "confidence": 0,
                    "message": "No face detected"
                }

            # 2. Generate embedding for scan
            embedding_result = self.openai_service.generate_face_embedding(image_base64)

            if not embedding_result.get("success"):
                return {
                    "success": False,
                    "user_id": None,
                    "confidence": 0,
                    "message": "Failed to generate embedding"
                }

            scan_embedding = np.array(embedding_result["embedding"])

            # 3. Find best match
            matched_user = self._find_best_match(scan_embedding)

            if matched_user is None:
                return {
                    "success": False,
                    "user_id": None,
                    "confidence": 0,
                    "message": "No matching face found"
                }

            logger.info(f"Face matched. UserId: {matched_user['user_id']}, Confidence: {matched_user['confidence']}")

            return {
                "success": True,
                "user_id": matched_user["user_id"],
                "confidence": matched_user["confidence"],
                "message": "Face matched successfully"
            }

        except Exception as e:
            logger.error(f"Error in scan_face: {e}")
            return {
                "success": False,
                "user_id": None,
                "confidence": 0,
                "message": f"Face scan failed: {str(e)}"
            }

    def _find_best_match(self, scan_embedding: np.ndarray) -> dict:
        """Find best matching trained embedding"""
        try:
            if not config.EMBEDDINGS_DIR.exists():
                logger.warning("Embeddings directory not found")
                return None

            best_match = None
            best_distance = float('inf')

            for embedding_file in config.EMBEDDINGS_DIR.glob("user_*_embedding.npy"):
                try:
                    user_id = int(embedding_file.stem.split('_')[1])
                    trained_embedding = np.load(embedding_file)

                    # Calculate cosine similarity
                    distance = self._cosine_distance(scan_embedding, trained_embedding)

                    logger.debug(f"Distance to user_{user_id}: {distance}")

                    if distance < best_distance:
                        best_distance = distance
                        best_match = {
                            "user_id": user_id,
                            "distance": distance
                        }

                except Exception as e:
                    logger.warning(f"Error processing {embedding_file}: {e}")
                    continue

            if best_match is None:
                return None

            # Convert distance to confidence
            confidence = max(0, 1 - best_match["distance"])
            confidence = min(1.0, confidence)

            best_match["confidence"] = confidence

            return best_match

        except Exception as e:
            logger.error(f"Error finding best match: {e}")
            return None

    @staticmethod
    def _cosine_distance(vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Calculate cosine distance"""
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)

        if norm1 == 0 or norm2 == 0:
            return 1.0

        similarity = dot_product / (norm1 * norm2)
        distance = 1 - similarity

        return max(0, distance)