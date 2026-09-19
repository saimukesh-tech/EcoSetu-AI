@echo off
echo ============================================================
echo           EcoSetu AI — Production Service Launcher         
echo ============================================================
echo.

echo 1. Starting Python FastAPI ML Microservice (Port 8000)...
start "EcoSetu ML Service" cmd /k "cd ml-service && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

echo 2. Starting Express Backend (Port 3001)...
start "EcoSetu Express Backend" cmd /k "cd backend && npx tsx watch src/index.ts"

echo 3. Starting React Frontend (Port 5173)...
start "EcoSetu React Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo All services launched!
echo Open http://localhost:5173 in your browser.
echo ============================================================
