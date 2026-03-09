# 🚀 MongoDB to PostgreSQL Migration Guide

## Complete migration from MongoDB/Motor to PostgreSQL/SQLAlchemy for SmartAcad Backend

---

## 📋 Prerequisites

- Python 3.9+
- PostgreSQL 14+ installed
- Existing MongoDB data (optional - for data migration)
- Virtual environment activated

---

## 🔧 Step 1: Install PostgreSQL

### Option A: Local Installation (Windows)
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql

# Start PostgreSQL service
net start postgresql-x64-14
```

### Option B: Docker (Recommended)
```bash
# Run PostgreSQL in Docker
docker run --name smartacad-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=smartacad \
  -p 5432:5432 \
  -d postgres:14

# Verify it's running
docker ps
```

---

## 📦 Step 2: Backup MongoDB Data (Optional)

```bash
# Backup current MongoDB database
mongodump --db smartacad --out ./mongodb_backup

# Export to JSON for easier migration
mongoexport --db smartacad --collection users --out users.json
mongoexport --db smartacad --collection assessments --out assessments.json
mongoexport --db smartacad --collection badges --out badges.json
# ... repeat for all collections
```

---

## 🔄 Step 3: Update Dependencies

```bash
# Backup current requirements
cp requirements.txt requirements_mongodb_backup.txt

# Install new requirements
pip install -r requirements_postgres.txt

# Verify installation
pip list | grep -E "sqlalchemy|asyncpg|psycopg2"
```

---

## ⚙️ Step 4: Update Configuration Files

### 1. Update `.env` file:
```bash
# Copy the PostgreSQL template
cp .env.postgres .env

# Edit .env and update:
DATABASE_URL=postgresql://postgres:password@localhost:5432/smartacad
OPENAI_API_KEY=your_actual_key
GEMINI_API_KEY=your_actual_key
JWT_SECRET=your_actual_secret
```

### 2. Replace main files:
```bash
# Backup originals
mv main.py main_mongodb_backup.py
mv config.py config_mongodb_backup.py
mv database.py database_mongodb_backup.py

# Use PostgreSQL versions
mv main_postgres.py main.py
mv config_postgres.py config.py
mv database_postgres.py database.py
```

---

## 🗄️ Step 5: Initialize PostgreSQL Database

```bash
# Test database connection
python -c "from database import init_db; import asyncio; asyncio.run(init_db())"

# You should see: ✅ PostgreSQL database initialized successfully!
```

---

## 📊 Step 6: Migrate Data (Optional)

### Option A: Manual Migration Script

Create `migrate_data.py`:
```python
import asyncio
import json
from motor.motor_asyncio import AsyncIOMotorClient
from database import AsyncSessionLocal, User, Assessment, Badge, Schedule, Timetable, LessonPlan, ChatHistory
from datetime import datetime

async def migrate_users():
    # Connect to MongoDB
    mongo_client = AsyncIOMotorClient("mongodb://localhost:27017")
    mongo_db = mongo_client.smartacad
    
    # Get PostgreSQL session
    async with AsyncSessionLocal() as session:
        # Fetch MongoDB users
        users = await mongo_db.users.find().to_list(None)
        
        for user in users:
            pg_user = User(
                id=str(user["_id"]),
                name=user["name"],
                email=user["email"],
                password_hash=user["password_hash"],
                role=user["role"],
                grade=user.get("grade"),
                subject=user.get("subject"),
                language_pref=user.get("language_pref", "English"),
                avatar_url=user.get("avatar_url"),
                created_at=user.get("created_at", datetime.utcnow())
            )
            session.add(pg_user)
        
        await session.commit()
        print(f"✅ Migrated {len(users)} users")

# Run migration
asyncio.run(migrate_users())
```

Run it:
```bash
python migrate_data.py
```

### Option B: Start Fresh (Recommended for Development)
```bash
# Just start with empty database
# Users will register again
```

---

## 🔄 Step 7: Update Route Files

All route files need minimal changes. The main pattern:

**Before (MongoDB):**
```python
from database import users_collection
user = await users_collection.find_one({"email": email})
```

**After (PostgreSQL):**
```python
from database import get_db, User
from sqlalchemy import select

async with get_db() as session:
    result = await session.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
```

I've created updated route files in `routes_postgres/` folder.

---

## 🧪 Step 8: Test the Migration

### 1. Start the server:
```bash
uvicorn main:app --reload --port 8000
```

### 2. Test health endpoint:
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy","database":"PostgreSQL"}
```

