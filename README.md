# 📬 MailMate — AI-Powered Gmail Organizer & Reader

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/Vite-React-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-Backend-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/Google-Gemini_AI-4285F4?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

MailMate is a premium, production-quality SaaS web application that lets users sync, read, categorize, search, and analyze their Gmail inbox in a sleek, Notion+Linear-style dark glassmorphism dashboard.

MailMate utilizes the **Gmail API** to sync messages, **Mongoose** to persist headers and content, and **Google Gemini AI** to automatically classify emails and generate action-oriented 2-sentence summaries.

---

## ⚡ Quick Evaluation: Demo Mode (Default)

No configuration required! If you launch the application without setting up database strings or API tokens, MailMate **automatically activates Demo Mode**:
- **One-Click Persona Login**: Choose from pre-loaded **Demo Personas** (Student or Recruiter) on the Login page.
- **Mock Data Engine**: Seeds a rich, interactive database containing **60+ realistic mock emails** from LinkedIn, GeeksforGeeks, Internshala, Unstop, Infosys, and others.
- **Fully Interactive**: Instantly search (e.g. "internship"), test filter tags (Starred, Category tabs), generate AI summaries, download mock attachments, and inspect graphs on the Analytics dashboard.

---

## ✨ Features

- **Real-Time Gmail Synchronization**: Seamless integration with OAuth 2.0 to safely read messages from a real Gmail account.
- **Gemini-Powered Smart Summaries**: Generates 2-sentence action-oriented summaries for complex emails.
- **Automated Categorization**: Sorts incoming emails into categories such as Updates, Promotions, Social, and Forums.
- **Notion+Linear Dark Glassmorphism UI**: Beautiful, fully responsive layout built with glass-panels, custom scrollbars, and smooth micro-animations.
- **Detailed Analytics Dashboard**: Visual charts for category distribution, sender volume, and email trends over time (powered by Recharts).
- **Dual-Database Mode**: Automatically runs with an In-Memory Database fallback if no MongoDB URL is provided.

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (Functional components with hooks)
- **Vite** (Next-generation frontend tooling)
- **Tailwind CSS** (Utility-first styling with dark glassmorphism configuration)
- **Recharts** (Interactive data visualization graphs)
- **Lucide React** (Consistent modern iconography)

### Backend
- **Node.js** & **Express.js** (REST API)
- **Passport.js** (Google OAuth 2.0 strategy)
- **JSON Web Tokens (JWT)** (Session security authorization)
- **Mongoose** (MongoDB object modeling)
- **Google Gen AI SDK** (Gemini API integration)

---

## 🔒 Production Setup: Google & MongoDB Integration

To connect MailMate to your real Gmail account, follow this step-by-step guide:

### 1. Set Up Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named **MailMate**.
3. In the sidebar, navigate to **APIs & Services** > **Library**. Search for **Gmail API** and click **Enable**.
4. Go to **OAuth consent screen**:
   - Choose **External** user type and click Create.
   - Enter your App name (e.g., MailMate) and developer email.
   - In the **Scopes** step, click **Add or Remove Scopes** and search for `https://www.googleapis.com/auth/gmail.readonly`. Select it and click Save.
   - In the **Test Users** step, add the Gmail address you wish to sync. (Critical, since the app is in OAuth Testing mode).
5. Go to **Credentials**:
   - Click **Create Credentials** > **OAuth client ID**.
   - Choose **Web Application** as application type.
   - Under **Authorized redirect URIs**, add exactly: `http://localhost:5000/api/auth/google/callback`
   - Click Create and copy the generated **Client ID** and **Client Secret**.

### 2. Configure Environment Variables
Create a file named `.env` inside the `backend/` directory (or edit the created `backend/.env` file) and paste:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=mailmate_choose_a_long_secret_key_string

# MongoDB Database URI (If omitted, uses In-Memory Mock Database fallback)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/mailmate

