# 🔄 Quick Database Switch Guide

## Switch Between MongoDB and PostgreSQL

---

## 📦 Current Setup

Your backend now has **BOTH** MongoDB and PostgreSQL implementations:

```
backend/
├── MongoDB Version (Original)
│   ├── database.py
│   ├── main.py (if not updated)
│   ├── middleware/auth_middleware.py
│   ├── services/badge_service.py
│   └── routes/
│
└── PostgreSQL Version (New)
    ├── database_postgres.py
    ├── main_postgres.py
    ├── middleware/auth_middleware_postgres.py
    ├── services/badge_service_postgres.py
    └── routes_postgres/
```

---

## 🔵 Use PostgreSQL (Recommended)

### Method 1: Use main_postgres.py directly
```bash
uvicorn main_postgres:app --reload --port 8000
```

### Method 2: Replace main.py
```bash
# Backup original
cp main.py main_mongodb.py

# Use PostgreSQL version
cp main_postgres.py main.py

# Start server
uvicorn main:app --reload --port 8000
```

### Method 3: Update main.py imports
Edit `main.py` and change:
```python
# FROM:
from database import init_db
from routes import auth, users, ai, lessons, schedule, timetable, assessments, badges, analytics

# TO:
from database_postgres import init_db
from routes_postgres import auth, users, ai, lessons, schedule, timetable, assessments, badges, analytics
```

---

## 🟢 Use MongoDB (Original)

### If you used Method 1:
```bash
uvicorn main:app --reload --port 8000
```

### If you used Method 2:
```bash
# Restore original
cp main_mongodb.py main.py

# Start server
uvicorn main:app --reload --port 8000
```

### If you used Method 3:
Revert the imports in `main.py` back to:
```python
from database import init_db
from routes import auth, users, ai, lessons, schedule, timetable, assessments, badges, analytics
```

---

## ⚙️ Environment Variables

### For PostgreSQL (.env)
```env
# PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/smartacad

# Keep these the same
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
OPENAI_API_KEY=your-openai-key
GEMINI_API_KEY=your-gemini-key
```

### For MongoDB (.env)
```env
# MongoDB
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=smartacad

# Keep these the same
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
OPENAI_API_KEY=your-openai-key
GEMINI_API_KEY=your-gemini-key
```

---

## 🧪 Quick Test

After switching, verify the database:

```bash
# Test health endpoint
curl http://localhost:8000/health

# PostgreSQL response:
# {"status": "healthy", "database": "PostgreSQL"}

# MongoDB response:
# {"status": "healthy", "database": "MongoDB"}
```

---

## 📊 Comparison

| Feature | MongoDB | PostgreSQL |
|---------|---------|------------|
| Setup | ✅ Easier | ⚠️ Requires more config |
| Performance | ✅ Fast reads | ✅ Fast complex queries |
| Relationships | ⚠️ Manual | ✅ Foreign keys |
| Transactions | ⚠️ Limited | ✅ Full ACID |
| JSON Data | ✅ Native | ✅ JSONB support |
| Scaling | ✅ Horizontal | ✅ Vertical |
| Data Integrity | ⚠️ Application-level | ✅ Database-level |

---

## 🎯 Recommendation

**Use PostgreSQL for:**
- Production deployments
- Complex queries and analytics
- Strong data integrity requirements
- Relational data with foreign keys

**Use MongoDB for:**
- Rapid prototyping
- Flexible schema requirements
- Document-heavy workloads
- Simpler deployment

---

## 🔄 Data Sync

If you need to keep both databases in sync:

```bash
# MongoDB → PostgreSQL
python migrate_data.py

# PostgreSQL → MongoDB (create reverse script if needed)
# Not included - MongoDB is typically the source
```

---

## 💡 Pro Tips

1. **Development**: Use MongoDB for faster iteration
2. **Production**: Use PostgreSQL for reliability
3. **Testing**: Keep both implementations to compare performance
4. **Migration**: Run both in parallel during transition period

---

## 🆘 Need Help?

- Check `MIGRATION_GUIDE.md` for detailed PostgreSQL setup
- Check `README.md` for general backend setup
- Both databases use the same API endpoints (no frontend changes!)
