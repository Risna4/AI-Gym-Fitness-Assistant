# AI Gym & Fitness Assistant

An AI-powered fitness management platform that combines workout assistance, performance tracking, habit monitoring, nutrition guidance, gym planning, conversational assistance, and simulated smart gym features into a unified web application.

## Project Overview

The **AI Gym & Fitness Assistant** is designed as a unified digital fitness platform that supports users throughout their fitness journey.

The system combines:

* AI-based exercise posture analysis
* Workout and performance tracking
* Habit and consistency monitoring
* Nutrition guidance
* Conversational fitness assistance
* Gym discovery and planning
* Simulated smart gym monitoring
* Role-based admin access

The application follows a client-server architecture with a React frontend, FastAPI backend, PostgreSQL database, and AI/computer-vision components.

## Objectives

* Provide a centralized fitness management platform.
* Analyze exercise posture and count repetitions using computer vision.
* Store and track workout activity and history.
* Monitor workout consistency and habit streaks.
* Provide general nutrition and fitness guidance.
* Provide conversational fitness assistance.
* Help users discover nearby gyms and fitness programs.
* Demonstrate smart gym functionality through simulated IoT features.
* Provide an admin dashboard for privileged users.

## Key Features

### 1. AI Gym Trainer

* Real-time camera-based pose detection
* Exercise posture analysis
* Squat repetition counting
* Form feedback
* Workout session controls
* Workout data saving

### 2. Workout Management

* Manual workout logging
* Exercise name
* Sets and repetitions
* Workout duration
* Calories burned
* Workout history

### 3. Performance Analyzer

* Workout activity statistics
* Performance metrics
* Performance score
* Workout progress information

### 4. AI Fitness Habit Tracker

* Workout consistency tracking
* Active workout days
* Habit streaks
* Activity-based recommendations

### 5. AI Dietician

* General nutrition guidance
* Diet-related recommendations
* Fitness-profile-based assistance
* Conversational nutrition support

### 6. Virtual Gym Buddy

* Conversational fitness assistance
* Motivation and workout guidance
* Fitness-related questions and responses

### 7. Gym Recommender & Planner

* Search for gyms by location
* Nearby gym discovery
* Workout program suggestions
* Fitness challenge suggestions
* OpenStreetMap-based location search

### 8. Smart Gym Assistant

The Smart Gym module demonstrates IoT-based gym functionality through a simulated environment.

It includes:

* Simulated connected equipment
* Equipment status
* Workout session timer
* Start/stop session controls
* Recovery and intensity recommendations

> **Note:** Physical IoT sensors and gym equipment are not connected in the current implementation. IoT functionality is simulated for demonstration purposes.

### 9. Admin Dashboard

* Admin-only access
* User administration
* Privileged system controls
* Role-based access using the `is_admin` attribute

Normal users do not have access to the Admin module.

## Technologies Used

| Layer                | Technologies                                   |
| -------------------- | ---------------------------------------------- |
| Frontend             | React, Vite, React Router DOM, JavaScript, CSS |
| Backend              | Python, FastAPI, Uvicorn, Pydantic             |
| Authentication       | JWT, Passlib, Bcrypt                           |
| Database             | PostgreSQL, SQLAlchemy, Psycopg2               |
| AI / Computer Vision | MediaPipe, OpenCV, NumPy                       |
| Conversational AI    | Ollama / LLM                                   |
| External Services    | OpenStreetMap Nominatim, Overpass API          |
| Development          | VS Code, Git, GitHub                           |

## Project Structure

```text
AI-Gym-Fitness-Assistant/
│
├── backend/
│   ├── main.py
│   ├── security.py
│   ├── dependencies.py
│   │
│   ├── database/
│   │   └── connection.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   └── workout.py
│   │
│   ├── schemas/
│   │   └── user.py
│   │
│   └── routes/
│       ├── auth.py
│       ├── workouts.py
│       ├── performance.py
│       ├── habit.py
│       ├── diet.py
│       ├── buddy.py
│       ├── planner.py
│       ├── smart_gym.py
│       └── admin.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── TrainerPage.jsx
│   │   │   ├── WorkoutsPage.jsx
│   │   │   ├── PerformancePage.jsx
│   │   │   ├── HabitPage.jsx
│   │   │   ├── DieticianPage.jsx
│   │   │   ├── BuddyPage.jsx
│   │   │   ├── PlannerPage.jsx
│   │   │   ├── SmartGymPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── AdminPage.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   │
│   ├── package.json
│   └── package-lock.json
│
├── requirements.txt
├── .gitignore
└── README.md
```

## System Architecture

```text
                    USER
                      │
                      ▼
              React Frontend
                  + Vite
                      │
                 REST API
                  + JWT
                      │
                      ▼
               FastAPI Backend
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   MediaPipe      PostgreSQL    External APIs
   + OpenCV       + SQLAlchemy  OpenStreetMap
        │                           │
        ▼                           ▼
  Pose Analysis              Gym Discovery
```

## Authentication and Security

The application uses JWT-based authentication.

```text
Register
   ↓
Password Hashing
   ↓
PostgreSQL
   ↓
Login
   ↓
JWT Token
   ↓
Protected API Requests
```

Administrator access is controlled using the `is_admin` user attribute.

* `is_admin = true` → Admin access
* `is_admin = false` → Normal user access

Sensitive configuration such as database credentials and secret keys is stored in `.env` and should not be committed to GitHub.

## Database

The application uses **PostgreSQL** with **SQLAlchemy ORM**.

The main user data includes:

