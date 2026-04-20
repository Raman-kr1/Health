# 🏥 Intelligent Health Monitoring System

<div align="center">

![Health Monitor Banner](https://img.shields.io/badge/Health-Monitoring-blue?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18.2+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-316192?style=for-the-badge&logo=postgresql&logoColor=white)

**An AI-powered health monitoring platform that helps users track vital signs, analyze symptoms, manage medications, and optimize medical appointments.**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [API Docs](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 🌟 Features

<table>
<tr>
<td>

### 📊 Health Tracking
- Real-time vital signs monitoring
- Blood pressure, heart rate, temperature
- Weight and blood sugar tracking
- Historical data visualization with D3.js

</td>
<td>

### 🤖 AI Analysis
- Symptom analysis powered by Google Gemini
- Health trend predictions using ML
- Personalized health insights
- 24/7 AI health assistant

</td>
</tr>
<tr>
<td>

### 💊 Medicine Management
- Medicine interaction checker
- Dosage tracking and reminders
- Drug safety information
- Prescription history

</td>
<td>

### 📅 Smart Scheduling
- Appointment optimization
- Calendar integration
- Automated reminders
- Doctor visit history

</td>
</tr>
</table>

## 🎯 Key Highlights

- **🔒 Secure**: JWT authentication & encrypted data storage
- **📱 Responsive**: Works on desktop, tablet, and mobile
- **⚡ Fast**: Optimized with FastAPI backend and React frontend
- **📈 Scalable**: Microservices-ready architecture
- **🎨 Modern UI**: Clean, intuitive interface with real-time updates
<!--
## 🖼️ Screenshots

<div align="center">
<table>
<tr>
<td><img src="<img width="1886" height="1060" alt="image" src="https://github.com/user-attachments/assets/a1b8987a-fc47-4496-aa81-79f6449e1c67" />
" alt="Dashboard" width="400"/></td>
<td><img src="https://via.placeholder.com/400x300?text=Health+Charts" alt="Health Charts" width="400"/></td>
</tr>
<tr>
<td align="center"><b>Dashboard Overview</b></td>
<td align="center"><b>Health Trends Visualization</b></td>
</tr>
<tr>
<td><img src="https://via.placeholder.com/400x300?text=AI+Chat" alt="AI Chat" width="400"/></td>
<td><img src="https://via.placeholder.com/400x300?text=Medicine+Checker" alt="Medicine Checker" width="400"/></td>
</tr>
<tr>
<td align="center"><b>AI Symptom Analysis</b></td>
<td align="center"><b>Medicine Interaction Checker</b></td>
</tr>
</table>
</div>
-->

## 🏗️ Architecture

```mermaid
flowchart TB
    subgraph Browser
        F1["Frontend<br/>React<br/>:3000<br/>Health Dashboard & Chat UI"]
    end

    subgraph Backend Stack
        B1["Backend<br/>FastAPI<br/>:8000"]
        R1["API Routers<br/>/api/auth, /api/health<br/>/api/chat, /api/appointments"]
        S1["Core Services<br/>Prediction, Gemini/Ollama LLM<br/>Medicine Checker"]
    end

    subgraph Data & AI
        SQLITE[(SQLite<br/>health.db)]
        LLM["Ollama (llama3) / Gemini<br/>Local :11434 / Cloud API"]
        ML["Scikit-Learn ML Models<br/>Health Trend Predictions"]
    end

    F1 -->|REST API (JSON)| B1
    B1 --> R1
    R1 --> S1
    S1 -->|SQLAlchemy (aiosqlite)| SQLITE
    S1 <-->|Prompt / Context| LLM
    S1 <-->|Data Analysis| ML
```

## 🛠️ Tech Stack

<div align="center">

### Backend
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=flat-square&logo=sqlite&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-CC2927?style=flat-square)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=flat-square&logo=sqlite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![D3.js](https://img.shields.io/badge/D3.js-F68E1E?style=flat-square&logo=d3.js&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)

### AI & ML
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=flat-square&logo=google&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=flat-square&logo=numpy&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=flat-square&logo=pandas&logoColor=white)

### DevOps
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white)

</div>

## 🚀 Installation

### Prerequisites

- Python 3.9 or higher
- Node.js 16 or higher
- PostgreSQL 14 or higher
- Git

### 🔧 Quick Setup

1. **Clone the repository**
```bash
git clone https://github.com/Raman-kr1/Health.git
cd Health
```

