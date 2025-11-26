import os
import time
import sqlite3
import numpy as np
import cv2
import subprocess
import platform

try:
    import face_recognition
except Exception as e:
    raise ImportError(
        "Thiếu thư viện 'face_recognition' (phụ thuộc vào 'dlib' và 'Pillow').\n"
        "- Khuyến nghị dùng Python 3.10–3.12 cho khả năng tương thích tốt với các wheel có sẵn.\n"
        "- Trong virtualenv của dự án, hãy cài đặt:\n"
        "    pip install face_recognition\n"
        f"Lỗi gốc: {e}"
    )

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODELS_DIR = os.path.join(BASE_DIR, "models")
DB_PATH = os.path.join(BASE_DIR, "students.db")
TABLE_NAME = "Student"

def speak(text):
    """Cross-platform text-to-speech - Hỗ trợ cả macOS và Windows"""
    try:
        system = platform.system()
        if system == 'Darwin': # macOS
            subprocess.Popen(['say', '-v', 'Samantha', text],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL)
        elif system == 'Windows':  # Windows
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
    except Exception:
        pass

def ensure_dirs():
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(MODELS_DIR, exist_ok=True)

def ensure_schema():
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.execute(f"""
            CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
                id   TEXT PRIMARY KEY,
                name TEXT NOT NULL
            )
        """)
        conn.commit()
    finally:
        conn.close()

def insert_or_update(student_id: str, student_name: str):
    conn = sqlite3.connect(DB_PATH)
    try:
        ensure_schema()
        cur = conn.cursor()
        cur.execute(f"SELECT 1 FROM {TABLE_NAME} WHERE id = ?", (student_id,))
        if cur.fetchone():
            cur.execute(f"UPDATE {TABLE_NAME} SET name = ? WHERE id = ?", (student_name, student_id))
        else:
            cur.execute(f"INSERT INTO {TABLE_NAME} (id, name) VALUES (?, ?)", (student_id, student_name))
        conn.commit()
    finally:
        conn.close()

def load_existing_dataset():
    emb_path = os.path.join(DATA_DIR, "embeddings.npy")
    lbl_path = os.path.join(DATA_DIR, "labels.npy")
    if os.path.exists(emb_path) and os.path.exists(lbl_path):
        embeddings = np.load(emb_path)
        labels = np.load(lbl_path, allow_pickle=True)
        return embeddings, labels
    return None, None

def append_and_save_dataset(new_embeddings: np.ndarray, new_labels: np.ndarray):
    ensure_dirs()
    emb_path = os.path.join(DATA_DIR, "embeddings.npy")
    lbl_path = os.path.join(DATA_DIR, "labels.npy")
    old_embeddings, old_labels = load_existing_dataset()
    if old_embeddings is None:
        embeddings = new_embeddings
        labels = new_labels
    else:
        embeddings = np.vstack([old_embeddings, new_embeddings])
        labels = np.concatenate([old_labels, new_labels])
    np.save(emb_path, embeddings)
    np.save(lbl_path, labels)

def pick_largest_face(face_locations):
    if not face_locations:
        return None
    areas = []
    for (t, r, b, l) in face_locations:
        areas.append((b - t) * (r - l))
    idx = int(np.argmax(areas))
    return face_locations[idx]

