#!/usr/bin/env python3
"""
Quick Test Script cho v2.1
Test 2 vấn đề đã sửa:
1. Phát hiện mask ngay từ đầu (< 2s)
2. Không lấy mẫu khi kéo mask 1/2
"""

import cv2
import time
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_v21():
    print("\n" + "="*70)
    print(" "*15 + "TEST PATCH v2.1 - MASK DETECTION")
    print("="*70)
    print("\nTest cases:")
    print("  [1] Khởi động với mask → Phải báo trong 2 giây")
    print("  [2] Kéo mask 1/2 → Không được lấy mẫu")
    print("\nBắt đầu test...\n")
    
    try:
        import face_recognition
        from registerFace import detect_mask
    except ImportError as e:
        print(f"Lỗi import: {e}")
        return
    
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Không mở được camera!")
        return
    
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 30)
    
    # Warm-up (giống như registerFace.py v2.1)
    print("Warm-up camera (1.5s + 5 frames)...")
    start_warmup = time.time()
    time.sleep(1.5)
    for _ in range(5):
        cap.read()
    warmup_time = time.time() - start_warmup
    print(f"✓ Warm-up hoàn tất trong {warmup_time:.2f}s\n")
    
    print("TEST 1: Kiểm tra tốc độ phát hiện mask")
    print("----------------------------------------")
    print("Hướng dẫn: Đeo mask NGAY BÂY GIỜ!")
    print("Nhấn SPACE khi đã đeo mask, hoặc 'q' để bỏ qua test này\n")
    
    test1_start = None
    test1_detected = False
    frame_count = 0
    mask_history = []
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        
        # Detect face
        if frame_count % 2 == 0:  # Mỗi 2 frames (giống v2.1)
            small = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
            rgb_small = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(rgb_small, model="hog")
            
            if face_locations:
                largest = max(face_locations, key=lambda x: (x[2]-x[0])*(x[1]-x[3]))
                (t, r, b, l) = largest
                t, r, b, l = t*2, r*2, b*2, l*2
                
                is_masked = detect_mask(frame, (t, r, b, l))
                mask_history.append(is_masked)
                if len(mask_history) > 5:
                    mask_history.pop(0)
                
                # Consensus (giống v2.1)
                is_wearing_mask = (sum(mask_history) >= 2) or is_masked
                
                # Vẽ
                color = (0, 0, 255) if is_wearing_mask else (0, 255, 0)
                cv2.rectangle(frame, (l, t), (r, b), color, 3)
                
                status = "MASK DETECTED!" if is_wearing_mask else "NO MASK"
                cv2.putText(frame, status, (l, t-15),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
                
                # Test 1 logic
                if is_wearing_mask and not test1_detected and test1_start is not None:
                    detection_time = time.time() - test1_start
                    print(f"\n✓ TEST 1 PASSED: Phát hiện mask trong {detection_time:.2f}s")
                    if detection_time <= 2.0:
                        print("  → EXCELLENT! Nhanh hơn 2 giây ✅")
                    else:
                        print(f"  → WARNING! Chậm hơn 2 giây ⚠️")
                    test1_detected = True
        
        # Instructions
        cv2.putText(frame, "Nhan SPACE khi da deo mask", (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)
        cv2.putText(frame, "Nhan Q de bo qua", (10, 60),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)
        
        if test1_start and not test1_detected:
            elapsed = time.time() - test1_start
            cv2.putText(frame, f"Waiting for mask... {elapsed:.1f}s", (10, 90),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        
        cv2.imshow("Test v2.1 - Case 1", frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord(' ') and test1_start is None:
            test1_start = time.time()
            print(f"→ Bắt đầu đếm thời gian từ {time.strftime('%H:%M:%S')}")
            print("  Đang chờ phát hiện mask...")
        elif key == ord('q'):
            if not test1_detected:
                print("\n⊘ TEST 1 SKIPPED: Người dùng bỏ qua")
            break
        
        if test1_detected:
            time.sleep(2)  # Hiển thị kết quả 2 giây
            break
    
    cv2.destroyAllWindows()
    
    # Test 2: Kéo mask 1/2
    print("\n" + "="*70)
    print("TEST 2: Kiểm tra không lấy mẫu khi kéo mask 1/2")
    print("="*70)
    print("Hướng dẫn:")
    print("  1. Không đeo mask → Nhan SPACE để 'lấy mẫu'")
    print("  2. Kéo mask che 1/2 môi → Nhan SPACE để thử 'lấy mẫu'")
    print("  3. Kiểm tra xem có lấy được không\n")
    print("Nhấn 's' để bắt đầu, 'q' để bỏ qua\n")
    
    key = cv2.waitKey(0) & 0xFF
    if key == ord('q'):
        print("⊘ TEST 2 SKIPPED")
        cap.release()
        return
    
    samples_collected = 0
    samples_attempts = 0
    frame_count = 0
    mask_history = []
    
    print("Bắt đầu TEST 2...\n")
    
    while samples_attempts < 3:
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        
        if frame_count % 2 == 0:
            small = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
            rgb_small = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(rgb_small, model="hog")
            
            if face_locations:
                largest = max(face_locations, key=lambda x: (x[2]-x[0])*(x[1]-x[3]))
                (t, r, b, l) = largest
                t, r, b, l = t*2, r*2, b*2, l*2
                
                is_masked = detect_mask(frame, (t, r, b, l))
                mask_history.append(is_masked)
                if len(mask_history) > 5:
                    mask_history.pop(0)
                
                is_wearing_mask = (sum(mask_history) >= 2) or is_masked
                
                # Safety check (giống v2.1)
                safe_to_capture = (not is_wearing_mask) and (not is_masked) and (sum(mask_history) <= 1)
                
                color = (0, 0, 255) if is_wearing_mask else (0, 255, 0)
                cv2.rectangle(frame, (l, t), (r, b), color, 3)
                
                status = "MASK!" if is_wearing_mask else "NO MASK"
                cv2.putText(frame, status, (l, t-15),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
                
                safety_status = "SAFE" if safe_to_capture else "BLOCKED"
                safety_color = (0, 255, 0) if safe_to_capture else (0, 0, 255)
                cv2.putText(frame, f"Capture: {safety_status}", (l, b+30),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, safety_color, 2)
        
        # Stats
        cv2.putText(frame, f"Attempts: {samples_attempts}/3", (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
        cv2.putText(frame, f"Collected: {samples_collected}", (10, 60),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(frame, "Nhan SPACE de thu lay mau", (10, 90),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        cv2.imshow("Test v2.1 - Case 2", frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord(' '):
            samples_attempts += 1
            if safe_to_capture:
                samples_collected += 1
                print(f"✓ Attempt {samples_attempts}: COLLECTED (safe_to_capture=True)")
            else:
                print(f"✗ Attempt {samples_attempts}: BLOCKED (safe_to_capture=False)")
                print(f"   → is_wearing_mask={is_wearing_mask}, is_masked={is_masked}, mask_history_sum={sum(mask_history)}")
        elif key == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    
    # Results
    print("\n" + "="*70)
    print("KẾT QUẢ TEST 2:")
    print("="*70)
    print(f"Tổng attempts: {samples_attempts}")
    print(f"Samples collected: {samples_collected}")
    print(f"Samples blocked: {samples_attempts - samples_collected}")
    
    if samples_attempts > 0:
        block_rate = (samples_attempts - samples_collected) / samples_attempts * 100
        print(f"\nTỷ lệ chặn: {block_rate:.1f}%")
        
        if block_rate >= 80:
            print("✓ TEST 2 PASSED: Chặn tốt (≥80%) ✅")
        elif block_rate >= 60:
            print("⚠ TEST 2 PARTIAL: Chặn khá tốt (60-80%) ⚠️")
        else:
            print("✗ TEST 2 FAILED: Chặn kém (<60%) ❌")
    
    print("="*70 + "\n")

if __name__ == "__main__":
    test_v21()
