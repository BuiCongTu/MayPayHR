#!/usr/bin/env bash
# Script: test_endpoints.sh
# Purpose: Quick manual curl tests for integrated system endpoints.
# Usage: ./test_endpoints.sh

set -euo pipefail

PY_PORT=5000
SPRING_PORT=8080

BOLD='\033[1m'
NC='\033[0m'

print_header() {
  echo -e "\n${BOLD}== $1 ==${NC}"
}

check_python_health() {
  print_header "Python Face API Health"
  curl -s "http://localhost:$PY_PORT/health" | jq . || curl -s "http://localhost:$PY_PORT/health"
}

train_model() {
  print_header "Train Model (Spring Boot -> Python)"
  curl -s -X POST "http://localhost:$SPRING_PORT/api/attendance/train-model" -H 'Content-Type: application/json' | jq . || true
}

register_face_mock() {
  print_header "Register Face (Spring Boot -> Python) MOCK"
  # NOTE: Replace MOCK_BASE64 with actual base64 string of a JPEG face image
  MOCK_BASE64="/9j/4AAQSkZJRgABAQAAAQABAAD..." 
  curl -s -X POST "http://localhost:$SPRING_PORT/api/attendance/register-face" \
    -H 'Content-Type: application/json' \
    -d "{\"userId\":1,\"imageBase64\":\"$MOCK_BASE64\"}" | jq . || true
}

recognize_face_mock() {
  print_header "Recognize Face (Check-In) MOCK"
  MOCK_BASE64="/9j/4AAQSkZJRgABAQAAAQABAAD..." 
  curl -s -X POST "http://localhost:$SPRING_PORT/api/attendance/checkin" \
    -H 'Content-Type: application/json' \
    -d "{\"imageBase64\":\"$MOCK_BASE64\"}" | jq . || true
}

attendance_history() {
  print_header "Attendance History (User 1, Today)"
  TODAY=$(date +%Y-%m-%d)
  curl -s "http://localhost:$SPRING_PORT/api/attendance/history/1?date=$TODAY" | jq . || true
}

main() {
  echo "=============================="
  echo " Endpoint Smoke Tests "
  echo "=============================="

  check_python_health
  train_model
  register_face_mock
  recognize_face_mock
  attendance_history

  echo -e "\n[INFO] Tests completed. Replace MOCK_BASE64 with real captured image data for real testing."
}

main "$@"
