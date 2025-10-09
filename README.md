🎮 SkillQuest – Gamified Hiring Platform
✨ Project Overview

SkillQuest is a gamified recruitment platform that evaluates candidates’ cognitive and functional skills interactively.
It provides a unified platform for Applicants, Admins, and Recruiters to assess talent beyond resumes.

🏆 Key Features

🔑 Multi-role Authentication: Applicant, Admin, Employee, Client

👤 Comprehensive Applicant Profiles

🎲 Gamified Assessments: Minesweeper 🧩, Unblock Me 🧠, Water Capacity 💧

⏱️ Timed Challenges: 5-minute sequential games with scoring

📊 Progress Tracking & Leaderboard

🛠️ Admin Dashboard & Communication Automation

🤖 Applicant Chatbot

🔒 Assessment Integrity: Fullscreen & tab-switch prevention

💻 Tech Stack
Layer	Technology
Frontend	React + TypeScript + Vite
Styling	TailwindCSS + shadcn/ui
State Management	React Context + Local Storage (MVP)
Authentication	JWT (simulated)
Database	Local Storage (MVP), upgradeable to Firebase/Supabase
Deployment	Vercel
📂 Project Structure
skillquest/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── auth/
│   │   ├── applicant/
│   │   ├── admin/
│   │   ├── games/
│   │   └── chatbot/
│   ├── contexts/
│   ├── lib/
│   ├── types/
│   └── App.tsx
├── package.json
└── README.md

🛠️ Phasewise Development Plan

Phase 1 – Ideation & Setup: 💡 Idea finalization, project setup, folder structure, roles

Phase 2 – Core Development: ⚙️ Multi-role auth, 3 cognitive games, 5-min timers & sequential unlocking

Phase 3 – Integration & UI: 🔗 Scoring, leaderboard, progress tracking, chatbot integration, UI polish

Phase 4 – Final Prep & Review: ✅ Debugging, full-screen/tab detection, documentation, demo ready

👥 Roles & Responsibilities
Team Member	Role	Responsibilities
Ajinkya Dhumal	Frontend & UI Lead	🎨 UI design, state management, integration, project structure
Yash [Surname]	Game Logic & Backend	🕹️ Game development, timers & scoring, auth flow, data storage, debugging
🧩 Code & Debugging

📁 Folder Structure: Feature-based (auth, games, admin, chatbot, contexts, lib)

🔄 Version Control: GitHub with feature-branch workflow

🐞 Debugging: Console logs, React DevTools, ESLint, TypeScript strict mode

✅ Testing: Manual testing of games, timers, UI, authentication

🚀 Build & Deploy: Vite dev server, deployed on Vercel