# Google OAuth 2.0 Client credentials
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Google Gemini API key (Optional: Enables real-time AI email summaries)
GEMINI_API_KEY=your_gemini_api_key_from_google_aistudio
```

---

## 🚀 Installation & Launch

Follow these terminal commands from the **root directory** of the project:

### Step 1: Install Dependencies
Run the utility installer script from the root of the workspace. This automatically installs all packages for the workspace, backend, and frontend concurrently:
```bash
npm run install:all
```

### Step 2: Run Development Servers
Start both the Express API backend (Port 5000) and the Vite React frontend (Port 5173) concurrently:
```bash
npm run dev
```

### Step 3: Open in Web Browser
Open your browser and navigate to:
```url
http://localhost:5173/
```

---

## 📷 Screenshots

*Note: Screenshots represent the premium Notion/Linear-inspired interface styling.*

### 1. Persona & Google Login
![MailMate Login](https://raw.githubusercontent.com/Codex-39/MailMate/main/screenshots/login.png)
*Beautiful login page showing interactive persona cards and secure Google authentication buttons.*

### 2. Email Inbox Dashboard
![MailMate Dashboard](https://raw.githubusercontent.com/Codex-39/MailMate/main/screenshots/dashboard.png)
*Glassmorphism mail reader UI with full-text search, action labels, AI summary badges, and category tabs.*

### 3. Analytics & Insights
![MailMate Analytics](https://raw.githubusercontent.com/Codex-39/MailMate/main/screenshots/analytics.png)
*Recharts-powered breakdown charts showing incoming email volume, priority alerts, and sender categorization.*

---

## 📁 Technical Folder Structure

```
MailMate/
├── package.json                   # Root orchestrator script
├── README.md                      # Guides & setups (This file)
├── backend/
│   ├── .env                       # Active backend environment configurations (IGNORED)
│   ├── server.js                  # Express setup
│   ├── config/
│   │   ├── db.js                  # Database helper (MongoDB + In-Memory Fallback)
│   │   └── passport.js            # Google OAuth Strategy config
│   ├── models/
│   │   ├── User.js                # User profile Schema
│   │   └── Email.js               # Email schema & data models
│   ├── routes/
│   │   ├── auth.routes.js         # OAuth callback & Demo login controllers
│   │   ├── email.routes.js        # Sync, filter, search & summary API routes
│   │   └── analytics.routes.js    # Statistics aggregating dashboard counters
│   ├── services/
│   │   ├── gmail.service.js       # Gmail REST integration & mock seeder engine
│   │   └── ai.service.js          # Google Gemini AI client & fallback heuristics
│   └── middleware/
│       └── auth.middleware.js     # JWT validation middleware
└── frontend/
    ├── vite.config.js             # Vite React builder rules
    ├── tailwind.config.js         # Styled palettes & glassmorphism theme rules
    ├── index.html                 # Bootloader template with Google Web Fonts
    └── src/
        ├── main.jsx               # Render React engine
        ├── index.css              # Custom styling, scrollbars, grids, neon highlights
        ├── App.jsx                # Protected routes & login-success redirects
        ├── utils/
        │   └── api.js             # Axios central client with JWT interceptors
        ├── context/
        │   ├── AuthContext.jsx    # Session state & Google OAuth redirects
        │   └── EmailContext.jsx   # Shared emails, active folders, search & sync state
        ├── components/
        │   ├── Layout.jsx         # Responsive sidebar & header skeleton
        │   ├── Sidebar.jsx        # Smart categories list, filters & sync triggers
        │   ├── Header.jsx         # Global search & interactive notifications dropdown
        │   ├── DashboardStats.jsx # Metric counter panels
        │   ├── SenderCards.jsx    # Interactive filterable sender grids
        │   ├── EmailList.jsx      # Email thread listings
        │   ├── EmailReader.jsx    # Message viewing pane & attachment downloads
        │   └── AISummaryCard.jsx  # Reusable summary card with structured action plans
        └── pages/
            ├── Login.jsx          # Selection interface for personas & OAuth
            ├── Dashboard.jsx      # Adaptive multisection dashboard view
            └── Analytics.jsx      # Recharts volume graphs & category pie charts
```

---

## 🔮 Future Improvements

- **Interactive AI Draft Reply**: Select an email and let Gemini AI draft a reply directly in the UI.
- **Webhook Subscriptions**: Implement push notifications via Gmail Webhooks (Google Pub/Sub) to auto-sync emails instead of manual poll.
- **Custom Smart Tags**: Allow users to train custom classification tags based on keywords or sender domains.
- **Attachments Cloud Sync**: Directly export email attachments to Google Drive or Dropbox.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*MailMate - Built with ❤️ for productive developers and professionals.*
