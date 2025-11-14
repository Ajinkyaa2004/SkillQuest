# Setup Instructions for IFA Hiring Platform

## Quick Start Guide

Follow these steps to get the application running on your machine.

### Step 1: Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will install all required packages including:
- React & React DOM
- React Router
- TypeScript
- Vite
- TailwindCSS
- Lucide React (icons)
- And other dependencies

### Step 2: Start Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5173`

### Step 3: Access the Application

Open your browser and navigate to `http://localhost:5173`

## Testing the Application

### Test as Applicant

1. Click on "Applicant" role
2. Sign up with any email (e.g., `test@example.com`, password: `password123`)
3. Complete the profile form with all required fields
4. Take the three assessments:
   - **Minesweeper**: Left-click to reveal, right-click to flag
   - **Unblock Me**: Click block, use arrows to move
   - **Water Capacity**: Fill, empty, and pour water between jugs
5. View your results after completing all games

### Test as Admin

1. Click on "Admin" role
2. Sign in with demo credentials:
   - Email: `admin@ifa.com`
   - Password: `admin123`
3. Explore the dashboard:
   - View overview statistics
   - Check candidate list
   - View leaderboard
   - Send messages to candidates

## Key Features to Test

### Applicant Features
- ✅ Profile completion with validation
- ✅ Sequential game unlocking
- ✅ 5-minute timed assessments
- ✅ Fullscreen enforcement
- ✅ Tab switching detection
- ✅ Trial/practice mode
- ✅ Results page with detailed scores
- ✅ Integrated chatbot (click the blue button in bottom-right)

### Admin Features
- ✅ Dashboard with statistics
- ✅ Candidate data table with search
- ✅ Leaderboard with rankings
- ✅ Multi-channel messaging (Email, WhatsApp, Telegram)
- ✅ Data export to CSV
- ✅ Candidate selection and bulk actions

## Troubleshooting

### Port Already in Use
If port 5173 is already in use, Vite will automatically try the next available port.

### Dependencies Not Installing
Try clearing npm cache:
```bash
npm cache clean --force
npm install
```

### TypeScript Errors
Make sure all dependencies are installed. Run:
```bash
npm install
```

### Build Errors
If you encounter build errors, try:
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

## Project Structure

```
ifa-hiring-platform/
├── src/
│   ├── components/
│   │   ├── auth/              # Authentication pages
│   │   ├── applicant/         # Applicant dashboard & forms
│   │   ├── admin/             # Admin dashboard
│   │   ├── games/             # Three game implementations
│   │   ├── chatbot/           # FAQ chatbot
│   │   └── ui/                # Reusable UI components
│   ├── contexts/              # React Context (Auth)
│   ├── lib/                   # Utilities & storage functions
│   ├── types/                 # TypeScript type definitions
│   ├── App.tsx                # Main app with routing
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── public/                    # Static assets
├── index.html                 # HTML template
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite config
├── tailwind.config.js         # Tailwind config
└── README.md                  # Documentation
```

## Data Storage

The MVP uses **Local Storage** for data persistence:
- User accounts
- Applicant profiles
- Assessment scores
- Messages

Data persists across browser sessions but is specific to each browser.

## Building for Production

To create a production build:

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

To preview the production build:

```bash
npm run preview
```

## Next Steps

After testing the MVP, consider:
1. Adding a backend API (Node.js/Express or Firebase)
2. Implementing real database (PostgreSQL/MongoDB)
3. Integrating actual email/SMS/Telegram APIs
4. Adding more game levels and difficulty variations
5. Implementing advanced analytics
6. Adding video interview features

## Support

For issues or questions:
- Check the integrated chatbot (for applicants)
- Review the README.md file
- Check console for error messages

---

**Happy Testing! 🚀**
