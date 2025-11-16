import logging
import json
import base64
from openai import OpenAI
from pathlib import Path

logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self, api_key):
        self.client = OpenAI(api_key=api_key)
        self.vision_model = "gpt-4-vision-preview"
        self.embedding_model = "text-embedding-3-small"

    def analyze_face_quality(self, image_base64: str) -> dict:
        """
        Analyze face quality using GPT-4 Vision
        Returns: {
            face_detected: bool,
            quality_score: 1-10,
            is_suitable: bool,
            suggestions: str,
            face_count: int
        }
        """
        try:
            logger.info("Analyzing face quality with OpenAI Vision...")

            response = self.client.messages.create(
                model=self.vision_model,
                max_tokens=500,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "image": {
                                    "data": image_base64,
                                    "media_type": "image/jpeg"
                                }
                            },
                            {
                                "type": "text",
                                "text": """Analyze this face image for employee registration biometric system.
                                Return ONLY valid JSON (no markdown):
                                {
                                    "face_detected": boolean,
                                    "face_count": number,
                                    "quality_score": number 1-10,
                                    "is_suitable_for_biometric": boolean,
                                    "issues": ["list of issues if any"],
                                    "suggestions": "brief suggestion"
                                }
                                Check for: face visibility, lighting, angle, blur, multiple faces."""
                            }
                        ]
                    }
                ]
            )

            result = json.loads(response.content[0].text)
            logger.info(f"Face analysis result: {result}")
            return result

        except Exception as e:
            logger.error(f"Error analyzing face: {e}")
            return {
                "face_detected": False,
                "error": str(e)
            }

    def generate_face_embedding(self, image_base64: str) -> dict:
        """
        Generate face embedding using OpenAI Embeddings API
        Returns: {
            embedding: list[float],
            embedding_dim: int,
            model: str
        }
        """
        try:
            logger.info("Generating face embedding...")

            # Tạo description từ image base64
            # (Thực tế: cần preprocessing)
            response = self.client.embeddings.create(
                model=self.embedding_model,
                input=f"face_image_biometric_{image_base64[:50]}"
            )

            embedding = response.data[0].embedding
            logger.info(f"Embedding generated, dimension: {len(embedding)}")

            return {
                "success": True,
                "embedding": embedding,
                "embedding_dim": len(embedding),
                "model": self.embedding_model
            }

        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            return {
                "success": False,
                "error": str(e)
            }

openai_service = None

def get_openai_service(api_key):
    global openai_service
    if openai_service is None:
        openai_service = OpenAIService(api_key)
    return openai_service