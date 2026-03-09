#!/bin/bash
# Quick start script for PostgreSQL backend

echo "🚀 Starting SmartAcad with PostgreSQL..."
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running!"
    echo "Please start PostgreSQL first:"
    echo "  - Docker: docker start smartacad-postgres"
    echo "  - Windows: net start postgresql-x64-14"
    echo "  - Linux: sudo systemctl start postgresql"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found, creating from template..."
    cp .env.postgres .env
    echo "📝 Please edit .env with your database credentials"
    exit 1
fi

echo "✅ .env file found"

# Check if dependencies are installed
if ! python -c "import sqlalchemy" > /dev/null 2>&1; then
    echo "📦 Installing dependencies..."
    pip install -r requirements_postgres.txt
fi

echo "✅ Dependencies installed"

# Initialize database if needed
echo "🔧 Initializing database tables..."
python -c "import asyncio; from database_postgres import init_db; asyncio.run(init_db())" 2>/dev/null

echo "✅ Database initialized"
echo ""
echo "🎉 Starting server on http://localhost:8000"
echo "📚 API docs: http://localhost:8000/docs"
echo ""

# Start the server
uvicorn main_postgres:app --reload --port 8000
