import os
import cv2
import time
import sqlite3
import numpy as np
import joblib
import subprocess
import platform
from datetime import datetime

try:
    import face_recognition
except Exception as e:
            # Xử lý face detection mỗi N frames
            if frame_count % PROCESS_EVERY_N_FRAMES == 0: # type: ignore
                # Resize để tăng tốc độ nhưng vẫn giữ chất lượng
                small = cv2.resize(frame, (0, 0), fx=RESIZE_FACTOR, fy=RESIZE_FACTOR) # pyright: ignore[reportUndefinedVariable]
                
                # Face detection với mask support
                face_locations, enhanced_small = detect_faces_with_mask_support(small) # pyright: ignore[reportUndefinedVariable]
                
                # Scale back to original size
                scale_factor = 1.0 / RESIZE_FACTOR # pyright: ignore[reportUndefinedVariable]
                boxes = []
                for (t, r, b, l) in face_locations:
                    boxes.append((
                        int(t * scale_factor),
                        int(r * scale_factor),
                        int(b * scale_factor),
                        int(l * scale_factor)
                    ))or(f"Thiếu thư viện 'face_recognition': {e}")

# Cấu hình
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
DB_PATH = os.path.join(BASE_DIR, "students.db")
TABLE_NAME = "Student"

SVM_PATH = os.path.join(MODELS_DIR, "svm_model.pkl")
SCALER_PATH = os.path.join(MODELS_DIR, "normalizer.pkl")
SIMPLE_PATH = os.path.join(MODELS_DIR, "simple_model.pkl")
METADATA_PATH = os.path.join(MODELS_DIR, "model_metadata.pkl")

_model_cache = None
_scaler_cache = None
_metadata_cache = None
_last_load_time = 0
CACHE_TIMEOUT = 300

# Thông số tối ưu cho nhận diện với khẩu trang - AN TOÀN
THRESHOLD = 0.55  # Tăng threshold để tránh nhận nhầm người (QUAN TRỌNG!)
MIN_CONFIDENCE_GAP = 0.15  # Chênh lệch tối thiểu giữa top-1 và top-2 (15%)
PROCESS_EVERY_N_FRAMES = 2  # Xử lý nhiều frame hơn để chính xác hơn
RESIZE_FACTOR = 0.4  # Tăng độ phân giải để nhận diện tốt hơn
TARGET_FPS = 15  # Giảm FPS để ổn định

# Cấu hình camera
CAMERA_WIDTH = 640  # Tăng chất lượng camera
CAMERA_HEIGHT = 480
FACE_DETECTION_SCALE = 1.1  # Giảm scale để detect chính xác hơn
MIN_NEIGHBORS = 3  # Giảm để detect nhạy hơn với khẩu trang

def speak(text):
    """Cross-platform text-to-speech - Hỗ trợ cả macOS và Windows"""
    try:
        system = platform.system()
        if system == 'Darwin':  # macOS
            subprocess.Popen(['say', '-v', 'Samantha', text],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL)
        elif system == 'Windows':  # Windows
            # Sử dụng PowerShell với giọng nữ Zira (Windows 10/11)
            ps_command = f'''
            Add-Type -AssemblyName System.Speech
            $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
            $synth.SelectVoiceByHints([System.Speech.Synthesis.VoiceGender]::Female)
            $synth.Speak("{text}")
            '''
            subprocess.Popen(['powershell', '-Command', ps_command],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                        creationflags=subprocess.CREATE_NO_WINDOW if hasattr(subprocess, 'CREATE_NO_WINDOW') else 0)
        # Linux: Có thể thêm espeak hoặc festival nếu cần
    except Exception:
        # Silent fail - không làm gì nếu TTS không khả dụng
        pass

def enhance_image_quality(frame):
    """Cải thiện chất lượng ảnh - tối ưu cho nhận diện với khẩu trang"""
    # Tăng độ tương phản để nổi bật vùng mắt và trán
    lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    
    # CLAHE để cải thiện độ tương phản cục bộ (quan trọng cho vùng mắt)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    l = clahe.apply(l)
    
    enhanced = cv2.merge([l, a, b])
    enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)
    
    # Tăng độ sắc nét
    kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
    enhanced = cv2.filter2D(enhanced, -1, kernel)
    
    return enhanced

