"""
Quick script to create the smartacad database
"""
import asyncio
import asyncpg

async def create_database():
    try:
        # Connect to default postgres database
        conn = await asyncpg.connect(
            user='postgres',
            password='password',
            host='localhost',
            port=5432,
            database='postgres'
        )
        
        # Check if database exists
        exists = await conn.fetchval(
            "SELECT 1 FROM pg_database WHERE datname = 'smartacad'"
        )
        
        if not exists:
            # Create database
            await conn.execute('CREATE DATABASE smartacad')
            print("✅ Database 'smartacad' created successfully!")
        else:
            print("✅ Database 'smartacad' already exists!")
        
        await conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nPlease check:")
        print("1. PostgreSQL is running")
        print("2. Username is 'postgres'")
        print("3. Password is 'password'")
        print("4. Port is 5432")

if __name__ == "__main__":
    asyncio.run(create_database())
