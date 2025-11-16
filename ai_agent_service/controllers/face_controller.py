from flask import Blueprint, request, jsonify
import logging
from ..services.face_training_service import FaceTrainingService
from ..services.face_recognition_service import FaceRecognitionService

logger = logging.getLogger(__name__)

face_bp = Blueprint('face', __name__, url_prefix='/api/face')

training_service = FaceTrainingService()
recognition_service = FaceRecognitionService()

@face_bp.route('/train', methods=['POST'])
def train_face():
    """Train/Register face for new employee"""
    try:
        data = request.get_json(silent=True) or {}
        image_base64 = data.get('image')
        user_id = data.get('user_id')

        if not image_base64 or not user_id:
            return jsonify({'error': 'Missing image or user_id'}), 400

        result = training_service.train_face(image_base64, user_id)

        if result.get('success'):
            return jsonify(result), 200
        else:
            return jsonify(result), 400

    except Exception as e:
        logger.error(f"Error in train_face endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@face_bp.route('/recognize', methods=['POST'])
def recognize_face():
    """Recognize/Scan face"""
    try:
        data = request.get_json(silent=True) or {}
        image_base64 = data.get('image')

        if not image_base64:
            return jsonify({'error': 'Missing image'}), 400

        result = recognition_service.scan_face(image_base64)

        if result.get('success'):
            return jsonify(result), 200
        else:
            return jsonify(result), 400

    except Exception as e:
        logger.error(f"Error in recognize_face endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@face_bp.route('/status', methods=['GET'])
def status():
    """API status"""
    return jsonify({'status': 'running', 'service': 'AI Agent Face Service'}), 200