def detect_faces_with_mask_support(frame):
    """Face detection được tối ưu cho nhận diện với khẩu trang"""
    # Cải thiện chất lượng ảnh để detect tốt hơn vùng mắt
    enhanced_frame = enhance_image_quality(frame)
    rgb_frame = cv2.cvtColor(enhanced_frame, cv2.COLOR_BGR2RGB)
    
    # Sử dụng CNN model cho độ chính xác cao hơn với khẩu trang
    try:
        # CNN tốt hơn HOG khi nhận diện khuôn mặt đeo khẩu trang
        face_locations = face_recognition.face_locations(rgb_frame, model="cnn", number_of_times_to_upsample=1)
        
        # Nếu không detect được, thử HOG
        if not face_locations:
            face_locations = face_recognition.face_locations(rgb_frame, model="hog")
    except:
        # Fallback về Haar cascade nếu cần
        gray = cv2.cvtColor(enhanced_frame, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, FACE_DETECTION_SCALE, MIN_NEIGHBORS)
        face_locations = [(y, x+w, y+h, x) for (x, y, w, h) in faces]
    
    return face_locations, enhanced_frame
    
def extract_face_encodings_with_mask_support(frame, boxes):
    """Extract face encodings được tối ưu cho nhận diện với khẩu trang"""
    if not boxes:
        return []
    
    # Enhance image để encoding chính xác hơn
    enhanced_frame = enhance_image_quality(frame)
    rgb_frame = cv2.cvtColor(enhanced_frame, cv2.COLOR_BGR2RGB)
    
    encodings = []
    for box in boxes:
        try:
            # Tăng num_jitters để encoding chính xác hơn với khẩu trang
            # Dùng model lớn để extract features tốt hơn từ vùng mắt
            encoding = face_recognition.face_encodings(
                rgb_frame,
                [box],
                num_jitters=5,  # Tăng lên 5 để chính xác hơn
                model="large"   # Dùng model lớn cho độ chính xác
            )
            if encoding:
                encodings.extend(encoding)
        except Exception as e:
            print(f" Lỗi encoding: {e}")
            continue
    
    return encodings

def init_attendance_table():
    """Khởi tạo bảng điểm danh"""
    conn = sqlite3.connect(DB_PATH)
    try:
        cur = conn.cursor()
        cur.execute('''
            CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT NOT NULL,
                student_name TEXT NOT NULL,
                session TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                confidence REAL,
                FOREIGN KEY (student_id) REFERENCES Student (id)
            )
        ''')
        conn.commit()
    finally:
        conn.close()

def record_attendance(student_id: str, student_name: str, confidence: float):
    """Ghi nhận điểm danh - chỉ 1 lần mỗi ca"""
    now = datetime.now()
    date_str = now.strftime("%Y-%m-%d")
    
    # Xác định ca học
    hour = now.hour
    if hour < 12:
        session = "sáng"
    elif hour < 17:
        session = "chiều"
    else:
        session = "tối"
    
    conn = sqlite3.connect(DB_PATH)
    try:
        cur = conn.cursor()
        
        # Kiểm tra đã điểm danh ca này hôm nay chưa
        cur.execute('''
            SELECT id FROM attendance
            WHERE student_id = ? AND timestamp LIKE ? AND session = ?
        ''', (student_id, f"{date_str}%", session))
        
        existing_record = cur.fetchone()
        
        if existing_record:
            return False, f"Already attended this session"
        
        # Ghi nhận điểm danh mới
        timestamp = now.strftime("%Y-%m-%d %H:%M:%S")
        cur.execute('''
            INSERT INTO attendance
            (student_id, student_name, session, timestamp, confidence)
            VALUES (?, ?, ?, ?, ?)
        ''', (student_id, student_name, session, timestamp, confidence))
        
        conn.commit()
        return True, f"Attendance recorded for {session} session"
        
    finally:
        conn.close()

def get_today_attendance():
    """Lấy danh sách điểm danh ngày hôm nay"""
    today = datetime.now().strftime("%Y-%m-%d")
    conn = sqlite3.connect(DB_PATH)
    try:
        cur = conn.cursor()
        cur.execute('''
            SELECT student_name, session, datetime(timestamp) as time
            FROM attendance
            WHERE date(timestamp) = ?
            ORDER BY timestamp DESC
        ''', (today,))
        
        results = []
        for row in cur.fetchall():
            results.append({
                'name': row[0],
                'session': row[1],
                'time': row[2]
            })
        return results
    finally:
        conn.close()