2. **Set up the backend**
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

3. **Set up the database**
```sql
CREATE DATABASE health_monitoring;
\c health_monitoring
CREATE EXTENSION IF NOT EXISTS timescaledb;
```

4. **Configure environment variables**
```bash
# Backend (.env)
cp .env.example .env
# Edit .env with your configurations
```

5. **Set up the frontend**
```bash
cd ../frontend
npm install
```

6. **Get API Keys**
   - Get Google Gemini API key: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
   - Add to backend `.env` file

### 🐳 Docker Setup (Alternative but Best)

```bash
docker-compose up --build
```

## 💻 Usage

### Starting the Application

**Backend:**
```bash
cd backend
uvicorn app.main:app --reload
# API will be available at http://localhost:8000
```

**Frontend:**
```bash
cd frontend
npm start
# App will be available at http://localhost:3000
```

### Default Ports
- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`

## 📚 API Documentation

The API documentation is automatically generated and available at `http://localhost:8000/docs` when the backend is running.

### Main Endpoints

| Endpoint | Method | Description |
|----------|---------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/token` | POST | Login user |
| `/api/health/health-data` | GET/POST | Manage health records |
| `/api/health/health-trends` | GET | Get health predictions |
| `/api/chat/symptoms` | POST | Analyze symptoms with AI |
| `/api/chat/medicine-check` | POST | Check medicine interactions |
| `/api/appointments` | GET/POST | Manage appointments |

## 🏗️ Project Structure

```
health-monitoring-system/
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── models/        # Database models
│   │   ├── routers/       # API endpoints
│   │   ├── services/      # Business logic
│   │   └── utils/         # Helper functions
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   └── App.js        # Main app component
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml     # Docker configuration
```

## 🔒 Security & Privacy

- **Authentication**: JWT-based secure authentication
- **Data Encryption**: All sensitive data is encrypted
- **HIPAA Considerations**: Designed with healthcare privacy in mind
- **API Security**: Rate limiting and input validation
- **No Data Sharing**: Your health data stays private

## ⚠️ Disclaimer

> **Important**: This application is for educational and informational purposes only. It is not intended to replace professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Wearable device integration
- [ ] Multi-language support
- [ ] Advanced ML models for predictions
- [ ] Telemedicine integration
- [ ] Family health tracking
- [ ] PDF report generation
- [ ] Data export functionality

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
## chat
ll plan items applied, plus an LLM fallback. Summary:

Backend

main.py — CORS from env (CORS_ORIGINS).
config.py — added cors_origins, ollama_base_url, ollama_model, pool settings.
database.py — pool_size=10, max_overflow=20, pool_pre_ping.
services/gemini_service.py — async (asyncio.to_thread), input sanitization/length cap, guardrail prompts, and Llama3 fallback via Ollama when Gemini is missing or errors.
routers/chat.py — pydantic body models, guest-safe (no id deref), tz-aware datetimes.
routers/appointments.py — switched to get_authenticated_user (was broken: dict used as object).
routers/health.py — tz-aware UTC everywhere, asyncio.Lock around guest dicts, limit/offset pagination.
models/health_data.py, appointment.py — indexes on user_id, composite (user_id, timestamp).
services/prediction_service.py — .ffill().
utils/security.py — tz-aware UTC.
Frontend

HealthChart.jsx — React.memo + useMemo for parsed series.
Dashboard.jsx — useCallback on handlers/loaders.
services/api.js — one-shot retry on network failure for GETs; fixed /appointments/ path.
New env knobs: CORS_ORIGINS, OLLAMA_BASE_URL, OLLAMA_MODEL (default llama3). Install deps unchanged (httpx already present). Run Ollama locally with ollama pull llama3 && ollama serve for fallback. AST check on all backend files passes.

## 👥 Team

<table>
<tr>
<td align="center">
<a href="https://github.com/Raman-kr1">
<img src="https://github.com/Raman-kr1.png" width="100px;" alt=""/>
<br />
<sub><b>Raman Kumar</b></sub>
</a>
<br />
<a href="https://github.com/Raman-kr1/Health/commits?author=Raman-kr1" title="Code">💻</a>
<a href="#design-Raman-kr1" title="Design">🎨</a>
<a href="#maintenance-Raman-kr1" title="Maintenance">🚧</a>
</td>
</tr>
</table>

##
