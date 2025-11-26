#!/usr/bin/env bash
# Script: start_all.sh
# Purpose: Start Python Face API, Spring Boot backend, and React frontend.
# Usage: ./start_all.sh
# Requires: GNU screen (optional), Node.js, Java, Maven

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PY_DIR="$ROOT_DIR/face_attendant_svm"
SPRING_DIR="$ROOT_DIR/springbootapp"
REACT_DIR="$ROOT_DIR/reactapp"

PY_PORT=5000
SPRING_PORT=8080
REACT_PORT=3000

start_python() {
  echo "[PY] Starting Python Face API ..."
  (cd "$PY_DIR" && ./start_python_service.sh > "$PY_DIR/python_service.log" 2>&1 &) 
  sleep 2
  echo "[PY] Logs: tail -f $PY_DIR/python_service.log"
}

start_spring() {
  echo "[SPRING] Starting Spring Boot backend ..."
  (cd "$SPRING_DIR" && ./mvnw spring-boot:run > "$SPRING_DIR/springboot.log" 2>&1 &)
  sleep 5
  echo "[SPRING] Logs: tail -f $SPRING_DIR/springboot.log"
}

start_react() {
  echo "[REACT] Starting React frontend ..."
  (cd "$REACT_DIR" && npm install && npm start > "$REACT_DIR/react.log" 2>&1 &)
  sleep 5
  echo "[REACT] Logs: tail -f $REACT_DIR/react.log"
}

health_checks() {
  echo "[CHECK] Performing health checks ..."
  curl -s "http://localhost:$PY_PORT/health" && echo " => Python Face API OK" || echo "Python Face API NOT READY"
  curl -s -o /dev/null -w "%{http_code}" "http://localhost:$SPRING_PORT/actuator/health" | grep -q "200" && echo "Spring Boot OK" || echo "Spring Boot NOT READY"
  echo "React dev server (manual check): http://localhost:$REACT_PORT"
}

main() {
  echo "================================" 
  echo " Unified Startup: Face + Backend + UI "
  echo "================================" 
  start_python
  start_spring
  start_react
  echo "[INFO] Services starting... waiting before health checks"
  sleep 8
  health_checks
  echo "[DONE] All start commands issued."
}

main "$@"
