# MongoDB Migration Guide - SkillQuest Project

## Overview
This document lists all files that need to be changed to migrate from localStorage to MongoDB storage.

---

## Files to Change

### 1. **Backend Setup Files**

#### `server.js` (Currently empty - needs complete implementation)
- Set up Express server with MongoDB connection
- Create API endpoints for all CRUD operations
- Implement authentication middleware
- Create database schemas/models

#### `package.json` (Update dependencies)
- Add `mongoose` for MongoDB ODM
- Add `mongodb` driver
- Add `express` middleware for body parsing
- Ensure `cors` is configured

---

### 2. **Storage Layer (Data Access)**

#### `src/lib/storage.ts` (MAJOR REFACTOR)
- Convert from localStorage to API calls
- Replace all synchronous operations with async API calls
- Functions to convert:
  - `saveUser()` → POST/PUT to `/api/users`
  - `getUsers()` → GET from `/api/users`
  - `getUserByEmail()` → GET from `/api/users/email/:email`
  - `getUserByGoogleId()` → GET from `/api/users/google/:googleId`
  - `setCurrentUser()` → Store in session/memory (client-side only)
  - `getCurrentUser()` → Retrieve from session/memory
  - `saveProfile()` → POST/PUT to `/api/profiles`
  - `getProfiles()` → GET from `/api/profiles`
  - `getProfileByUserId()` → GET from `/api/profiles/:userId`
  - `saveAssessment()` → POST/PUT to `/api/assessments`
  - `getAssessments()` → GET from `/api/assessments`
  - `getAssessmentByUserId()` → GET from `/api/assessments/:userId`
  - `getLeaderboard()` → GET from `/api/leaderboard`

---

### 3. **Authentication Context**

#### `src/contexts/AuthContext.tsx` (Update to async operations)
- Update `loginWithGoogle()` to make API call to save user
- Update `getCurrentUser()` call to use new async storage layer
- Handle loading states during API calls
- Add error handling for network requests

---

### 4. **Applicant Components**

#### `src/components/applicant/ProfileForm.tsx` (Update to async)
- Convert `saveProfile()` call to async API call
- Handle loading and error states during save
- Add retry logic for failed saves
- Update validation to work with async operations

#### `src/components/applicant/AssessmentDashboard.tsx` (Update to async)
- Convert `getProfileByUserId()` to async API call
- Convert `getAssessmentByUserId()` to async API call
- Convert `saveAssessment()` to async API call
- Add loading states during data fetching and saving

#### `src/components/applicant/Results.tsx` (If it uses storage)
- Check and update any storage operations

---

### 5. **Admin Components**

#### `src/components/admin/AdminDashboard.tsx` (Update to async)
- Convert `getProfiles()` to async API call
- Convert `getAssessments()` to async API call
- Convert `getLeaderboard()` to async API call
- Update `loadData()` to handle async operations with loading states
- Add error handling for API failures

#### `src/components/admin/DashboardCharts.tsx` (If it uses storage)
- Check and update any storage operations

#### `src/components/admin/CandidateInsights.tsx` (If it uses storage)
- Check and update any storage operations

#### `src/components/admin/DashboardOverview.tsx` (If it uses storage)
- Check and update any storage operations

#### `src/components/admin/Messaging.tsx` (If it uses storage)
- Check and update any storage operations

---

### 6. **Type Definitions**

#### `src/types/index.ts` (Add new types if needed)
- May need to add MongoDB-specific fields (e.g., `_id`)
- Add API response types
- Add error types for API calls

---

## Backend Structure to Create

### MongoDB Collections/Models:
1. **Users** - Store user accounts
   - Fields: id, email, name, picture, googleId, role, createdAt

2. **ApplicantProfiles** - Store candidate profiles
   - Fields: userId, candidateId, name, email, phone, collegeName, cgpa, location, etc.

3. **Assessments** - Store game assessment results
   - Fields: userId, candidateId, games, totalScore, completedAt, etc.

### API Endpoints to Create:
```
Users:
- POST   /api/users
- GET    /api/users
- GET    /api/users/:id
- GET    /api/users/email/:email
- GET    /api/users/google/:googleId
- PUT    /api/users/:id

Profiles:
- POST   /api/profiles
- GET    /api/profiles
- GET    /api/profiles/:userId
- PUT    /api/profiles/:userId
- DELETE /api/profiles/:userId

Assessments:
- POST   /api/assessments
- GET    /api/assessments
- GET    /api/assessments/:userId
- PUT    /api/assessments/:userId
- DELETE /api/assessments/:userId

Leaderboard:
- GET    /api/leaderboard
```

---

## Migration Strategy

1. **Phase 1**: Set up MongoDB database and schemas
2. **Phase 2**: Create Express backend with API endpoints
3. **Phase 3**: Update `storage.ts` to call APIs instead of localStorage
4. **Phase 4**: Update all components to handle async operations
5. **Phase 5**: Test thoroughly
6. **Phase 6**: Remove localStorage fallback code

---

## Summary Table

| File Category | Files to Change | Priority |
|--------------|-----------------|----------|
| Backend | server.js, package.json | 🔴 Critical |
| Storage Layer | src/lib/storage.ts | 🔴 Critical |
| Auth | src/contexts/AuthContext.tsx | 🔴 Critical |
| Applicant UI | ProfileForm.tsx, AssessmentDashboard.tsx, Results.tsx | 🟠 High |
| Admin UI | AdminDashboard.tsx, DashboardCharts.tsx, CandidateInsights.tsx, DashboardOverview.tsx, Messaging.tsx | 🟠 High |
| Types | src/types/index.ts | 🟡 Medium |

---

## Total Files to Modify: ~12-15 files

**Priority Order:**
1. server.js (backend setup)
2. package.json (dependencies)
3. src/lib/storage.ts (API integration)
4. src/contexts/AuthContext.tsx (async auth)
5. All components (UI updates for async)
