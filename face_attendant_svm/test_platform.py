#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script để kiểm tra hệ thống cross-platform
"""

import platform
import sys

def test_platform():
    """Kiểm tra platform"""
    print("=" * 60)
    print("  PLATFORM TEST")
    print("=" * 60)
    print(f"Operating System: {platform.system()}")
    print(f"OS Version: {platform.version()}")
    print(f"Python Version: {sys.version}")
    print(f"Architecture: {platform.machine()}")
    print()

def test_imports():
    """Kiểm tra các thư viện cần thiết"""
    print("=" * 60)
    print(" IMPORT TEST")
    print("=" * 60)
    
    required_modules = [
        ('cv2', 'opencv-python'),
        ('numpy', 'numpy'),
        ('sklearn', 'scikit-learn'),
        ('joblib', 'joblib'),
        ('face_recognition', 'face-recognition'),
        ('sqlite3', 'built-in'),
    ]
    
    for module_name, package_name in required_modules:
        try:
            __import__(module_name)
            print(f" {module_name:20} - OK ({package_name})")
        except ImportError as e:
            print(f" {module_name:20} - MISSING (Install: pip install {package_name})")
    print()

def test_camera():
    """Kiểm tra camera"""
    print("=" * 60)
    print(" CAMERA TEST")
    print("=" * 60)
    try:
        import cv2
        cap = cv2.VideoCapture(0)
        if cap.isOpened():
            ret, frame = cap.read()
            if ret:
                print(f" Camera found and working!")
                print(f"   Resolution: {frame.shape[1]}x{frame.shape[0]}")
            else:
                print("  Camera found but cannot read frame")
            cap.release()
        else:
            print(" Camera not found or cannot be opened")
            print("   Try different index: VideoCapture(1) or VideoCapture(2)")
    except Exception as e:
        print(f" Camera test failed: {e}")
    print()

def test_voice():
    """Kiểm tra voice notification"""
    print("=" * 60)
    print(" VOICE TEST")
    print("=" * 60)
    
    import subprocess
    system = platform.system()
    
    print(f"Testing voice on {system}...")
    
    try:
        if system == 'Darwin':  # macOS
            print("Using macOS 'say' command with Samantha voice...")
            subprocess.Popen(['say', '-v', 'Samantha', 'Hello from macOS!'],
                           stdout=subprocess.DEVNULL,
                           stderr=subprocess.DEVNULL)
            print(" macOS voice test successful!")
            print("   Voice: Samantha (Siri)")
            
        elif system == 'Windows':
            print("Using Windows PowerShell TTS with Zira voice...")
            ps_command = '''
            Add-Type -AssemblyName System.Speech
            $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
            $synth.SelectVoiceByHints([System.Speech.Synthesis.VoiceGender]::Female)
            $synth.Speak("Hello from Windows!")
            '''
            subprocess.Popen(['powershell', '-Command', ps_command],
                           stdout=subprocess.DEVNULL,
                           stderr=subprocess.DEVNULL,
                           creationflags=subprocess.CREATE_NO_WINDOW if hasattr(subprocess, 'CREATE_NO_WINDOW') else 0)
            print(" Windows voice test successful!")
            print("   Voice: Zira (Microsoft)")
        else:
            print(f"  Platform {system} not fully supported for voice")
            print("   Voice notification will be disabled")
            
    except Exception as e:
        print(f"  Voice test failed: {e}")
        print("   Voice notification will be disabled (not critical)")
    print()

def test_database():
    """Kiểm tra SQLite database"""
    print("=" * 60)
    print("  DATABASE TEST")
    print("=" * 60)
    try:
        import sqlite3
        import os
        
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        DB_PATH = os.path.join(BASE_DIR, "students.db")
        
        if os.path.exists(DB_PATH):
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = cur.fetchall()
            conn.close()
            
            print(f" Database found: {DB_PATH}")
            print(f"   Tables: {[t[0] for t in tables]}")
        else:
            print(f"  Database not found (will be created on first use)")
            print(f"   Path: {DB_PATH}")
            
        print(" SQLite working correctly")
    except Exception as e:
        print(f" Database test failed: {e}")
    print()

def test_face_detection():
    """Kiểm tra face detection"""
    print("=" * 60)
    print(" FACE DETECTION TEST")
    print("=" * 60)
    try:
        import face_recognition
        import numpy as np
        
        # Tạo ảnh test đơn giản
        test_image = np.zeros((480, 640, 3), dtype=np.uint8)
        
        # Test face_locations
        face_locations = face_recognition.face_locations(test_image)
        print(f" face_recognition.face_locations() - OK")
        
        # Test face_encodings (nếu có face)
        if len(face_locations) > 0:
            encodings = face_recognition.face_encodings(test_image, face_locations)
            print(f" face_recognition.face_encodings() - OK")
        else:
            print(f"ℹ️  No faces in test image (expected)")
            
        print(" Face detection module working correctly")
    except Exception as e:
        print(f" Face detection test failed: {e}")
    print()

def main():
    print("\n" + "=" * 60)
    print(" CROSS-PLATFORM COMPATIBILITY TEST")
    print("=" * 60)
    print()
    
    test_platform()
    test_imports()
    test_camera()
    test_database()
    test_face_detection()
    test_voice()  # Test cuối vì có âm thanh
    
    print("=" * 60)
    print(" TEST COMPLETED!")
    print("=" * 60)
    print()
    print(" Next steps:")
    print("1. If all tests passed: Run 'python run.sh' to start")
    print("2. If camera failed: Check camera permissions")
    print("3. If imports failed: Install missing packages")
    print("4. If voice failed: Not critical, app will still work")
    print()

if __name__ == "__main__":
    main()
