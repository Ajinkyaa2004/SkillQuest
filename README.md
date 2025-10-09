# IFA Hiring Platform

A comprehensive web-based hiring platform with gamified cognitive assessments built for the hackathon challenge.

## 🎯 Features

### Multi-Role Authentication System
- **Applicant**: Complete profile and take cognitive assessments
- **Admin**: View candidate data, leaderboard, and send communications
- **Employee**: (Out of scope for MVP)
- **Client**: (Out of scope for MVP)

### Comprehensive Applicant Profile
- Personal Information (Name, Email, Phone)
- Academic Information (College, CGPA)
- Career Intent (Location, Interested Roles)
- Resume Upload
- Telegram ID for communication

### Three Gamified Cognitive Assessments

#### 1. Minesweeper
- **Skill Tested**: Risk Assessment & Deductive Logic
- **Scoring**: Number of levels completed within 5 minutes
- **Mechanics**: Classic minesweeper with increasing difficulty

#### 2. Unblock Me (Sliding Block Puzzle)
- **Skill Tested**: Spatial Reasoning & Planning
- **Scoring**: Number of puzzles solved within 5 minutes
- **Mechanics**: Move blocks to free the red car to the exit

#### 3. Water Capacity (Liquid Transfer Puzzles)
- **Skill Tested**: Logical Sequencing & Optimization
- **Scoring**: Number of puzzles solved within 5 minutes
- **Mechanics**: Transfer water between jugs to achieve target amounts

### Assessment Rules & Integrity
- ⏱️ Each game runs for exactly **5 minutes**
- 🔒 **Sequential gating**: Games unlock after completing previous ones
- 🎮 **Trial mode**: Practice mode available after completing scored versions
- 🖥️ **Fullscreen enforcement**: Mandatory fullscreen during assessments
- 👁️ **Tab switching detection**: Maximum 2 warnings before disqualification
- 📊 **Real-time scoring**: Immediate feedback on performance

### Admin Dashboard
- 📊 **Overview Statistics**: Total applicants, completed assessments, average scores
- 👥 **Candidate Management**: View all applicant profiles with filtering and search
- 🏆 **Leaderboard**: Ranked list of candidates by total score
- 📧 **Communication Automation**: Send messages via Email, WhatsApp, and Telegram
- 📥 **Data Export**: Export candidate data and leaderboard to CSV

### Applicant Features
- 💬 **Integrated Chatbot**: FAQ assistant for assessment guidance
- 📈 **Progress Tracking**: View completion status and scores
- 🎯 **Results Page**: Comprehensive breakdown of performance

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd C:\Users\yash\CascadeProjects\ifa-hiring-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🎮 How to Use

### For Applicants

1. **Select Role**: Choose "Applicant" on the landing page
2. **Sign Up/Sign In**: Create an account or sign in
3. **Complete Profile**: Fill in all required information
4. **Take Assessments**: Complete three games sequentially
   - Each game is 5 minutes
   - Must be played in fullscreen
   - Trial mode available after completion
5. **View Results**: Check your scores and performance breakdown

### For Admins

1. **Select Role**: Choose "Admin" on the landing page
2. **Sign In**: Use demo credentials
   - Email: `admin@ifa.com`
   - Password: `admin123`
3. **Dashboard**: View statistics and manage candidates
4. **Leaderboard**: See ranked candidates
5. **Send Messages**: Select candidates and send communications

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **UI Components**: Custom shadcn/ui components
- **Routing**: React Router v6
- **Icons**: Lucide React

### State Management
- React Context API for authentication
- Local Storage for data persistence (MVP)

### Key Components
```
src/
├── components/
│   ├── auth/              # Authentication components
│   ├── applicant/         # Applicant-specific components
│   ├── admin/             # Admin dashboard components
│   ├── games/             # Three game implementations
│   ├── chatbot/           # FAQ chatbot
│   └── ui/                # Reusable UI components
├── contexts/              # React contexts
├── lib/                   # Utilities and storage
├── types/                 # TypeScript type definitions
└── App.tsx                # Main application with routing
```

## 🎯 Assessment Scoring

### Individual Game Scores
- **Minesweeper**: Puzzles completed (weighted 30%)
- **Unblock Me**: Puzzles completed (weighted 35%)
- **Water Capacity**: Puzzles completed (weighted 35%)

### Total Score Calculation
```
Total Score = (Minesweeper × 0.3) + (Unblock Me × 0.35) + (Water Capacity × 0.35)
```

## 🔒 Security Features

- JWT-based authentication (simulated for MVP)
- Role-based access control
- Fullscreen enforcement during assessments
- Tab switching detection and prevention
- Secure data storage

## 📱 Communication Channels

The platform simulates integration with:
- 📧 **Email**: Standard email notifications
- 💬 **WhatsApp**: Instant messaging
- ✈️ **Telegram**: Using Telegram ID from profile

## 🎨 UI/UX Highlights

- Modern gradient backgrounds
- Responsive design for all screen sizes
- Intuitive navigation
- Real-time feedback
- Smooth animations and transitions
- Accessible color schemes

## 🔧 Configuration

### Tailwind Configuration
Custom theme with shadcn/ui color variables in `tailwind.config.js`

### TypeScript Configuration
Strict mode enabled with path aliases in `tsconfig.json`

## 📦 Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` directory.

## 🧪 Testing

To test the application:

1. **Applicant Flow**:
   - Sign up as applicant
   - Complete profile
   - Take all three assessments
   - View results

2. **Admin Flow**:
   - Sign in as admin (admin@ifa.com / admin123)
   - View candidate data
   - Check leaderboard
   - Send test messages

## 🚀 Future Enhancements

- Backend API integration (Node.js/Express or Firebase)
- Real database (PostgreSQL/MongoDB)
- Actual email/WhatsApp/Telegram API integration
- Advanced analytics and reporting
- Video interview scheduling
- AI-powered candidate matching
- Mobile app version

## 📄 License

This project was created for the IFA Hiring Platform Hackathon.

## 👥 Support

For questions or issues, use the integrated chatbot or contact the development team.

---

**Built with ❤️ for the IFA Hiring Platform Hackathon**
# SkillQuest
