import os
import numpy as np
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
import joblib
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODELS_DIR = os.path.join(BASE_DIR, "models")

LARGE_DATASET_THRESHOLD = 1000
KNN_NEIGHBORS = 5

def load_data():
    emb_path = os.path.join(DATA_DIR, "embeddings.npy")
    lbl_path = os.path.join(DATA_DIR, "labels.npy")
    if not (os.path.exists(emb_path) and os.path.exists(lbl_path)):
        raise FileNotFoundError("Chưa có dữ liệu. Hãy chạy registerFace.py để thu thập trước.")
    X = np.load(emb_path)
    y = np.load(lbl_path, allow_pickle=True)
    if X.ndim != 2:
        raise ValueError("Embeddings phải là mảng 2 chiều [N, D].")
    if X.shape[0] != y.shape[0]:
        raise ValueError("Số lượng embeddings và labels không khớp.")
    return X, y

def normalize_data(X):
    scaler = StandardScaler()
    Xn = scaler.fit_transform(X)
    return Xn, scaler

def train_svm(X_train, y_train, use_rbf=False):
    if use_rbf:
        svm_model = SVC(kernel='rbf', gamma='scale', probability=True, cache_size=500)
    else:
        svm_model = SVC(kernel='linear', probability=True, cache_size=500)
    svm_model.fit(X_train, y_train)
    return svm_model

def train_knn(X_train, y_train, n_neighbors=5):
    knn_model = KNeighborsClassifier(
        n_neighbors=n_neighbors,
        algorithm='ball_tree',
        metric='euclidean',
        n_jobs=-1
    )
    knn_model.fit(X_train, y_train)
    return knn_model

def select_best_model(X, y, X_train, X_test, y_train, y_test):
    num_samples = X.shape[0]
    
    if num_samples >= LARGE_DATASET_THRESHOLD:
        print(f"Dữ liệu lớn ({num_samples} mẫu) - Sử dụng KNN")
        start = time.time()
        model = train_knn(X_train, y_train, n_neighbors=min(KNN_NEIGHBORS, len(np.unique(y_train))))
        train_time = time.time() - start
        model_type = 'knn'
    elif num_samples >= 300:
        print(f"Dữ liệu trung bình ({num_samples} mẫu) - Sử dụng SVM-RBF")
        start = time.time()
        model = train_svm(X_train, y_train, use_rbf=True)
        train_time = time.time() - start
        model_type = 'svm_rbf'
    else:
        print(f"Dữ liệu nhỏ ({num_samples} mẫu) - Sử dụng SVM-Linear")
        start = time.time()
        model = train_svm(X_train, y_train, use_rbf=False)
        train_time = time.time() - start
        model_type = 'svm_linear'
    
    print(f"Thời gian training: {train_time:.2f}s")
    return model, model_type

def evaluate_model(model, X_test, y_test):
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {acc:.4f}")
    try:
        print(classification_report(y_test, y_pred))
    except Exception:
        pass

def main():
    os.makedirs(MODELS_DIR, exist_ok=True)
    print("Đang tải dữ liệu...")
    X, y = load_data()
    print(f"Tổng mẫu: {X.shape[0]}, Kích thước embedding: {X.shape[1]}")
    
    # Kiểm tra số lượng class
    unique_labels = np.unique(y)
    num_classes = len(unique_labels)
    print(f"Số lượng sinh viên: {num_classes}")
    print(f"Danh sách ID: {list(unique_labels)}")
    
    if num_classes < 2:
        print("\n  CẢNH BÁO: Chỉ có 1 sinh viên được đăng ký!")
        print(" SVM cần ít nhất 2 class để huấn luyện.")
        print("\n GỢI Ý GIẢI PHÁP:")
        print("1. Đăng ký thêm ít nhất 1 sinh viên nữa")
        print("2. Hoặc sử dụng mô hình Simple Matching thay thế")
        
        choice = input("\n Bạn có muốn sử dụng Simple Matching không? (y/N): ").strip().lower()
        
        if choice in ['y', 'yes']:
            # Lưu mô hình simple matching
            simple_model = {
                'type': 'simple_matching',
                'reference_embedding': X[0],  # Lấy embedding đầu tiên làm reference
                'student_id': y[0],
                'threshold': 0.6  # Ngưỡng similarity
            }
            
            model_path = os.path.join(MODELS_DIR, "simple_model.pkl")
            joblib.dump(simple_model, model_path)
            
            print(" Đã lưu Simple Matching model")
            print("💡 Model này sẽ so sánh với embedding reference")
            print(f"📁 Lưu tại: {model_path}")
            return
        else:
            print(" Không thể huấn luyện mô hình. Vui lòng đăng ký thêm sinh viên!")
            return

    print("Chuẩn hóa dữ liệu...")
    Xn, scaler = normalize_data(X)

    X_train, X_test, y_train, y_test = train_test_split(Xn, y, test_size=0.2, random_state=42, stratify=y)

    print("Huấn luyện model tối ưu...")
    model, model_type = select_best_model(X, y, X_train, X_test, y_train, y_test)

    print("Đánh giá...")
    evaluate_model(model, X_test, y_test)

    model_path = os.path.join(MODELS_DIR, "svm_model.pkl")
    scaler_path = os.path.join(MODELS_DIR, "normalizer.pkl")
    metadata_path = os.path.join(MODELS_DIR, "model_metadata.pkl")
    
    metadata = {
        'model_type': model_type,
        'num_samples': X.shape[0],
        'num_classes': num_classes,
        'feature_dim': X.shape[1],
        'trained_at': time.strftime('%Y-%m-%d %H:%M:%S')
    }
    
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    joblib.dump(metadata, metadata_path)
    
    print(f"Đã lưu model ({model_type}): {model_path}")
    print(f"Đã lưu scaler: {scaler_path}")
    print(f"Đã lưu metadata: {metadata_path}")
    print("Hoàn tất.")

if __name__ == "__main__":
    main()