def get_profile(student_id: str):
    """Lấy thông tin sinh viên từ database"""
    conn = sqlite3.connect(DB_PATH)
    try:
        cur = conn.cursor()
        cur.execute(f"SELECT id, name FROM {TABLE_NAME} WHERE id = ?", (student_id,))
        row = cur.fetchone()
        return {"id": row[0], "name": row[1]} if row else None
    finally:
        conn.close()

def load_model():
    global _model_cache, _scaler_cache, _metadata_cache, _last_load_time
    
    current_time = time.time()
    if _model_cache is not None and (current_time - _last_load_time) < CACHE_TIMEOUT:
        return _model_cache, _scaler_cache, _metadata_cache.get('model_type', 'svm')
    
    if os.path.exists(SVM_PATH) and os.path.exists(SCALER_PATH):
        _model_cache = joblib.load(SVM_PATH)
        _scaler_cache = joblib.load(SCALER_PATH)
        
        if os.path.exists(METADATA_PATH):
            _metadata_cache = joblib.load(METADATA_PATH)
            model_type = _metadata_cache.get('model_type', 'svm_linear')
            print(f" Sử dụng {model_type} model")
        else:
            _metadata_cache = {'model_type': 'svm_linear'}
            model_type = 'svm_linear'
            print("Sử dụng SVM model")
        
        _last_load_time = current_time
        return _model_cache, _scaler_cache, model_type
        
    elif os.path.exists(SIMPLE_PATH):
        print(" Sử dụng Simple Matching model")
        _model_cache = joblib.load(SIMPLE_PATH)
        _scaler_cache = None
        _metadata_cache = {'model_type': 'simple'}
        _last_load_time = current_time
        return _model_cache, None, 'simple'
    else:
        raise FileNotFoundError("Chưa có model. Vui lòng huấn luyện trước!")

def predict_identity(encodings, model, scaler, model_type):
    if model_type in ['svm_linear', 'svm_rbf', 'svm']:
        Xn = scaler.transform(encodings)
        probs = model.predict_proba(Xn)
        classes = model.classes_
        
        results = []
        for prob_row in probs:
            # Lấy top-2 predictions để kiểm tra độ chênh lệch
            sorted_indices = np.argsort(prob_row)[::-1]  # Sắp xếp giảm dần
            best_idx = sorted_indices[0]
            best_prob = prob_row[best_idx]
            best_class = classes[best_idx]
            
            # Tính độ chênh lệch với top-2 (nếu có)
            confidence_gap = 0.0
            if len(sorted_indices) > 1:
                second_idx = sorted_indices[1]
                second_prob = prob_row[second_idx]
                confidence_gap = best_prob - second_prob
            
            results.append((best_class, best_prob, confidence_gap))
        return results
    
    elif model_type == 'knn':
        Xn = scaler.transform(encodings)
        probs = model.predict_proba(Xn)
        classes = model.classes_
        
        results = []
        for prob_row in probs:
            # Lấy top-2 predictions để kiểm tra độ chênh lệch
            sorted_indices = np.argsort(prob_row)[::-1]  # Sắp xếp giảm dần
            best_idx = sorted_indices[0]
            best_prob = prob_row[best_idx]
            best_class = classes[best_idx]
            
            # Tính độ chênh lệch với top-2 (nếu có)
            confidence_gap = 0.0
            if len(sorted_indices) > 1:
                second_idx = sorted_indices[1]
                second_prob = prob_row[second_idx]
                confidence_gap = best_prob - second_prob
            
            results.append((best_class, best_prob, confidence_gap))
        return results
    
    else:
        ref_embedding = model['reference_embedding']
        student_id = model['student_id']
        threshold = model['threshold']
        
        results = []
        for encoding in encodings:
            similarity = np.dot(encoding, ref_embedding) / (
                np.linalg.norm(encoding) * np.linalg.norm(ref_embedding)
            )
            
            # Simple model không có confidence gap
            confidence_gap = 0.0
            
            if similarity > threshold:
                results.append((student_id, similarity, confidence_gap))
            else:
                results.append(("unknown", similarity, confidence_gap))
        
        return results

