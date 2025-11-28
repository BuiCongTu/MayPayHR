echo "Face Attendance System with SVM"
echo "=================================="

cd "$(dirname "$0")"

# Kích hoạt virtual environment
source .venv/bin/activate

function show_menu() {
    echo ""
    echo "CHỌN CHỨC NĂNG:"
    echo "1.  Đăng ký mới"
    echo "2.  Train Models (Full)"
    echo "3.  Train Incremental"
    echo "4.  Điểm danh"
    echo "5.  Benchmark Model"
    echo "6.  Xem danh sách Điểm danh"
    echo "7.  Xem danh sách Đăng ký"
    echo "8.  Xoá DS Điểm danh"
    echo "9.  Xoá DS Đăng ký"
    echo "10. Reset hệ thống"
    echo "0.  Thoát"
    echo ""
}

function register_new() {
    python3 registerFace.py
}

function train_models() {
    echo "Đang huấn luyện mô hình..."
    python3 train.py
}

function train_incremental() {
    echo "Đang cập nhật mô hình..."
    python3 incremental_train.py
}

function benchmark_model() {
    echo "Kiểm tra hiệu suất..."
    python3 benchmark_model.py
}

function attendance() {
    python3 checkFace.py
}

function view_attendance() {
    python3 -c "
import sqlite3
from datetime import datetime

conn = sqlite3.connect('students.db')
try:
    cur = conn.cursor()
    
    # Lấy tất cả records điểm danh
    cur.execute('''
        SELECT student_id, student_name, session, timestamp, confidence 
        FROM attendance 
        ORDER BY timestamp DESC
    ''')
    rows = cur.fetchall()
    
    if rows:
        print('- DANH SÁCH ĐIỂM DANH')
        print('=' * 60)
        print(f'{'ID':<5} {'Tên':<20} {'Ca':<15} {'Thời gian':<20} {'Độ tin cậy':<12}')
        print('-' * 60)
        
        for row in rows:
            student_id, name, session, timestamp, confidence = row
            print(f'{student_id:<5} {name:<20} {session:<15} {timestamp:<20} {confidence:.2f}')
        
        print(f'\n - Tổng: {len(rows)} lượt điểm danh')
    else:
        print(' Chưa có dữ liệu điểm danh')
        
except Exception as e:
    print(f' Lỗi: {e}')
finally:
    conn.close()
"
}

function view_students() {
    echo " Xem danh sách đăng ký..."
    python3 -c "
import sqlite3

conn = sqlite3.connect('students.db')
try:
    cur = conn.cursor()
    
    # Lấy tất cả học viên
    cur.execute('SELECT id, name FROM Student ORDER BY id')
    rows = cur.fetchall()
    
    if rows:
        print(' DANH SÁCH ĐĂNG KÝ')
        print('=' * 40)
        print(f'{'ID':<10} {'Tên học viên':<30}')
        print('-' * 40)
        
        for row in rows:
            student_id, name = row
            print(f'{student_id:<10} {name:<30}')
        
        print(f'\n Tổng: {len(rows)} học viên')
    else:
        print(' Chưa có học viên nào đăng ký')
        
except Exception as e:
    print(f'Lỗi: {e}')
finally:
    conn.close()
"
}

function delete_attendance() {
    echo " Xoá dữ liệu điểm danh..."
    read -p "  Bạn có chắc muốn xoá tất cả dữ liệu điểm danh? (y/N): " confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        python3 -c "
import sqlite3

conn = sqlite3.connect('students.db')
try:
    cur = conn.cursor()
    cur.execute('DELETE FROM attendance')
    conn.commit()
    print(' Đã xoá tất cả dữ liệu điểm danh')
except Exception as e:
    print(f' Lỗi: {e}')
finally:
    conn.close()
"
    else
        echo " Đã hủy thao tác"
    fi
}

function delete_students() {
    echo "  Xoá dữ liệu đăng ký..."
    read -p "  Bạn có chắc muốn xoá tất cả học viên? (y/N): " confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        python3 -c "
import sqlite3
import os
import shutil

conn = sqlite3.connect('students.db')
try:
    cur = conn.cursor()
    # Tên bảng là 'Student' không phải 'students'
    cur.execute('DELETE FROM Student')
    cur.execute('DELETE FROM attendance')
    conn.commit()
    
    # Xoá thư mục student-face
    if os.path.exists('student-face'):
        shutil.rmtree('student-face')
        os.makedirs('student-face')
    
    # Xoá các file model và data
    files_to_delete = [
        'models/svm_model.pkl',
        'models/normalizer.pkl',
        'models/metadata.json',
        'data/embeddings.npy',
        'data/labels.npy'
    ]
    for file in files_to_delete:
        if os.path.exists(file):
            os.remove(file)
    
    print(' Đã xoá tất cả học viên, dữ liệu điểm danh và model')
except Exception as e:
    print(f' Lỗi: {e}')
finally:
    conn.close()
"
    else
        echo " Đã hủy thao tác"
    fi
}

function reset_system() {
    echo " Reset toàn bộ hệ thống..."
    read -p "  Bạn có chắc muốn reset toàn bộ? (y/N): " confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        python3 -c "
import sqlite3
import os
import shutil

# Xoá database
if os.path.exists('students.db'):
    os.remove('students.db')

# Xoá thư mục student-face
if os.path.exists('student-face'):
    shutil.rmtree('student-face')

# Xoá model files
for file in ['svm_model.pkl', 'label_encoder.pkl']:
    if os.path.exists(file):
        os.remove(file)

print(' Đã reset toàn bộ hệ thống')
"
    else
        echo " Đã hủy thao tác"
    fi
}

# Main loop
while true; do
    show_menu
    read -p " Nhập lựa chọn (0-10): " choice
    
    case $choice in
        1)
            register_new
            ;;
        2)
            train_models
            ;;
        3)
            train_incremental
            ;;
        4)
            attendance
            ;;
        5)
            benchmark_model
            ;;
        6)
            view_attendance
            ;;
        7)
            view_students
            ;;
        8)
            delete_attendance
            ;;
        9)
            delete_students
            ;;
        10)
            reset_system
            ;;
        0)
            echo " Thoát!"
            break
            ;;
        *)
            echo " Lựa chọn không hợp lệ. Vui lòng chọn 1-9."
            ;;
    esac
    
done