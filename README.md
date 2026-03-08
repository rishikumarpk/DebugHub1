<div align="center">
  <br />
  <h1>🐛 DebugHub (A Hackathon Project)</h1>
  <p>
    <strong>A gamified, AI-powered platform for software engineers to hone their debugging skills.</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  </p>
</div>

<br />

## ✨ Features

- 🎯 **Daily Bug Challenge**: A curated, real-world bug presented every day to test your problem-solving skills and build your streak.
- ♾️ **Infinite Practice Mode**: Dynamically generate tailored challenges using Google's cutting-edge Gemini 2.5 AI. Select your preferred language (JavaScript, Python, C++, Java), difficulty, and bug type (Logic, Syntax, Performance, etc.).
- 🧠 **AI vs. Human Split-Path Diagnostics**: After solving a bug, compare your exact diagnostic path (your reasoning) side-by-side with an Expert's path and an AI Agent's path.
- 💻 **Immersive IDE Experience**: Built-in, fully customized Monaco Editor with syntax highlighting, auto-completion, and a beautiful dark-mode aesthetic.
- 🏆 **Gamification & Streaks**: Track your progress, maintain daily streaks, and share beautifully designed "Bug Fixed" cards to your network.
- 🔐 **Authentication & Security**: Secure Google OAuth and JWT-based session management.
- 💳 **Pro Tiers**: Integrated Razorpay payment gateways for premium debugging features and analytics.

<br />

##  معم Architecture & Tech Stack

**Frontend (Client)**
- React 18, Vite
- TypeScript
- Monaco Editor (for robust code editing)
- Vanilla CSS (Glassmorphism & premium UI design)
- Zustand (State management)

**Backend (Server)**
- Node.js, Express
- TypeScript
- Prisma ORM
- PostgreSQL (Database)
- Generative AI SDK (Google Gemini 2.5 Flash for dynamic problem generation)
- Passport.js (Google OAuth2)
- Razorpay (Payments)

<br />

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running
- Google Cloud Console Project (for OAuth)
- Google AI Studio API Key (for Gemini 2.5)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/DebugHub.git
cd DebugHub
```

### 2. Setup the Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/debughub"
FRONTEND_URL="http://localhost:5173"

# Google Auth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_CALLBACK_URL="http://localhost:3001/auth/google/callback"
JWT_SECRET="your_ultra_secure_jwt_secret"

# Email Services (For Recruiter Contact forms)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# AI Integration
GEMINI_API_KEY="your_google_ai_studio_api_key"
```

Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

Start the backend development server:
```bash
npm run dev
```

### 3. Setup the Frontend
Open a new terminal window.
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL="http://localhost:3001"
VITE_RAZORPAY_KEY="your_razorpay_key_id"
VITE_APP_URL="http://localhost:5173"
VITE_SALES_EMAIL="sales@debughub.com"
```

Start the frontend development server:
```bash
npm run dev
```

<br />

## 🤖 AI Integration Details

DebugHub uniquely leverages the **Google Generative AI SDK (Gemini 2.5 Flash)** to create an infinite loop of training material:
1. **Dynamic Generation**: The backend prompts Gemini with specific constraints (Language, Difficulty, Pattern) to generate raw, buggy code and expected outputs in strict JSON format.
2. **Path Analysis**: When evaluating "Diagnostic Paths," the AI generates a step-by-step reasoning tree matching the specific context of the bug, allowing users to benchmark their thought process against an LLM.
3. **Self-Healing Fallbacks**: The system performs deep model discovery and endpoint alignment (using `v1beta` APIs) to ensure continuous operation across various API key restrictions.

<br />

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