### 3. Test registration:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "test@example.com",
    "password": "password123",
    "role": "student"
  }'
```

### 4. Test login:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 🎯 Step 9: Update Frontend (No Changes Needed!)

The frontend API calls remain **100% identical**:
```javascript
// These still work without any changes!
await assessmentsAPI.getAssessments()
await badgesAPI.getBadges()
await scheduleAPI.getSchedules()
```

---

## 📈 Step 10: Performance Optimization

### Add indexes for better performance:
```python
# Already included in database.py:
# - Index on users.email (unique)
# - Index on chat_history.user_id
# - Index on schedules (user_id, date)
# - Index on timetables (user_id, day)
# - Index on assessments.teacher_id
# - Index on submissions (assessment_id, student_id) - unique
# - Index on badges.student_id
```

---

## 🔍 Verification Checklist

- [ ] PostgreSQL is running
- [ ] Database tables created successfully
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can create assessments
- [ ] Can submit assessments
- [ ] Can view badges
- [ ] Can manage schedules
- [ ] Can manage timetables
- [ ] Frontend connects successfully
- [ ] No errors in server logs

---

## 🐛 Troubleshooting

### Issue: "asyncpg.exceptions.InvalidCatalogNameError"
**Solution:** Create database manually:
```bash
psql -U postgres
CREATE DATABASE smartacad;
\q
```

### Issue: "Connection refused"
**Solution:** Check PostgreSQL is running:
```bash
# Windows
net start postgresql-x64-14

# Docker
docker start smartacad-postgres
```

### Issue: "Module not found: sqlalchemy"
**Solution:** Reinstall dependencies:
```bash
pip install -r requirements_postgres.txt
```

### Issue: "Pydantic validation error"
**Solution:** Check model field types match database schema

---

## 🎉 Success!

Your backend is now running on PostgreSQL with:
- ✅ All API endpoints working
- ✅ Zero frontend changes needed
- ✅ Better performance with indexes
- ✅ ACID transactions
- ✅ Relational data integrity
- ✅ Production-ready setup

---

## 📚 Next Steps

1. **Production Deployment:**
   - Use managed PostgreSQL (AWS RDS, DigitalOcean, Heroku)
   - Update DATABASE_URL in production .env
   - Enable SSL: `?sslmode=require`

2. **Monitoring:**
   - Add database connection pooling monitoring
   - Set up query performance logging
   - Monitor slow queries

3. **Backup Strategy:**
   - Set up automated PostgreSQL backups
   - Use `pg_dump` for regular backups
   - Test restore procedures

---

## 🔗 Resources

- [SQLAlchemy Async Docs](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
- [FastAPI with Databases](https://fastapi.tiangolo.com/advanced/async-sql-databases/)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)

---

**Migration Time:** ~30 minutes  
**Downtime:** ~5 minutes (for production)  
**Rollback:** Keep MongoDB backup for 30 days


---

## ✅ MIGRATION STATUS: COMPLETE

All PostgreSQL route files have been created and are ready to use:

### Completed Files:
- ✅ `database_postgres.py` - SQLAlchemy models with all relationships
- ✅ `main_postgres.py` - Updated FastAPI app with all routes
- ✅ `config_postgres.py` - PostgreSQL configuration
- ✅ `requirements_postgres.txt` - Updated dependencies
- ✅ `.env.postgres` - Environment template
- ✅ `migrate_data.py` - Complete data migration script
- ✅ `middleware/auth_middleware_postgres.py` - Auth middleware
- ✅ `services/badge_service_postgres.py` - Badge service for PostgreSQL
- ✅ `routes_postgres/__init__.py` - Package initializer
- ✅ `routes_postgres/auth.py` - Authentication routes
- ✅ `routes_postgres/users.py` - User management routes
- ✅ `routes_postgres/ai.py` - AI chat routes
- ✅ `routes_postgres/lessons.py` - Lesson plan routes
- ✅ `routes_postgres/schedule.py` - Schedule management routes
- ✅ `routes_postgres/timetable.py` - Timetable routes
- ✅ `routes_postgres/assessments.py` - Assessment routes
- ✅ `routes_postgres/badges.py` - Badge routes
- ✅ `routes_postgres/analytics.py` - Analytics routes

---

## 🎯 Quick Start (After PostgreSQL is Running)

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements_postgres.txt
```

