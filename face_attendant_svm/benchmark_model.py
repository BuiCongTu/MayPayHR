import os
import numpy as np
import joblib
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "data")

def benchmark_model():
    print(" KIỂM TRA HIỆU SUẤT MODEL")
    print("=" * 50)
    
    model_path = os.path.join(MODELS_DIR, "svm_model.pkl")
    scaler_path = os.path.join(MODELS_DIR, "normalizer.pkl")
    metadata_path = os.path.join(MODELS_DIR, "model_metadata.pkl")
    emb_path = os.path.join(DATA_DIR, "embeddings.npy")
    
    if not os.path.exists(model_path):
        print(" Chưa có model. Hãy train trước!")
        return
    
    print("\n Thông tin Model:")
    if os.path.exists(metadata_path):
        metadata = joblib.load(metadata_path)
        for key, value in metadata.items():
            print(f"  {key}: {value}")
    
    print("\n⏱️  Kiểm tra tốc độ Load Model:")
    start = time.time()
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    load_time = time.time() - start
    print(f"  Thời gian load: {load_time:.4f}s")
    
    print("\n⚡ Kiểm tra tốc độ Inference:")
    X = np.load(emb_path)
    sample_size = min(100, X.shape[0])
    X_sample = X[:sample_size]
    
    X_norm = scaler.transform(X_sample)
    
    start = time.time()
    predictions = model.predict(X_norm)
    inference_time = time.time() - start
    
    avg_time = inference_time / sample_size * 1000
    print(f"  {sample_size} mẫu: {inference_time:.4f}s")
    print(f"  Trung bình: {avg_time:.2f}ms/mẫu")
    print(f"  Throughput: {sample_size/inference_time:.0f} mẫu/giây")
    
    print("\n💾 Kích thước Model:")
    model_size = os.path.getsize(model_path) / 1024
    scaler_size = os.path.getsize(scaler_path) / 1024
    print(f"  Model: {model_size:.2f} KB")
    print(f"  Scaler: {scaler_size:.2f} KB")
    print(f"  Tổng: {model_size + scaler_size:.2f} KB")
    
    print("\n Kiểm tra hoàn tất!")

if __name__ == "__main__":
    benchmark_model()