def detect_mask(frame, face_location):
    """
    Phát hiện khẩu trang CHO ĐĂNG KÝ - Chặt chẽ hơn để đảm bảo chất lượng dữ liệu
    Kiểm tra đa điểm: vùng mũi + miệng + cằm
    Returns: True nếu phát hiện khẩu trang (hoặc nghi ngờ), False nếu chắc chắn không đeo
    """
    try:
        (top, right, bottom, left) = face_location
        face_height = bottom - top
        face_width = right - left
        
        # === VÙNG 1: VÙNG MŨI (40%-65% chiều cao) ===
        nose_top = top + int(face_height * 0.65)
        nose_bottom = top + int(face_height * 0.85)
        nose_left = left + int(face_width * 0.35)
        nose_right = right - int(face_width * 0.35)
        
        # === VÙNG 2: VÙNG MIỆNG (60%-85% chiều cao) ===
        mouth_top = top + int(face_height * 0.80)
        mouth_bottom = top + int(face_height * 0.85)
        mouth_left = left + int(face_width * 0.45)
        mouth_right = right - int(face_width * 0.45)
        
        # === VÙNG 3: VÙNG CẰM (80%-100% chiều cao) ===
        chin_top = top + int(face_height * 1.00)
        chin_bottom = bottom
        chin_left = left + int(face_width * 0.20)
        chin_right = right - int(face_width * 0.20)
        
        # Đảm bảo không vượt quá frame
        nose_top = max(0, nose_top)
        nose_bottom = min(frame.shape[0], nose_bottom)
        nose_left = max(0, nose_left)
        nose_right = min(frame.shape[1], nose_right)
        
        mouth_top = max(0, mouth_top)
        mouth_bottom = min(frame.shape[0], mouth_bottom)
        mouth_left = max(0, mouth_left)
        mouth_right = min(frame.shape[1], mouth_right)
        
        chin_top = max(0, chin_top)
        chin_bottom = min(frame.shape[0], chin_bottom)
        chin_left = max(0, chin_left)
        chin_right = min(frame.shape[1], chin_right)
        
        # Crop các vùng
        nose_region = frame[nose_top:nose_bottom, nose_left:nose_right]
        mouth_region = frame[mouth_top:mouth_bottom, mouth_left:mouth_right]
        chin_region = frame[chin_top:chin_bottom, chin_left:chin_right]
        
        # Debug: vẽ các vùng check
        cv2.rectangle(frame, (nose_left, nose_top), (nose_right, nose_bottom), (255, 255, 0), 1)  # Vàng - mũi
        cv2.rectangle(frame, (mouth_left, mouth_top), (mouth_right, mouth_bottom), (255, 0, 255), 1)  # Hồng - miệng
        cv2.rectangle(frame, (chin_left, chin_top), (chin_right, chin_bottom), (0, 255, 255), 1)  # Cyan - cằm
        
        mask_scores = []
        
        # === PHÂN TÍCH TỪNG VÙNG ===
        for idx, (region, name) in enumerate([
            (nose_region, "nose"),
            (mouth_region, "mouth"),
            (chin_region, "chin")
        ]):
            # Kiểm tra kích thước hợp lệ
            if region.shape[0] < 15 or region.shape[1] < 15:
                print(f"[DEBUG] {name} crop quá nhỏ")
                continue
            
            gray = cv2.cvtColor(region, cv2.COLOR_BGR2GRAY)
            brightness = np.mean(gray)
            
            # Bỏ qua nếu quá tối - GIẢM NGƯỠNG để nhận diện sớm hơn
            if brightness < 20:  # Giảm từ 40 → 25
                print(f"[DEBUG] {name} quá tối (brightness={brightness:.1f})")
                continue
            
            # 1. Phát hiện edges (chi tiết)
            edges = cv2.Canny(gray, 40, 120)
            edge_count = np.sum(edges > 0)
            total_pixels = edges.size
            edge_ratio = edge_count / total_pixels if total_pixels > 0 else 0
            
            # 2. Độ lệch chuẩn (texture complexity)
            std_dev = np.std(gray)
            
            # 3. Độ đồng đều màu sắc (khẩu trang thường đồng màu)
            hsv = cv2.cvtColor(region, cv2.COLOR_BGR2HSV)
            h, s, v = cv2.split(hsv)
            color_uniformity = 1.0 - (np.std(h) / 180.0 + np.std(s) / 255.0) / 2.0
            
            # === TÍNH ĐIỂM NGHI NGỜ KHẨU TRANG (0-1) ===
            # Điểm cao = nghi ngờ đeo khẩu trang
            mask_score = 0.0
            
            # Tiêu chí 1: Edge ratio thấp - CHẶT CHẼ HƠN cho đăng ký
            if edge_ratio < 0.10:  # Tăng từ 0.08 → 0.10
                mask_score += 0.5  # Tăng trọng số từ 0.4 → 0.5
            elif edge_ratio < 0.15:  # Tăng từ 0.12 → 0.15
                mask_score += 0.25  # Tăng từ 0.2 → 0.25
            
            # Tiêu chí 2: Độ lệch chuẩn thấp - CHẶT CHẼ HƠN
            if std_dev < 30:  # Tăng từ 25 → 30
                mask_score += 0.35  # Tăng từ 0.3 → 0.35
            elif std_dev < 40:  # Tăng từ 35 → 40
                mask_score += 0.2  # Tăng từ 0.15 → 0.2
            
            # Tiêu chí 3: Màu sắc đồng đều - GIỮ NGUYÊN (đã tốt)
            if color_uniformity > 0.75:
                mask_score += 0.3
            elif color_uniformity > 0.65:
                mask_score += 0.15
            
            mask_scores.append(mask_score)
            
            print(f"[DEBUG] {name}: edge={edge_ratio:.4f}, std={std_dev:.1f}, color_uni={color_uniformity:.2f}, score={mask_score:.2f}")
        
        # === QUYẾT ĐỊNH CUỐI CÙNG ===
        if not mask_scores:
            print("[DEBUG] Không đủ dữ liệu để phân tích, CHO PHÉP (an toàn)")
            return False
        
        avg_mask_score = np.mean(mask_scores)
        max_mask_score = np.max(mask_scores)
        
        # CHẶT CHẼ HƠN: Giảm ngưỡng để phát hiện nhạy hơn (bắt cả trường hợp 1/2 khẩu trang)
        # Điều kiện 1: Trung bình >= 0.40 (giảm từ 0.45)
        # Điều kiện 2: Bất kỳ vùng nào >= 0.55 (giảm từ 0.65) 
        # Điều kiện 3: CẢ 3 vùng đều >= 0.35 (thêm rule mới - bắt trường hợp kéo mask 1/2)
        all_regions_suspicious = len(mask_scores) >= 3 and all(score >= 0.35 for score in mask_scores)
        
        is_masked = avg_mask_score > 0.3 or max_mask_score > 0.85 or all_regions_suspicious
        
        print(f"[DEBUG] AVG_SCORE={avg_mask_score:.2f}, MAX_SCORE={max_mask_score:.2f}, ALL_SUS={all_regions_suspicious} => {'MASK!' if is_masked else 'NO MASK'}")
        
        return is_masked
        
    except Exception as e:
        print(f"Loi phat hien khau trang: {e}")
        return True  # NẾU LỖI => CHO LÀ CÓ MASK (an toàn cho đăng ký)

