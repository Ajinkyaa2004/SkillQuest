# Perplexity Prompt for MongoDB Integration Help

## Copy-Paste This Prompt Into Perplexity:

---

I have a React + TypeScript project (SkillQuest) that currently uses localStorage for data persistence. I want to migrate it to MongoDB. Here are the files that need to be modified:

**Backend/Config Files:**
1. server.js (currently empty)
2. package.json (needs MongoDB packages added)

**Frontend Data Layer:**
3. src/lib/storage.ts (currently all localStorage operations)

**Frontend Context:**
4. src/contexts/AuthContext.tsx (uses storage functions for auth)

**Frontend Components (Applicant):**
5. src/components/applicant/ProfileForm.tsx (saves profile data)
6. src/components/applicant/AssessmentDashboard.tsx (saves game assessments)
7. src/components/applicant/Results.tsx

**Frontend Components (Admin):**
8. src/components/admin/AdminDashboard.tsx (displays user data)
9. src/components/admin/DashboardCharts.tsx
10. src/components/admin/CandidateInsights.tsx
11. src/components/admin/DashboardOverview.tsx
12. src/components/admin/Messaging.tsx

**Data Models:**
13. src/types/index.ts (contains User, ApplicantProfile, Assessment types)

**Current Data Structure:**
- Users: id, email, name, picture, googleId, role, createdAt
- ApplicantProfiles: userId, candidateId, name, email, phone, collegeName, cgpa, location, interestedRoles, resumeUrl, profileCompleted, createdAt
- Assessments: userId, candidateId, games (minesweeper, unblock-me, water-capacity), totalScore, completedAt, currentGame, trialMode

**Current Storage Functions in src/lib/storage.ts:**
- saveUser(), getUsers(), getUserByEmail(), getUserByGoogleId(), setCurrentUser(), getCurrentUser()
- saveProfile(), getProfiles(), getProfileByUserId()
- saveAssessment(), getAssessments(), getAssessmentByUserId()
- getLeaderboard()

**Questions for you:**

1. What are the steps I need to follow to set up MongoDB and create the necessary collections/models?
2. What Express.js backend code structure should I create in server.js to handle all CRUD operations for Users, ApplicantProfiles, and Assessments?
3. How should I refactor src/lib/storage.ts to replace localStorage calls with async API calls to the backend?
4. What changes are needed in src/contexts/AuthContext.tsx to handle async storage operations?
5. What best practices should I follow for error handling, loading states, and data validation during this migration?
6. What are potential issues I should watch out for and how can I ensure data integrity during the migration?

Please provide step-by-step guidance with code examples for the implementation.

---

## Instructions:

1. Go to https://www.perplexity.ai
2. Paste the entire prompt above into the search box
3. Click search
4. Wait for Perplexity to generate a comprehensive response
5. It will give you detailed implementation steps, code examples, and best practices

---

## After Getting Perplexity Response:

Once Perplexity provides the response, come back and share:
- The main points and recommendations
- Code examples for server.js setup
- Code examples for refactored storage.ts
- Any additional setup steps

Then I can help you implement these changes into your actual project files.
