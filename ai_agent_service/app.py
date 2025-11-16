from flask import Flask
from flask_cors import CORS
import logging
from logging.handlers import RotatingFileHandler
import os
import config
from controllers.face_controller import face_bp

# Configure logging
os.makedirs(config.LOG_FILE.parent, exist_ok=True)
handler = RotatingFileHandler(config.LOG_FILE, maxBytes=10485760, backupCount=10)
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)

root_logger = logging.getLogger()
root_logger.setLevel(logging.INFO)
root_logger.addHandler(handler)

console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(formatter)
root_logger.addHandler(console_handler)

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False

CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:9999"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

app.register_blueprint(face_bp)

@app.route('/api/status', methods=['GET'])
def status():
    return {
        'status': 'running',
        'service': 'AI Agent Face Recognition Service',
        'type': 'OpenAI Vision + Embeddings'
    }, 200

if __name__ == '__main__':
    logger = logging.getLogger(__name__)
    logger.info(f"Starting AI Agent Face Service on {config.FLASK_HOST}:{config.FLASK_PORT}")

    app.run(
        host=config.FLASK_HOST,
        port=config.FLASK_PORT,
        debug=config.FLASK_DEBUG,
        threaded=True
    )