def capture_and_register(student_id: str, student_name: str, num_samples: int = 20, camera_index: int = 0):
    ensure_dirs()
    ensure_schema()
    insert_or_update(student_id, student_name)

    # Khởi tạo camera tối ưu
    cap = cv2.VideoCapture(camera_index, cv2.CAP_ANY)
    if not cap.isOpened():
        raise RuntimeError("Không mở được camera. Vui lòng kiểm tra thiết bị.")
    
    # Thiết lập camera - Tăng FPS và độ phân giải để phát hiện mask chính xác hơn
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 30)  # Tăng FPS
    
    # Chờ camera ổn định - GIẢM thời gian chờ để phát hiện nhanh hơn
    print("Dang khoi dong camera...")
    time.sleep(1)  # Giảm từ 2s → 1.5s
    
    # Đọc và bỏ qua ÍT frame hơn để phát hiện mask sớm hơn
    for i in range(1):  # Giảm từ 10 → 5 frames
        cap.read()
    
    print("Camera san sang! Bat dau qua trinh dang ky...\n")
    print("CHU Y: He thong se phat hien khau trang NGAY LAP TUC!\n")

    print("Hướng camera về khuôn mặt bạn. Nhấn 'q' để thoát sớm.")
    
    collected = 0
    collected_embeddings = []
    frame_count = 0
    
    last_info = ""
    last_mask_state = None  # Track trạng thái khẩu trang lần trước để phát hiện transition
    mask_history = []  # Lưu lịch sử mask 5 frame gần nhất
    last_mask_check_result = False  # Cache kết quả check mask
    
    try:
        while True:
            frame_count += 1
            ret, frame = cap.read()
            if not ret:
                print("Không đọc được khung hình từ camera.")
                break

            small = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)  # tăng tốc
            rgb_small = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(rgb_small, model="hog")

            # Debug: Hiển thị số lượng faces phát hiện
            debug_text = f"Faces found: {len(face_locations)}"
            cv2.putText(frame, debug_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)

            is_wearing_mask = False
            if face_locations:
                # chuyển tọa độ về kích thước gốc
                largest = pick_largest_face(face_locations)
                if largest:
                    (t, r, b, l) = largest
                    t, r, b, l = t * 2, r * 2, b * 2, l * 2
                    
                    # Kiểm tra mask MỖI 2 frames để phát hiện NHANH HƠN (thay vì 3 frames)
                    if frame_count % 1 == 0:
                        is_masked_now = detect_mask(frame, (t, r, b, l))
                        last_mask_check_result = is_masked_now
                        
                        # Lưu lịch sử 5 frame gần nhất để tránh false positive
                        mask_history.append(is_masked_now)
                        if len(mask_history) > 5:
                            mask_history.pop(0)
                    else:
                        # Sử dụng kết quả check lần trước
                        is_masked_now = last_mask_check_result
                    
                    # CHẶT CHẼ HƠN: Chỉ cần >=2/5 frame (thay vì 3/5) là đã báo mask
                    # Hoặc frame hiện tại phát hiện mask thì cũng báo ngay
                    is_wearing_mask = (sum(mask_history) >= 2 if len(mask_history) >= 3 else is_masked_now) or is_masked_now

                    # Hiển thị trạng thái mask với màu sắc rõ ràng
                    mask_confidence = sum(mask_history) / len(mask_history) if mask_history else 0
                    mask_status = f"MASK: {mask_confidence*100:.0f}%" if is_wearing_mask else f"OK: {(1-mask_confidence)*100:.0f}%"
                    status_color = (0, 0, 255) if is_wearing_mask else (0, 255, 0)
                    cv2.putText(frame, mask_status, (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.8, status_color, 2)

                    # Phát hiện transition (chuyển từ không mask sang có mask)
                    mask_transition = is_wearing_mask and (last_mask_state is False or last_mask_state is None)
                    last_mask_state = is_wearing_mask

                    if is_wearing_mask:
                        # Phát hiện khẩu trang - Hiển thị cảnh báo CHẶT CHẼ
                        cv2.rectangle(frame, (l, t), (r, b), (0, 0, 255), 4)  # Khung đỏ dày
                        
                        # Thông báo chính - to và nổi bật
                        warning_text = "PHAI THAO KHAU TRANG!"
                        font = cv2.FONT_HERSHEY_DUPLEX
                        font_scale = 1.3
                        thickness = 3
                        (text_width, text_height), _ = cv2.getTextSize(warning_text, font, font_scale, thickness)
                        text_x = (frame.shape[1] - text_width) // 2
                        text_y = frame.shape[0] // 2
                        
                        # Nền đỏ cho text
                        cv2.rectangle(frame, 
                                    (text_x - 25, text_y - text_height - 25), 
                                    (text_x + text_width + 25, text_y + 25), 
                                    (0, 0, 220), -1)
                        
                        # Shadow text (đen)
                        cv2.putText(frame, warning_text, (text_x + 2, text_y + 2), 
                                font, font_scale, (0, 0, 0), thickness + 2)
                        # Main text (trắng)
                        cv2.putText(frame, warning_text, (text_x, text_y), 
                                font, font_scale, (255, 255, 255), thickness)
                        
                        # Thông báo phụ 1
                        sub_text1 = "KHONG DUOC KEO 1/2!"
                        cv2.putText(frame, sub_text1, (text_x - 20, text_y + 45), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
                        
                        # Thông báo phụ 2
                        sub_text2 = "Please remove mask COMPLETELY"
                        cv2.putText(frame, sub_text2, (l, b + 35), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
                        
                        # Console warning và voice chỉ khi transition
                        if mask_transition:
                            print("\n" + "="*60)
                            print(" CANH BAO: PHAT HIEN KHAU TRANG HOAC KEO KHAU TRANG 1/2!")
                            print(" - KHONG DUOC deo khau trang khi dang ky")
                            print(" - KHONG DUOC keo khau trang xuong duoi cam")
                            print(" - PHAI THAO KHAU TRANG HOAN TOAN de lay mau chinh xac")
                            print("="*60 + "\n")
                            try:
                                speak("Please remove your mask completely")
                            except:
                                pass
                    else:
                        # Không đeo khẩu trang - KIỂM TRA KÉP trước khi cho phép đăng ký
                        # Điều kiện 1: is_wearing_mask phải False
                        # Điều kiện 2: is_masked_now (frame hiện tại) cũng phải False
                        # Điều kiện 3: Không có quá nhiều mask trong history
                        safe_to_capture = (not is_wearing_mask) and (not is_masked_now) and (sum(mask_history) <= 1 if mask_history else True)
                        
                        if safe_to_capture:
                            # AN TOÀN - CHO PHÉP lấy mẫu
                            face_encs = face_recognition.face_encodings(
                                cv2.cvtColor(frame, cv2.COLOR_BGR2RGB),
                                [(t, r, b, l)],
                                num_jitters=5,  # Độ chính xác cao
                                model="large"   # Model tốt nhất
                            )
                            if face_encs:
                                enc = face_encs[0]
                                collected_embeddings.append(enc)
                                collected += 1
                                last_info = f"Da lay mau: {collected}/{num_samples}"
                                
                                # Thông báo console khi lấy được mẫu
                                if collected == 1:
                                    print(f"\n>>> Bat dau lay mau khuon mat (khong khau trang) - Target: {num_samples} mau")
                                if collected % 5 == 0:
                                    print(f">>> Tien trinh: {collected}/{num_samples} mau")
                        else:
                            # KHÔNG AN TOÀN - từ chối lấy mẫu (nhưng vẫn hiển thị như bình thường)
                            print(f"[SAFETY] Khong lay mau - Phat hien mask trong history (sum={sum(mask_history) if mask_history else 0})")
                        
                        # Khung xanh lá - AN TOÀN để lấy mẫu
                        cv2.rectangle(frame, (l, t), (r, b), (0, 255, 0), 3)
                        
                        # Hiển thị tiến trình
                        progress_text = f"{collected}/{num_samples} samples"
                        cv2.putText(frame, progress_text, (l, max(25, t - 15)), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
                        
                        # Thanh tiến trình
                        progress_ratio = collected / num_samples
                        bar_width = r - l
                        bar_filled = int(bar_width * progress_ratio)
                        cv2.rectangle(frame, (l, t - 10), (l + bar_filled, t - 5), (0, 255, 0), -1)
                        cv2.rectangle(frame, (l, t - 10), (r, t - 5), (255, 255, 255), 1)
            else:
                # Không phát hiện face_locations -> hiển thị thông báo chung
                cv2.putText(
                    frame,
                    "Khong tim thay khuon mat. Tien gan hon hoac tang sang.",
                    (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 200, 255),
                    2
                )

            cv2.imshow("Register Face", frame)
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            if collected >= num_samples:
                break
    finally:
        cap.release()
        try:
            cv2.destroyAllWindows()
        except Exception:
            pass

    if collected_embeddings:
        X = np.vstack(collected_embeddings)
        y = np.array([student_id] * X.shape[0], dtype=object)
        append_and_save_dataset(X, y)
        print(f"Đã lưu {X.shape[0]} embeddings cho ID={student_id}, NAME={student_name}")
        
        # Phát âm thanh thông báo đăng ký thành công (cross-platform)
        try:
            print('\a')  # Terminal beep
            speak('Registration successful!')
        except Exception:
            pass
    else:
        print("Chưa thu được mẫu nào, không có gì để lưu.")

def main():
    print("\n" + "="*70)
    print(" "*20 + "DANG KY KHUON MAT")
    print("="*70)
    print("\n QUAN TRONG - Quy dinh dang ky:")
    print("  1. PHAI THAO KHAU TRANG HOAN TOAN")
    print("     - KHONG duoc deo khau trang che mieng/mui")
    print("     - KHONG duoc keo khau trang xuong duoi cam")
    print("     - He thong se TU CHO PHAT HIEN va CHAN dang ky neu vi pham")
    print()
    print("  2. Khoang cach va tu the:")
    print("     - Nhin THANG vao camera")
    print("     - Giu khoang cach 30-50cm")
    print("     - Khung hinh XANH LA = OK, KHUNG DO = Loi")
    print()
    print("  3. Dieu kien anh sang:")
    print("     - Dam bao anh sang DU (khong qua toi)")
    print("     - Tranh anh sang chieu thang vao mat")
    print()
    print("  4. Trong qua trinh:")
    print("     - Giu yen dau trong 1-2 giay moi lan lay mau")
    print("     - He thong can {0} mau de hoan tat".format(20))
    print("     - Nhan 'q' de thoat bat ky luc nao")
    print("="*70 + "\n")
    
    student_id = input("Nhập mã sinh viên: ").strip()
    student_name = input("Nhập tên sinh viên: ").strip()
    if not student_id or not student_name:
        print("Mã sinh viên và tên không được để trống.")
        return
    # Số mẫu mỗi người (có thể chỉnh)
    capture_and_register(student_id, student_name, num_samples=20, camera_index=0)
    print(" Hoàn tất. Bạn có thể chạy train.py để huấn luyện.")

if __name__ == "__main__":
    main()