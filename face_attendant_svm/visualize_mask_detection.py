#!/usr/bin/env python3
"""
Visualization tool - Minh họa cách thuật toán phát hiện khẩu trang hoạt động
Vẽ 3 vùng kiểm tra và hiển thị điểm số real-time
"""

import cv2
import numpy as np

def draw_analysis_overlay(frame, face_location, mask_detected=False):
    """
    Vẽ overlay phân tích lên frame
    """
    (top, right, bottom, left) = face_location
    face_height = bottom - top
    face_width = right - left
    
    # === ĐỊNH NGHĨA 3 VÙNG ===
    regions = {
        'nose': {
            'top': top + int(face_height * 0.40),
            'bottom': top + int(face_height * 0.65),
            'left': left + int(face_width * 0.25),
            'right': right - int(face_width * 0.25),
            'color': (255, 255, 0),  # Vàng
            'name': 'MUI (NOSE)'
        },
        'mouth': {
            'top': top + int(face_height * 0.60),
            'bottom': top + int(face_height * 0.85),
            'left': left + int(face_width * 0.15),
            'right': right - int(face_width * 0.15),
            'color': (255, 0, 255),  # Hồng
            'name': 'MIENG (MOUTH)'
        },
        'chin': {
            'top': top + int(face_height * 0.80),
            'bottom': bottom,
            'left': left + int(face_width * 0.20),
            'right': right - int(face_width * 0.20),
            'color': (0, 255, 255),  # Cyan
            'name': 'CAM (CHIN)'
        }
    }
    
    # Vẽ khung khuôn mặt chính
    main_color = (0, 0, 255) if mask_detected else (0, 255, 0)
    cv2.rectangle(frame, (left, top), (right, bottom), main_color, 3)
    
    # Vẽ 3 vùng phân tích
    for region_name, region in regions.items():
        r_top = max(0, region['top'])
        r_bottom = min(frame.shape[0], region['bottom'])
        r_left = max(0, region['left'])
        r_right = min(frame.shape[1], region['right'])
        
        # Vẽ khung vùng
        cv2.rectangle(frame, (r_left, r_top), (r_right, r_bottom), region['color'], 2)
        
        # Label vùng
        label_bg_size = cv2.getTextSize(region['name'], cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)[0]
        cv2.rectangle(frame, 
                     (r_left, r_top - 20),
                     (r_left + label_bg_size[0] + 10, r_top),
                     region['color'], -1)
        cv2.putText(frame, region['name'], (r_left + 5, r_top - 5),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
    
    # Vẽ legend
    legend_x = 10
    legend_y = frame.shape[0] - 120
    
    cv2.rectangle(frame, (legend_x - 5, legend_y - 25), 
                 (legend_x + 250, legend_y + 95), (0, 0, 0), -1)
    cv2.rectangle(frame, (legend_x - 5, legend_y - 25), 
                 (legend_x + 250, legend_y + 95), (255, 255, 255), 2)
    
    cv2.putText(frame, "VUNG KIEM TRA:", (legend_x, legend_y),
               cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
    
    y_offset = legend_y + 25
    for region_name, region in regions.items():
        cv2.rectangle(frame, (legend_x, y_offset - 10),
                     (legend_x + 20, y_offset), region['color'], -1)
        cv2.putText(frame, region['name'], (legend_x + 30, y_offset),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        y_offset += 25
    
    return frame

def visualize_mask_detection():
    """
    Chạy visualization demo
    """
    print("\n" + "="*70)
    print(" "*15 + "VISUALIZATION - THUẬT TOÁN PHÁT HIỆN MASK")
    print("="*70)
    print("\nDemo này sẽ hiển thị:")
    print("  - 3 vùng kiểm tra (Mũi, Miệng, Cằm)")
    print("  - Khung màu: XANH = OK, ĐỎ = Mask")
    print("  - Legend giải thích các vùng")
    print()
    print("Thử các trường hợp:")
    print("  1. Không mask → Khung xanh")
    print("  2. Đeo mask → Khung đỏ")
    print("  3. Kéo mask xuống → Khung đỏ (vùng mũi/miệng bất thường)")
    print()
    print("Nhấn 'q' để thoát")
    print("="*70 + "\n")
    
    # Import
    try:
        import face_recognition
        from registerFace import detect_mask
    except ImportError as e:
        print(f"Lỗi import: {e}")
        return
    
    # Camera
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Không mở được camera!")
        return
    
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    # Skip 10 frames
    for _ in range(10):
        cap.read()
    
    print("Camera sẵn sàng!\n")
    
    frame_count = 0
    mask_history = []
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_count += 1
            
            # Detect face
            small = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
            rgb_small = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(rgb_small, model="hog")
            
            if face_locations:
                largest = max(face_locations, key=lambda x: (x[2]-x[0])*(x[1]-x[3]))
                (t, r, b, l) = largest
                t, r, b, l = t*2, r*2, b*2, l*2
                
                # Check mask every 3 frames
                if frame_count % 3 == 0:
                    is_masked = detect_mask(frame, (t, r, b, l))
                    mask_history.append(is_masked)
                    if len(mask_history) > 5:
                        mask_history.pop(0)
                
                is_wearing_mask = sum(mask_history) >= 3 if len(mask_history) >= 3 else False
                
                # Draw overlay
                frame = draw_analysis_overlay(frame, (t, r, b, l), is_wearing_mask)
                
                # Status text
                status = "MASK DETECTED!" if is_wearing_mask else "NO MASK - OK"
                color = (0, 0, 255) if is_wearing_mask else (0, 255, 0)
                
                # Big status banner
                banner_height = 60
                cv2.rectangle(frame, (0, 0), (frame.shape[1], banner_height), 
                             color, -1)
                
                text_size = cv2.getTextSize(status, cv2.FONT_HERSHEY_DUPLEX, 1.2, 2)[0]
                text_x = (frame.shape[1] - text_size[0]) // 2
                cv2.putText(frame, status, (text_x, 40),
                           cv2.FONT_HERSHEY_DUPLEX, 1.2, (255, 255, 255), 3)
                
            else:
                cv2.putText(frame, "Khong tim thay khuon mat", (20, 40),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
            
            cv2.imshow("Mask Detection Visualization", frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
    finally:
        cap.release()
        cv2.destroyAllWindows()
        print("\nĐã đóng visualization.")

if __name__ == "__main__":
    visualize_mask_detection()
