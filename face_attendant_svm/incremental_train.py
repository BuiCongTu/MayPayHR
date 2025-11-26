import os
import numpy as np
import joblib
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODELS_DIR = os.path.join(BASE_DIR, "models")

def incremental_train():
    print("INCREMENTAL TRAINING")
    print("=" * 50)
    
    emb_path = os.path.join(DATA_DIR, "embeddings.npy")
    lbl_path = os.path.join(DATA_DIR, "labels.npy")
    model_path = os.path.join(MODELS_DIR, "svm_model.pkl")
    scaler_path = os.path.join(MODELS_DIR, "normalizer.pkl")
    metadata_path = os.path.join(MODELS_DIR, "model_metadata.pkl")
    
    if not (os.path.exists(emb_path) and os.path.exists(lbl_path)):
        print("Chưa có dữ liệu!")
        return
    
    X = np.load(emb_path)
    y = np.load(lbl_path, allow_pickle=True)
    
    num_samples = X.shape[0]
    num_classes = len(np.unique(y))
    
    print(f"Dữ liệu: {num_samples} mẫu, {num_classes} sinh viên")
    
    if os.path.exists(metadata_path):
        metadata = joblib.load(metadata_path)
        old_samples = metadata.get('num_samples', 0)
        old_classes = metadata.get('num_classes', 0)
        
        new_samples = num_samples - old_samples
        new_classes = num_classes - old_classes
        
        print(f"📈 Thay đổi: +{new_samples} mẫu, +{new_classes} sinh viên")
        
        if new_samples == 0 and new_classes == 0:
            print("Không có dữ liệu mới, không cần train lại")
            return
    
    print("\n🔧 Sử dụng KNN cho incremental learning...")
    
    scaler = StandardScaler()
    X_norm = scaler.fit_transform(X)
    
    n_neighbors = min(5, num_classes)
    model = KNeighborsClassifier(
        n_neighbors=n_neighbors,
        algorithm='ball_tree',
        metric='euclidean',
        n_jobs=-1
    )
    model.fit(X_norm, y)
    
    metadata = {
        'model_type': 'knn',
        'num_samples': num_samples,
        'num_classes': num_classes,
        'feature_dim': X.shape[1]
    }
    
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    joblib.dump(metadata, metadata_path)
    
    print(f" Model đã cập nhật thành công!")
    print(f"   Model type: KNN")
    print(f"   Samples: {num_samples}")
    print(f"   Classes: {num_classes}")

if __name__ == "__main__":
    incremental_train()