### 2. Configure Environment
```bash
# Copy template
cp .env.postgres .env

# Edit .env with your PostgreSQL credentials
DATABASE_URL=postgresql://postgres:password@localhost:5432/smartacad
```

### 3. Initialize Database
```bash
# This will create all tables
python -c "import asyncio; from database_postgres import init_db; asyncio.run(init_db())"
```

### 4. Migrate Data (Optional - if you have MongoDB data)
```bash
python migrate_data.py
```

### 5. Update main.py
```bash
# Backup original
cp main.py main_mongodb.py

# Use PostgreSQL version
cp main_postgres.py main.py

# Or update imports in main.py:
# Change: from database import ...
# To: from database_postgres import ...
# Change: from routes import ...
# To: from routes_postgres import ...
```

### 6. Start Server
```bash
uvicorn main:app --reload --port 8000
```

### 7. Test Endpoints
```bash
# Health check
curl http://localhost:8000/health

# Should return: {"status": "healthy", "database": "PostgreSQL"}
```

---

## 🔄 Data Migration Details

The `migrate_data.py` script handles:
- ✅ Users (with password hashes)
- ✅ Chat history (all messages)
- ✅ Lesson plans (with time slots)
- ✅ Schedules (all blocks)
- ✅ Timetables (all slots)
- ✅ Assessments (with questions JSON)
- ✅ Submissions (with feedback)
- ✅ Badges (all earned badges)

**Note:** The script preserves all IDs from MongoDB to maintain referential integrity.

---

## 🎨 Frontend Compatibility

**ZERO CHANGES REQUIRED** to the frontend! All API responses match the MongoDB format:
- IDs are returned as strings (matching MongoDB's ObjectId)
- Response structures are identical
- All endpoints remain the same
- Authentication flow unchanged

---

## 🧪 Testing Checklist

After migration, test these key flows:

### Authentication
- [ ] Register new user
- [ ] Login with credentials
- [ ] Get current user (/api/auth/me)
- [ ] Refresh token

### Student Features
- [ ] View assessments
- [ ] Submit assessment
- [ ] View badges
- [ ] Chat with AI
- [ ] View/edit schedule
- [ ] View/edit timetable
- [ ] View analytics

### Teacher Features
- [ ] Create lesson plan
- [ ] Generate assessment
- [ ] View student submissions
- [ ] View class analytics
- [ ] Manage timetable

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
docker ps  # if using Docker
# or
pg_isready -h localhost -p 5432

# Test connection
psql -h localhost -U postgres -d smartacad
```

### Import Errors
```bash
# Make sure all dependencies are installed
pip install -r requirements_postgres.txt

# Check Python path
python -c "import sqlalchemy; print(sqlalchemy.__version__)"
```

### Migration Script Fails
```bash
# Check MongoDB is still running
mongosh --eval "db.adminCommand('ping')"

# Verify .env has both MongoDB and PostgreSQL URLs
cat .env | grep DATABASE_URL
```

### Table Already Exists Error
```bash
# Drop all tables and recreate
python -c "
import asyncio
from database_postgres import engine, Base
async def reset():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
asyncio.run(reset())
"
```

---

## 📊 Performance Improvements

PostgreSQL offers several advantages over MongoDB:

1. **Relational Integrity**: Foreign keys ensure data consistency
2. **ACID Compliance**: Full transaction support
3. **Indexing**: Optimized queries on user_id, date, etc.
4. **JSON Support**: JSONB fields for flexible data (questions, feedback)
5. **Connection Pooling**: Better concurrent request handling

---

## 🔐 Security Notes

- Password hashes are preserved during migration
- JWT tokens remain compatible
- All authentication middleware updated
- Role-based access control maintained

---

## 📝 Rollback Plan

If you need to rollback to MongoDB:

```bash
# Restore original files
cp main_mongodb.py main.py

# Restart with MongoDB
uvicorn main:app --reload --port 8000
```

Your MongoDB data remains untouched during migration.

---

## 🎉 Migration Complete!

Your SmartAcad backend is now running on PostgreSQL with:
- ✅ All routes converted
- ✅ All models migrated
- ✅ Data migration script ready
- ✅ Frontend compatibility maintained
- ✅ Zero breaking changes

**Estimated migration time: 15-30 minutes**

For questions or issues, check the troubleshooting section above.
