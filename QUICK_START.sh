echo "📌 Bước 1: Kiểm tra Python Face API..."
if curl -s http://localhost:5001/health > /dev/null 2>&1; then
    echo "Python Face API đang chạy (port 5001)"
else
    echo " Python Face API chưa chạy"
    echo "   Mở terminal mới và chạy:"
    echo "   cd face_attendant_svm"
    echo "   source .venv/bin/activate"
    echo "   python face_api_service.py"
    echo ""
    read -p "Nhấn Enter sau khi đã khởi động Python service..."
fi

# Start Spring Boot
echo ""
echo " Bước 2: Khởi động Spring Boot backend..."
echo "   Port: 9999"
echo "   Đang compile và chạy..."
(cd "$ROOT_DIR/springbootapp" && ./mvnw spring-boot:run > /dev/null 2>&1 &)
SPRING_PID=$!
echo "   PID: $SPRING_PID"
echo "   Đợi 15 giây để Spring Boot khởi động..."
sleep 15

# Check Spring Boot
if curl -s http://localhost:9999/actuator/health > /dev/null 2>&1; then
    echo "Spring Boot đang chạy"
else
    echo " Spring Boot có thể đang khởi động, kiểm tra logs nếu cần"
fi

# Start React
echo ""
echo "" Bước 3: Khởi động React frontend..."
echo "   Port: 3000"
(cd "$ROOT_DIR/reactapp" && npm start > /dev/null 2>&1 &)
REACT_PID=$!
echo "   PID: $REACT_PID"
echo "   Đợi 10 giây để React dev server khởi động..."
sleep 10

echo ""
echo "=================================================="
echo "TẤT CẢ SERVICES ĐÃ KHỞI ĐỘNG"
echo "=================================================="
echo ""
echo "Python Face API:    http://localhost:5001"
echo " Spring Boot API:    http://localhost:9999"
echo " React Frontend:     http://localhost:3000"
echo ""
echo "Các trang React:"
echo "   - Check-In:         http://localhost:3000/attendance/checkin"
echo "   - Check-Out:        http://localhost:3000/attendance/checkout"
echo "   - Đăng ký face:     http://localhost:3000/attendance/register"
echo "   - Lịch sử:          http://localhost:3000/attendance/history"
echo ""
echo "Test API:"
echo "   curl http://localhost:5001/health"
echo "   curl http://localhost:9999/actuator/health"
echo ""
echo " Dừng services:"
echo "   kill $SPRING_PID $REACT_PID"
echo "   (Python service: Ctrl+C trong terminal đang chạy)"
echo ""
echo "=================================================="
