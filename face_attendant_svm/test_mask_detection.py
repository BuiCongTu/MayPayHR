#!/usr/bin/env python3
"""
Script kiểm tra thuật toán phát hiện khẩu trang
Chạy để test các trường hợp:
1. Không đeo khẩu trang
2. Đeo khẩu trang đầy đủ
3. Kéo khẩu trang xuống dưới cằm
4. Kéo khẩu trang che 1/2 mặt
"""

import cv2
import numpy as np
import time

def test_mask_detection():
    """Test live mask detection"""
    print("\n" + "="*70)
    print(" "*20 + "TEST PHÁT HIỆN KHẨU TRANG")
    print("="*70)
    print("\nHướng dẫn test:")
    print("  1. Đầu tiên: KHÔNG đeo khẩu trang")
    print("     → Kỳ vọng: Khung XANH, text 'OK'")
    print()
    print("  2. Sau đó: ĐEO khẩu trang đầy đủ (che mũi + miệng)")
    print("     → Kỳ vọng: Khung ĐỎ, text 'MASK DETECTED'")
    print()
    print("  3. Tiếp theo: KÉO khẩu trang xuống dưới cằm")
    print("     → Kỳ vọng: Khung ĐỎ (phát hiện bất thường)")
    print()
    print("  4. Cuối cùng: KÉO khẩu trang che 1/2 (chỉ che miệng)")
    print("     → Kỳ vọng: Khung ĐỎ (max_score rule)")
    print()
    print("Nhấn 'q' để thoát, 's' để chụp ảnh test")
    print("="*70 + "\n")
    
    # Import từ registerFace
    import sys
    import os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    
    try:
        import face_recognition
        from registerFace import detect_mask
    except ImportError as e:
        print(f"Lỗi import: {e}")
        print("Đảm bảo đã cài đặt face_recognition và opencv-python")
        return
    
    # Khởi động camera
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Không mở được camera!")
        return
    
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 30)
    
    # Bỏ qua 10 frame đầu
    for _ in range(10):
        cap.read()
    
    print("Camera sẵn sàng! Bắt đầu test...\n")
    
    frame_count = 0
    mask_history = []
    test_results = {
        'no_mask_frames': 0,
        'mask_frames': 0,
        'total_frames': 0
    }
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Không đọc được frame")
                break
            
            frame_count += 1
            test_results['total_frames'] += 1
            
            # Phát hiện khuôn mặt
            small = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
            rgb_small = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(rgb_small, model="hog")
            
            if face_locations:
                # Lấy face lớn nhất
                largest = max(face_locations, key=lambda x: (x[2]-x[0])*(x[1]-x[3]))
                (t, r, b, l) = largest
                # Scale về kích thước gốc
                t, r, b, l = t*2, r*2, b*2, l*2
                
                # Kiểm tra mask (chỉ mỗi 3 frames)
                if frame_count % 3 == 0:
                    is_masked = detect_mask(frame, (t, r, b, l))
                    mask_history.append(is_masked)
                    if len(mask_history) > 5:
                        mask_history.pop(0)
                    
                    # Statistics
                    if is_masked:
                        test_results['mask_frames'] += 1
                    else:
                        test_results['no_mask_frames'] += 1
                
                # Quyết định dựa trên history
                is_wearing_mask = sum(mask_history) >= 3 if len(mask_history) >= 3 else False
                
                # Vẽ khung và text
                color = (0, 0, 255) if is_wearing_mask else (0, 255, 0)
                status = "MASK DETECTED!" if is_wearing_mask else "OK - NO MASK"
                
                cv2.rectangle(frame, (l, t), (r, b), color, 3)
                cv2.putText(frame, status, (l, t-15), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
                
                # Hiển thị confidence
                mask_confidence = sum(mask_history) / len(mask_history) if mask_history else 0
                conf_text = f"Confidence: {mask_confidence*100:.0f}%"
                cv2.putText(frame, conf_text, (l, b+30),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
                
            else:
                cv2.putText(frame, "No face detected", (20, 40),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
            
            # Hiển thị statistics
            stats_y = 30
            cv2.putText(frame, f"Total: {test_results['total_frames']}", 
                       (10, stats_y), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            cv2.putText(frame, f"No Mask: {test_results['no_mask_frames']}", 
                       (10, stats_y+25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
            cv2.putText(frame, f"Mask: {test_results['mask_frames']}", 
                       (10, stats_y+50), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
            
            # Hiển thị
            cv2.imshow("Mask Detection Test", frame)
            
            # Keyboard
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('s'):
                # Lưu ảnh test
                filename = f"test_mask_{int(time.time())}.jpg"
                cv2.imwrite(filename, frame)
                print(f"Đã lưu: {filename}")
                
    finally:
        cap.release()
        cv2.destroyAllWindows()
        
        # In kết quả
        print("\n" + "="*70)
        print("KẾT QUẢ TEST:")
        print("="*70)
        print(f"Tổng frames đã xử lý: {test_results['total_frames']}")
        print(f"Frames KHÔNG mask: {test_results['no_mask_frames']}")
        print(f"Frames CÓ mask: {test_results['mask_frames']}")
        
        if test_results['total_frames'] > 0:
            no_mask_ratio = test_results['no_mask_frames'] / test_results['total_frames'] * 100
            mask_ratio = test_results['mask_frames'] / test_results['total_frames'] * 100
            print(f"\nTỷ lệ NO MASK: {no_mask_ratio:.1f}%")
            print(f"Tỷ lệ MASK: {mask_ratio:.1f}%")
        
        print("="*70)

if __name__ == "__main__":
    test_mask_detection()
