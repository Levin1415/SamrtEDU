# 🐘 SmartAcad Backend - PostgreSQL Edition

Complete PostgreSQL implementation of the SmartAcad educational platform backend.

---

## 🎯 Quick Start

### Prerequisites
- Python 3.9+
- PostgreSQL 14+ (running on localhost:5432)
- Virtual environment activated

### 1-Minute Setup

```bash
# Windows
start_postgres.bat

# Linux/Mac
chmod +x start_postgres.sh
./start_postgres.sh
```

That's it! Server will be running on http://localhost:8000

---

## 📦 Manual Setup

### Step 1: Install PostgreSQL

**Option A: Docker (Recommended)**
```bash
docker run --name smartacad-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=smartacad \
  -p 5432:5432 \
  -d postgres:14
```

**Option B: Windows**
```bash
choco install postgresql
net start postgresql-x64-14
```

**Option C: Linux**
```bash
sudo apt install postgresql
sudo systemctl start postgresql
```

### Step 2: Install Dependencies
```bash
pip install -r requirements_postgres.txt
```

### Step 3: Configure Environment
```bash
# Copy template
cp .env.postgres .env

# Edit .env
DATABASE_URL=postgresql://postgres:password@localhost:5432/smartacad
JWT_SECRET=your-secret-key-here
OPENAI_API_KEY=your-openai-key
GEMINI_API_KEY=your-gemini-key
```

### Step 4: Initialize Database
```bash
python -c "import asyncio; from database_postgres import init_db; asyncio.run(init_db())"
```

### Step 5: Start Server
```bash
uvicorn main_postgres:app --reload --port 8000
```

---

## 🔄 Migrate from MongoDB

If you have existing MongoDB data:

```bash
# 1. Ensure both databases are running
mongosh --eval "db.adminCommand('ping')"
pg_isready -h localhost -p 5432

# 2. Run migration script
python migrate_data.py

# 3. Start PostgreSQL server
uvicorn main_postgres:app --reload --port 8000
```

See `MIGRATION_GUIDE.md` for detailed instructions.

---

## 📁 Project Structure

```
backend/
├── 🐘 PostgreSQL Files
│   ├── database_postgres.py          # SQLAlchemy models
│   ├── main_postgres.py              # FastAPI app
│   ├── config_postgres.py            # Configuration
│   ├── requirements_postgres.txt     # Dependencies
│   ├── .env.postgres                 # Environment 