def draw_label(frame, text, pos, color=(0, 255, 0)):
    """Vẽ label với background và outline tốt hơn"""
    x, y = pos
    font = cv2.FONT_HERSHEY_DUPLEX  # Font đẹp hơn SIMPLEX
    font_scale = 0.6
    thickness = 1
    
    (text_width, text_height), baseline = cv2.getTextSize(text, font, font_scale, thickness)
    
    # Background với padding
    padding = 5
    cv2.rectangle(frame, (x-padding, y - text_height - padding*2),
                (x + text_width + padding, y + padding), color, -1)
    
    # Text outline (black border)
    cv2.putText(frame, text, (x, y - 5), font, font_scale, (0, 0, 0), thickness + 1)
    # Text chính (white)
    cv2.putText(frame, text, (x, y - 5), font, font_scale, (255, 255, 255), thickness)

def init_camera():
    """Khởi tạo camera chất lượng cao cho detection với khẩu trang"""
    cap = cv2.VideoCapture(0, cv2.CAP_ANY)
    if not cap.isOpened():
        raise RuntimeError("Không thể mở camera!")
    
    # Thiết lập chất lượng cao
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, CAMERA_WIDTH)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, CAMERA_HEIGHT)
    cap.set(cv2.CAP_PROP_FPS, TARGET_FPS)
    
    # Tối ưu cho lighting conditions
    cap.set(cv2.CAP_PROP_AUTO_EXPOSURE, 0.25)  # Giảm auto exposure
    cap.set(cv2.CAP_PROP_BRIGHTNESS, 0.1)     # Tăng brightness nhẹ
    cap.set(cv2.CAP_PROP_CONTRAST, 0.2)       # Tăng contrast
    
    print(f"Camera setup: {CAMERA_WIDTH}x{CAMERA_HEIGHT} @ {TARGET_FPS}FPS")
    time.sleep(1)  # Chờ camera ổn định
    return cap