* User ID
* Name
* Email
* Hashed password
* Age
* Weight
* Height
* Fitness goal
* Admin status

Workout data includes:

* Exercise name
* Sets
* Repetitions
* Duration
* Calories burned
* Workout date
* User ID

## API Modules

| Module           | Purpose                                        |
| ---------------- | ---------------------------------------------- |
| `auth.py`        | Registration, login and profile authentication |
| `workouts.py`    | Add and retrieve workouts                      |
| `performance.py` | Performance statistics and metrics             |
| `habit.py`       | Workout consistency and habit tracking         |
| `diet.py`        | Nutrition assistance                           |
| `buddy.py`       | Conversational fitness assistance              |
| `planner.py`     | Gym discovery and planning                     |
| `smart_gym.py`   | Simulated smart gym functionality              |
| `admin.py`       | Administrator functionality                    |

## Installation

### Prerequisites

* Python 3.10+
* Node.js 20+
* npm
* PostgreSQL
* Ollama for local conversational AI features

### Backend Setup

```bash
cd backend
python -m venv venv
```

Activate the virtual environment.

**Windows:**

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r ../requirements.txt
```

Create a `.env` file inside the `backend` folder:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
SECRET_KEY=your_secret_key
ALGORITHM=HS256
```

### Frontend Setup

```bash
cd frontend
npm install
```

## Running the Project

### Start Backend

```bash
cd backend
python -m fastapi dev main.py
```

The backend will run at:

```text
https://ai-gym-fitness-assistant-ajkp.onrender.com
```

### Start Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173
```

## Ollama Setup

The conversational AI features use Ollama with a locally available language model.

Example:

```bash
ollama list
```

Make sure the required model is available before using the AI Dietician and Virtual Gym Buddy features.

## How to Use

1. Register a new account or log in.
2. Open the Dashboard.
3. Use the AI Trainer for exercise detection and repetition counting.
4. Save completed workouts.
5. View workout history and performance information.
6. Check habit consistency and streaks.
7. Use the AI Dietician for general nutrition guidance.
8. Use the Virtual Gym Buddy for conversational fitness assistance.
9. Search for gyms using the Gym Planner.
10. Use Smart Gym to demonstrate simulated equipment monitoring.
11. Administrators can access the Admin dashboard.

## AI and Computer Vision

### MediaPipe Pose

MediaPipe Pose is used to detect body landmarks from the camera feed.

The detected landmarks are used for:

* Joint-angle analysis
* Exercise posture analysis
* Repetition counting
* Form feedback

### OpenCV

OpenCV supports camera and video processing for the computer-vision component.

### Conversational AI

The AI Dietician and Virtual Gym Buddy use a local LLM through Ollama to provide conversational responses.

## External Services

### OpenStreetMap

The Gym Planner uses:

* **Nominatim** for geocoding
* **Overpass API** for retrieving nearby gym-related locations

Search results depend on the availability and completeness of OpenStreetMap data.

## Testing

The project was tested across the major application components, including:

* User registration and login
* JWT authentication
* Protected API routes
* Admin access control
* Workout logging
* AI Trainer pose detection
* Repetition counting
* Performance information
* Habit tracking
* AI Dietician
* Virtual Gym Buddy
* Gym Planner
* Smart Gym simulation

## Limitations

* Smart Gym functionality currently uses simulated IoT data instead of physical hardware.
* Pose detection accuracy can depend on camera quality, lighting, camera position, and visibility.
* Gym search results depend on OpenStreetMap data and external API availability.
* Conversational AI features require the configured AI service to be available.

## Future Enhancements

* Integration with physical IoT gym equipment using MQTT.
* More exercise types and advanced pose analysis.
* Automated nutrition tracking.
* More advanced behavioral prediction.
* Cloud deployment and scalable infrastructure.
* Mobile application support.
* Advanced analytics and personalized progress reports.

## Deployment

The project is designed as a web-based application with a React frontend and FastAPI backend.

For final deployment, the frontend, backend, database, AI services, authentication, admin dashboard, and analytics components can be hosted using suitable cloud infrastructure.

> The current development environment uses local PostgreSQL and Ollama services. Smart Gym IoT functionality is simulated for demonstration.
Deployment

The AI Gym & Fitness Assistant was deployed using Render. The frontend, backend API, and database were configured as separate services.

Live Application

Frontend:
https://ai-gym-fitness-assistant-1-anzv.onrender.com

Backend API

FastAPI Backend:
https://ai-gym-fitness-assistant-ajkp.onrender.com

API Documentation

Swagger API Documentation:
https://ai-gym-fitness-assistant-ajkp.onrender.com/docs

Source Code

GitHub Repository:
https://github.com/Risna4/AI-Gym-Fitness-Assistant

Deployment Status

The main application, including authentication, dashboard, workout management, performance tracking, habit tracking, AI Trainer, gym planning, Smart Gym simulation, Admin Dashboard, and analytics, is deployed and accessible through the live application.

The AI Dietician and Virtual Gym Buddy currently use Ollama for local LLM execution. Since a hosted LLM service has not been configured for the Render deployment, these two conversational features are currently demonstrated in the local development environment.

This approach keeps the main application deployed without requiring an additional paid LLM service.

## Conclusion

The AI Gym & Fitness Assistant provides a unified platform for workout assistance, fitness tracking, habit monitoring, nutrition guidance, gym discovery, conversational support, and simulated smart gym functionality.

The modular architecture allows additional AI models, IoT devices, analytics features, and cloud services to be integrated in future versions.
