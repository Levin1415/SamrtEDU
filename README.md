# SmartAcad - AI-Powered Smart Academic Planning and Interactive Learning System

A complete, production-ready web application for intelligent academic planning, AI tutoring, and automated assessments.

## 🚀 Features

### For Students
- **AI Tutor**: Multimodal Q&A with voice input (Whisper API) and multi-language support (Gemini API)
- **Smart Scheduling**: AI-powered weekly study plans and emergency-aware daily planning
- **Auto Assessments**: Take AI-generated assessments with instant grading
- **Badges & Rewards**: Earn badges for achievements with confetti animations
- **Analytics**: Track study hours, assessment scores, and progress

### For Teachers
- **Lesson Plan Generator**: Full and instant AI-generated lesson plans
- **Assessment Creator**: Auto-generate assessments with GPT-4o
- **Student Performance**: View class analytics and top performers
- **Timetable Management**: Create and manage class schedules

## 🛠️ Tech Stack

### Frontend
- React 18 with React Router v6
- Tailwind CSS (dark/light mode)
- Axios, Recharts, Framer Motion
- React Hook Form, React Toastify
- Lucide React icons

### Backend
- Python FastAPI
- JWT Authentication
- Motor (async MongoDB)
- OpenAI (Whisper, GPT-4o)
- Google Gemini API

### Database
- MongoDB (local instance)

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- MongoDB Community Server
- OpenAI API key
- Google Gemini API key

## 🔧 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd smartacad
```

### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env

# Edit .env and add your API keys:
# OPENAI_API_KEY=your_openai_key
# GEMINI_API_KEY=your_gemini_key
# MONGODB_URI=mongodb://localhost:27017/smartacad
# JWT_SECRET=your_secret_key
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install
```

### 4. Start MongoDB

Make sure MongoDB is running on `localhost:27017`

```bash
# Windows (if installed as service):
net start MongoDB

# Mac (if installed via Homebrew):
brew services start mongodb-community

# Linux:
sudo systemctl start mongod
```

## 🚀 Running the Application

### Start Backend (Terminal 1)

```bash
cd backend
uvicorn main:app --reload
```

Backend will run on `http://localhost:8000`

### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📱 Usage

1. Visit `http://localhost:5173`
2. Register as Student or Teacher
3. Login with your credentials
4. Explore the features!

### Default Test Accounts (Create these via registration)
- Student: student@test.com / password123
- Teacher: teacher@test.com / password123

## 🔑 API Keys Setup

### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add to backend/.env as `OPENAI_API_KEY`

### Google Gemini API Key
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Add to backend/.env as `GEMINI_API_KEY`

## 📁 Project Structure

```
smartacad/
├── backend/
│   ├── main.py                 # FastAPI app
│   ├── config.py               # Configuration
│   ├── database.py             # MongoDB connection
│   ├── models/                 # Pydantic models
│   ├── routes/                 # API routes
│   ├── services/               # AI services
│   └── middleware/             # Auth middleware
├── frontend/
│   ├── src/
│   │   ├── api/               # API calls
│   │   ├── components/        # React components
│   │   ├── context/           # Context providers
│   │   ├── hooks/             # Custom hooks
│   │   ├── pages/             # Page components
│   │   ├── utils/             # Utility functions
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🎯 Key Features Implementation

### Multimodal AI Chat
- Voice input via browser MediaRecorder API
- Transcription with OpenAI Whisper
- Multi-language responses with Gemini
- Question type detection with GPT-4o

### Smart Scheduling
- AI-optimized weekly schedules
- Energy-aware daily planning
- Emergency/interruption handling
- Drag-and-drop rescheduling

### Auto Assessment
- GPT-4o generates questions
- Gemini grades submissions
- Instant feedback per question
- Automatic badge awards

### Badge System
- Score-based badges (Bronze/Silver/Gold)
- Streak tracking
- Activity milestones
- Confetti animations

## 🔒 Security

- JWT-based authentication
- Bcrypt password hashing
- Role-based access control
- HTTP-only cookies support
- CORS configuration

## 🌍 Multi-Language Support

Supported languages:
- English
- Bahasa Melayu
- Arabic (العربية)
- French (Français)
- Mandarin (中文)
- Tamil (தமிழ்)
- Spanish (Español)

## 📊 Database Collections

- `users` - User accounts
- `chat_history` - AI chat messages
- `lesson_plans` - Teacher lesson plans
- `schedules` - Student study schedules
- `timetables` - Class timetables
- `assessments` - Generated assessments
- `submissions` - Student submissions
- `badges` - Earned badges

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in .env
- Verify port 27017 is not blocked

### API Key Errors
- Verify API keys are correct in .env
- Check API key permissions
- Ensure sufficient API credits

### Frontend Build Errors
- Delete node_modules and package-lock.json
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`

## 📝 License

MIT License

## 👥 Support

For issues and questions, please open an issue on GitHub.

## 🎉 Acknowledgments

- OpenAI for Whisper and GPT-4o APIs
- Google for Gemini API
- FastAPI and React communities