def main():
    print(" Khởi động hệ thống nhận diện khuôn mặt - HỖ TRỢ KHẨU TRANG")
    print("=" * 60)
    
    # Khởi tạo bảng điểm danh
    init_attendance_table()
    
    # Load model
    model, scaler, model_type = load_model()
    
    # Khởi tạo camera
    cap = init_camera()
    
    print(f"\n Model: {model_type.upper()}")
    print(f" Threshold: {THRESHOLD} (AN TOÀN - tránh nhận nhầm)")
    print(f" Min Confidence Gap: {MIN_CONFIDENCE_GAP} (chênh lệch tối thiểu)")
    print(f" CNN Detection + CLAHE Enhancement")
    print(f" High-quality encoding (5 jitters)")
    print("\n Hướng dẫn:")
    print("  - Nhìn thẳng vào camera")
    print("  - Đeo khẩu trang KHÔNG che mắt")
    print("  - Giữ khoảng cách 30-50cm từ camera")
    print("  - Ánh sáng đủ (không quá tối)")
    print("\nPress 'q' to quit, 'a' to view attendance list\n")
    
    # Biến trạng thái
    frame_count = 0
    prev_time = time.time()
    fps = 0.0
    
    # Biến điểm danh
    attendance_messages = []   # Lưu thông báo điểm danh
    message_display_time = 3   # Giây hiển thị thông báo
    already_notified = set()   # Tránh spam thông báo "đã điểm danh"
    
    # Cache kết quả để tái sử dụng
    cached_boxes = []
    cached_names = []
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret or frame is None:
                print("Không đọc được frame!")
                break
            
            frame_count += 1
            
            # Tính FPS
            now = time.time()
            dt = now - prev_time
            prev_time = now
            fps = 0.9 * fps + 0.1 * (1.0 / dt if dt > 0 else 0.0)
            
            # Chỉ xử lý face detection định kỳ
            if frame_count % PROCESS_EVERY_N_FRAMES == 0:
                # Resize để tăng tốc độ nhưng vẫn giữ chất lượng
                small = cv2.resize(frame, (0, 0), fx=RESIZE_FACTOR, fy=RESIZE_FACTOR)
                
                # Face detection với mask support
                face_locations, enhanced_small = detect_faces_with_mask_support(small)
                
                # Scale back to original size
                scale_factor = 1.0 / RESIZE_FACTOR
                boxes = []
                for (t, r, b, l) in face_locations:
                    boxes.append((
                        int(t * scale_factor),
                        int(r * scale_factor),
                        int(b * scale_factor),
                        int(l * scale_factor)
                    ))
                
                names = []
                if boxes:
                    try:
                        # Get face encodings với mask support
                        encodings = extract_face_encodings_with_mask_support(frame, boxes)
                        
                        if encodings:
                            # Predict
                            results = predict_identity(
                                np.vstack(encodings), model, scaler, model_type
                            )
                            
                            for label, score, confidence_gap in results:
                                if model_type in ['svm', 'svm_linear', 'svm_rbf', 'knn']:
                                    # Kiểm tra cả threshold VÀ confidence gap để tránh nhận nhầm
                                    is_confident = (score >= THRESHOLD) and (confidence_gap >= MIN_CONFIDENCE_GAP)
                                    score_text = f"{score*100:.1f}%"
                                    gap_text = f"(gap:{confidence_gap*100:.1f}%)"
                                    
                                    # Cảnh báo nếu confidence gap thấp
                                    if score >= THRESHOLD and confidence_gap < MIN_CONFIDENCE_GAP:
                                        print(f"\n  CẢNH BÁO: Độ tin cậy {score_text} đủ cao nhưng gap {gap_text} quá thấp!")
                                        print(f"   → Có thể nhầm lẫn giữa nhiều người. Yêu cầu nhìn rõ hơn!\n")
                                else:
                                    is_confident = label != "unknown"
                                    score_text = f"{score:.3f}"
                                    gap_text = ""
                                
                                if is_confident:
                                    profile = get_profile(str(label))
                                    if profile:
                                        student_id = profile['id']
                                        student_name = profile['name']
                                        # Hiển thị cả gap nếu có
                                        display_text = f" {student_name} ({score_text})"
                                        if gap_text:
                                            display_text += f" {gap_text}"
                                        names.append(display_text)
                                        
                                        # Xử lý điểm danh với logic thông minh
                                        success, message = record_attendance(student_id, student_name, score)
                                        
                                        if success:
                                            # Điểm danh thành công - thông báo xanh
                                            success_msg = f" ĐIỂM DANH THÀNH CÔNG: {student_name} [{student_id}]"
                                            attendance_messages.append({
                                                'message': success_msg,
                                                'time': time.time(),
                                                'color': (0, 255, 0),  # Xanh lá
                                                'type': 'success'
                                            })
                                            print(f"\n{'='*60}")
                                            print(f" ĐIỂM DANH THÀNH CÔNG!")
                                            print(f"  Tên: {student_name}")
                                            print(f"  ID: {student_id}")
                                            print(f"  Ca: {message.split('for ')[1] if 'for' in message else 'N/A'}")
                                            print(f"  Độ tin cậy: {score_text}")
                                            if gap_text:
                                                print(f"  Độ chênh lệch: {gap_text}")
                                            print(f"{'='*60}\n")
                                            
                                            # Phát âm thanh thông báo (cross-platform)
                                            try:
                                                print('\a')  # Terminal beep
                                                speak('Thank you!')
                                            except Exception:
                                                pass
                                            
                                            # Xóa khỏi set đã thông báo để có thể thông báo lại ở ca khác
                                            already_notified.discard(student_id)
                                        else:
                                            # Đã điểm danh rồi - chỉ hiển thị 1 lần để không spam
                                            if student_id not in already_notified:
                                                warning_msg = f" ĐÃ ĐIỂM DANH: {student_name} [{student_id}]"
                                                attendance_messages.append({
                                                    'message': warning_msg,
                                                    'time': time.time(),
                                                    'color': (0, 165, 255),  # Cam
                                                    'type': 'warning'
                                                })
                                                print(f"\n {student_name} [{student_id}] đã điểm danh ca này rồi!\n")
                                                
                                                # Phát âm thanh thông báo đã điểm danh (cross-platform)
                                                try:
                                                    speak('You have already attended!')
                                                except Exception:
                                                    pass
                                                
                                                already_notified.add(student_id)
                                    else:
                                        names.append(f" {label} ({score_text}) - Chưa đăng ký")
                                        # Thông báo người lạ/chưa đăng ký
                                        unknown_key = f"unknown_{label}"
                                        if unknown_key not in already_notified:
                                            attendance_messages.append({
                                                'message': f" Phát hiện ID không tồn tại: {label}",
                                                'time': time.time(),
                                                'color': (0, 165, 255),
                                                'type': 'warning'
                                            })
                                            already_notified.add(unknown_key)
                                else:
                                    names.append(f" Unknown ({score_text})")
                                    # Thông báo không nhận diện được
                                    if "no_recognition" not in already_notified:
                                        attendance_messages.append({
                                            'message': f" Không nhận diện được - Độ tin cậy thấp ({score_text})",
                                            'time': time.time(),
                                            'color': (0, 0, 255),
                                            'type': 'error'
                                        })
                                        already_notified.add("no_recognition")
                                        # Reset sau 2 giây
                                        import threading
                                        def reset_flag():
                                            time.sleep(2)
                                            already_notified.discard("no_recognition")
                                        threading.Thread(target=reset_flag, daemon=True).start()
                        
                    except Exception as e:
                        print(f"Lỗi xử lý: {e}")
                        names = ["Error"] * len(boxes)
                
                # Update cache
                cached_boxes = boxes
                cached_names = names
            
            # Vẽ kết quả (sử dụng cache)
            for i, (t, r, b, l) in enumerate(cached_boxes):
                if i < len(cached_names):
                    # Màu sắc tùy theo kết quả
                    if "" in cached_names[i]:
                        color = (0, 255, 0)  # Xanh lá - nhận diện thành công
                        box_thickness = 3
                    elif "" in cached_names[i]:
                        color = (0, 0, 255)  # Đỏ - không nhận diện được
                        box_thickness = 2
                    elif "" in cached_names[i]:
                        color = (0, 165, 255)  # Cam - cảnh báo
                        box_thickness = 2
                    else:
                        color = (128, 128, 128)  # Xám - lỗi
                        box_thickness = 2
                    
                    cv2.rectangle(frame, (l, t), (r, b), color, box_thickness)
                    draw_label(frame, cached_names[i], (l, t), color=color)
            
            # Hiển thị thông tin hệ thống với font tốt hơn
            font = cv2.FONT_HERSHEY_DUPLEX
            font_scale = 0.5
            thickness = 1
            
            info_y = 25
            # Text với outline
            cv2.putText(frame, f"FPS: {fps:.1f}", (10, info_y),
                    font, font_scale, (0, 0, 0), thickness + 1)  # Outline
            cv2.putText(frame, f"FPS: {fps:.1f}", (10, info_y),
                    font, font_scale, (255, 255, 255), thickness)  # Text chính
            
            info_y += 22
            cv2.putText(frame, f"Model: {model_type.upper()}", (10, info_y),
                    font, font_scale, (0, 0, 0), thickness + 1)
            cv2.putText(frame, f"Model: {model_type.upper()}", (10, info_y),
                    font, font_scale, (255, 255, 255), thickness)
            
            info_y += 22
            cv2.putText(frame, f"Faces: {len(cached_boxes)}", (10, info_y),
                    font, font_scale, (0, 0, 0), thickness + 1)
            cv2.putText(frame, f"Faces: {len(cached_boxes)}", (10, info_y),
                    font, font_scale, (255, 255, 255), thickness)
            
            info_y += 22
            cv2.putText(frame, f"Threshold: {THRESHOLD}", (10, info_y),
                    font, font_scale, (0, 0, 0), thickness + 1)
            cv2.putText(frame, f"Threshold: {THRESHOLD}", (10, info_y),
                    font, font_scale, (255, 255, 255), thickness)
            
            info_y += 22
            cv2.putText(frame, f"Min Gap: {MIN_CONFIDENCE_GAP}", (10, info_y),
                    font, font_scale, (0, 0, 0), thickness + 1)
            cv2.putText(frame, f"Min Gap: {MIN_CONFIDENCE_GAP}", (10, info_y),
                    font, font_scale, (255, 255, 255), thickness)
            
            # Hiển thị ca học hiện tại với font đẹp
            info_y += 22
            current_hour = datetime.now().hour
            if current_hour < 12:
                session_info = "Session: Morning"
                session_color = (0, 255, 255)  # Vàng
            elif current_hour < 17:
                session_info = "Session: Afternoon"
                session_color = (0, 165, 255)  # Cam
            else:
                session_info = "Session: Evening"
                session_color = (255, 0, 255)  # Tím
                
            cv2.putText(frame, session_info, (10, info_y),
                    font, font_scale, (0, 0, 0), thickness + 1)  # Outline
            cv2.putText(frame, session_info, (10, info_y),
                    font, font_scale, session_color, thickness)  # Text chính
            
            # Hiển thị status bar ở góc phải
            status_x = frame.shape[1] - 320
            status_y = 25
            status_font = cv2.FONT_HERSHEY_DUPLEX
            status_scale = 0.5
            status_thickness = 1
            
            # Xác định trạng thái hiện tại
            if len(cached_boxes) == 0:
                status_text = " Đang tìm khuôn mặt..."
                status_color = (128, 128, 128)  # Xám
            elif len([n for n in cached_names if "" in n]) > 0:
                status_text = " Nhận diện thành công!"
                status_color = (0, 255, 0)  # Xanh
            elif len([n for n in cached_names if "" in n]) > 0:
                status_text = " Không nhận diện được"
                status_color = (0, 0, 255)  # Đỏ
            else:
                status_text = " Đang xử lý..."
                status_color = (0, 165, 255)  # Cam
            
            # Vẽ background cho status
            (status_w, status_h), _ = cv2.getTextSize(status_text, status_font, status_scale, status_thickness)
            cv2.rectangle(frame, 
                        (status_x - 10, status_y - status_h - 8),
                        (status_x + status_w + 10, status_y + 8),
                        (0, 0, 0), -1)
            cv2.rectangle(frame, 
                        (status_x - 10, status_y - status_h - 8),
                        (status_x + status_w + 10, status_y + 8),
                        status_color, 2)
            
            # Vẽ status text
            cv2.putText(frame, status_text, (status_x, status_y),
                    status_font, status_scale, (0, 0, 0), status_thickness + 1)
            cv2.putText(frame, status_text, (status_x, status_y),
                    status_font, status_scale, status_color, status_thickness)
            
            # Hiển thị thông báo điểm danh với font đẹp và background
            message_y = info_y + 40
            current_time = time.time()
            for i, msg in enumerate(attendance_messages[:]):
                if current_time - msg['time'] < message_display_time:
                    # Tính kích thước text để vẽ background
                    msg_text = msg['message']
                    msg_font = cv2.FONT_HERSHEY_DUPLEX
                    msg_scale = 0.65
                    msg_thickness = 2
                    (text_width, text_height), baseline = cv2.getTextSize(msg_text, msg_font, msg_scale, msg_thickness)
                    
                    # Vẽ background với padding
                    padding = 8
                    bg_color = (0, 0, 0)  # Đen
                    if msg.get('type') == 'success':
                        bg_color = (0, 100, 0)  # Xanh đậm
                    elif msg.get('type') == 'warning':
                        bg_color = (0, 80, 130)  # Cam đậm
                    elif msg.get('type') == 'error':
                        bg_color = (0, 0, 100)  # Đỏ đậm
                    
                    cv2.rectangle(frame, 
                                (5, message_y - text_height - padding),
                                (15 + text_width + padding, message_y + padding),
                                bg_color, -1)
                    
                    # Vẽ border
                    cv2.rectangle(frame, 
                                (5, message_y - text_height - padding),
                                (15 + text_width + padding, message_y + padding),
                                msg['color'], 2)
                    
                    # Message với outline
                    cv2.putText(frame, msg_text, (10, message_y),
                            msg_font, msg_scale, (0, 0, 0), msg_thickness + 1)  # Outline
                    cv2.putText(frame, msg_text, (10, message_y),
                            msg_font, msg_scale, msg['color'], msg_thickness)  # Text chính
                    message_y += text_height + padding * 2 + 5
                else:
                    attendance_messages.remove(msg)
            
            # Vẽ banner hướng dẫn ở dưới màn hình
            banner_height = 80
            banner_y = frame.shape[0] - banner_height
            
            # Background cho banner
            overlay = frame.copy()
            cv2.rectangle(overlay, (0, banner_y), (frame.shape[1], frame.shape[0]), (20, 20, 20), -1)
            cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)
            
            # Border trên banner
            cv2.line(frame, (0, banner_y), (frame.shape[1], banner_y), (100, 100, 100), 2)
            
            # Hướng dẫn với icon
            instruction_font = cv2.FONT_HERSHEY_DUPLEX
            instruction_scale = 0.45
            instruction_thickness = 1
            
            inst_y = banner_y + 25
            
            # Line 1: Keyboard shortcuts
            cv2.putText(frame, "  Phím tắt:", (15, inst_y),
                    instruction_font, instruction_scale, (0, 0, 0), instruction_thickness + 1)
            cv2.putText(frame, "  Phím tắt:", (15, inst_y),
                    instruction_font, instruction_scale, (100, 200, 255), instruction_thickness)
            
            cv2.putText(frame, "'q' = Thoát", (150, inst_y),
                    instruction_font, instruction_scale, (0, 0, 0), instruction_thickness + 1)
            cv2.putText(frame, "'q' = Thoát", (150, inst_y),
                    instruction_font, instruction_scale, (255, 255, 255), instruction_thickness)
            
            cv2.putText(frame, "'a' = Xem DS điểm danh", (280, inst_y),
                    instruction_font, instruction_scale, (0, 0, 0), instruction_thickness + 1)
            cv2.putText(frame, "'a' = Xem DS điểm danh", (280, inst_y),
                    instruction_font, instruction_scale, (255, 255, 255), instruction_thickness)
            
            inst_y += 25
            
            # Line 2: Instructions
            cv2.putText(frame, " Lưu ý:", (15, inst_y),
                    instruction_font, instruction_scale, (0, 0, 0), instruction_thickness + 1)
            cv2.putText(frame, " Lưu ý:", (15, inst_y),
                    instruction_font, instruction_scale, (100, 255, 100), instruction_thickness)
            
            cv2.putText(frame, "Nhìn thẳng camera", (120, inst_y),
                    instruction_font, instruction_scale, (0, 0, 0), instruction_thickness + 1)
            cv2.putText(frame, "Nhìn thẳng camera", (120, inst_y),
                    instruction_font, instruction_scale, (255, 255, 255), instruction_thickness)
            
            cv2.putText(frame, "| Giữ khoảng cách 30-50cm", (300, inst_y),
                    instruction_font, instruction_scale, (0, 0, 0), instruction_thickness + 1)
            cv2.putText(frame, "| Giữ khoảng cách 30-50cm", (300, inst_y),
                    instruction_font, instruction_scale, (255, 255, 255), instruction_thickness)
            
            inst_y += 25
            
            # Line 3: Session info
            cv2.putText(frame, " Mỗi ca học chỉ điểm danh 1 lần | Hỗ trợ nhận diện khi đeo khẩu trang", (15, inst_y),
                    instruction_font, instruction_scale, (0, 0, 0), instruction_thickness + 1)
            cv2.putText(frame, " Mỗi ca học chỉ điểm danh 1 lần | Hỗ trợ nhận diện khi đeo khẩu trang", (15, inst_y),
                    instruction_font, instruction_scale, (0, 255, 255), instruction_thickness)
            
            cv2.imshow("Face Recognition Attendance System", frame)
            
            # Kiểm tra phím - với delay nhỏ hơn để responsive hơn
            key = cv2.waitKey(30) & 0xFF
            
            if key == ord('q'):
                print(" Đang thoát...")
                break
            elif key == ord('a') or key == ord('A'):
                # Hiển thị danh sách điểm danh hôm nay
                print(f"\n Key pressed: {chr(key) if 32 <= key <= 126 else key}")
                today_attendance = get_today_attendance()
                print("\n TODAY'S ATTENDANCE LIST:")
                print("=" * 50)
                if today_attendance:
                    for record in today_attendance:
                        print(f"{record['name']} - {record['session']} ({record['time']})")
                else:
                    print("📝 No attendance recorded today")
                print("=" * 50)
                print("💡 Press Enter to continue...")
                input()  # Pause để đọc kết quả
            elif 32 <= key <= 126:  # Debug: in ra tất cả phím được nhấn (chỉ ký tự có thể in)
                print(f"Debug - Phím được nhấn: {key} (chr: {chr(key)})")
                
    except KeyboardInterrupt:
        print("\nDừng bởi người dùng")
    except Exception as e:
        print(f"Lỗi: {e}")
    finally:
        cap.release()
        cv2.destroyAllWindows()
        print("Đã thoát an toàn")

if __name__ == "__main__":
    main()