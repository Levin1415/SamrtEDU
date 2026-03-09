@echo off
REM Quick start script for PostgreSQL backend (Windows)

echo 🚀 Starting SmartAcad with PostgreSQL...
echo.

REM Check if .env exists
if not exist .env (
    echo ⚠️  .env file not found, creating from template...
    copy .env.postgres .env
    echo 📝 Please edit .env with your database credentials
    pause
    exit /b 1
)

echo ✅ .env file found

REM Check if dependencies are installed
python -c "import sqlalchemy" 2>nul
if errorlevel 1 (
    echo 📦 Installing dependencies...
    pip install -r requirements_postgres.txt
)

echo ✅ Dependencies installed

REM Initialize database
echo 🔧 Initializing database tables...
python -c "import asyncio; from database_postgres import init_db; asyncio.run(init_db())" 2>nul

echo ✅ Database initialized
echo.
echo 🎉 Starting server on http://localhost:8000
echo 📚 API docs: http://localhost:8000/docs
echo.

REM Start the server
uvicorn main_postgres:app --reload --port 8000
