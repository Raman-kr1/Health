#!/bin/bash

echo "==================================="
echo "Starting Health Monitoring App..."
echo "==================================="

# Function to clean up background processes on script exit
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Trap SIGINT (Ctrl+C) and SIGTERM to run the cleanup function
trap cleanup SIGINT SIGTERM

# --- 1. Start Backend ---
echo "Starting Backend (FastAPI)..."
cd backend || exit

# Create a virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate the virtual environment
source venv/bin/activate

# Install requirements
echo "Installing backend dependencies (this may take a minute for large packages like pandas or scikit-learn)..."
pip install -r requirements.txt

# Run the FastAPI server in the background
echo "Running FastAPI server..."
python3 -m uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# Go back to project root
cd ..

# --- 2. Start Frontend ---
echo "Starting Frontend (React)..."
cd frontend || exit

# Install Node modules if needed
echo "Installing frontend dependencies..."
npm install

# Start the React app in the background
echo "Running React app..."
npm start &
FRONTEND_PID=$!

# Go back to project root
cd ..

echo "==================================="
echo "Backend running on http://localhost:8000"
echo "Frontend running on http://localhost:3000"
echo "Press Ctrl+C to stop both servers."
echo "==================================="

# Wait for both background processes to keep the script running
wait $BACKEND_PID $FRONTEND_PID
