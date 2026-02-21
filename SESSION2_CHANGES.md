# Asset Management System - Setup and Testing Guide

## Recent Changes (Session 2)

### 1. Removed Lab Location from User Signup ✅
- **Lab Assistant**: No longer required to enter lab location during signup
- **Lab Technician**: No longer required to enter lab location during signup
- Backend User model: `lab` field is now optional (default: '')

### 2. Skills Management Enhancement ✅
- **Signup**: Removed skills from technician signup form
- **After Login**: Technicians can now add/manage skills from Profile section
- Created new `TechnicianProfile` component
- New API endpoint: `PATCH /api/auth/update-skills` for updating skills

### 3. Fixed Authentication Routing Error ✅
- Fixed auth middleware export to work properly with Express routes
- Updated `middleware/auth.js` to export `verifyToken` as default function

## Architecture Changes

### New Component: TechnicianProfile
**Location**: `frontend/src/components/TechnicianProfile.js`
**Path**: `/profile` (accessible only to lab_technician role)
**Features**:
- View technician information (name, email - read-only)
- Select and manage skills via checkboxes
- Real-time skill selection with visual feedback
- Progress display showing selected skills count
- Submit button to save skills to backend

### New Endpoint
**POST /api/auth/update-skills**
- Requires: Authentication token
- Body: `{ skills: [array of skill values] }`
- Returns: Updated user with new skills

## Backend Changes

### Modified Files

1. **middleware/auth.js**
   - Changed export structure to support both default and named exports
   - Ensures `verifyToken` works as middleware function directly

2. **controllers/authController.js**
   - Updated `signup` method: Removed lab and skills validation
   - Added `updateTechnicianSkills` method for profile updates
   - Removed lab from user response

3. **models/User.js**
   - Changed `lab` field from required to optional (default: '')
   - Skills remain as array (initialized as empty: [])

4. **routes/authRoutes.js**
   - Added new route: `PATCH /api/auth/update-skills`

## Frontend Changes

### Modified Components

1. **Signup.js**
   - Removed `lab` input field from form
   - Removed `skills` checkbox section from form
   - Removed skill change handlers
   - Updated validation to not require lab or skills
   - Cleaner component state management

2. **Login.js**
   - No changes to login flow
   - Same role-based routing behavior

3. **App.js**
   - Imported `TechnicianProfile` component
   - Added new route: `/profile`
   - Added "Profile" link in navbar for technicians only
   - Profile link only shows for `lab_technician` role

## User Workflows

### Lab Assistant Workflow
1. **Signup**: FirstName, LastName, Email, Password, ConfirmPassword
2. **Login**: Select "Lab Assistant" → dashboard access
3. **Operations**: Create assets, issues, manage maintenance

### Lab Technician Workflow
1. **Signup**: FirstName, LastName, Email, Password, ConfirmPassword
2. **Login**: Select "Lab Technician" → dashboard access
3. **Profile Setup**: Click "Profile" → Select skills → Save
4. **Operations**: View assigned issues, manage tasks based on skills

## Database Schema Updates

### User Model
```javascript
{
  name: String,
  firstName: String,
  lastName: String,
  email: String,
  password: String (hashed),
  role: enum['lab_assistant', 'lab_technician', 'admin'],
  lab: String (optional, default: ''),
  skills: [String], // Only populated for technicians
  isActive: Boolean,
  timestamps
}
```

## Key Features

### Profile Management
- Technicians can update skills multiple times
- Skills changes are saved to database
- UI provides real-time feedback on selections
- Progress bar shows number of selected skills

### Skill Options Available
- Computer
- Electronics
- Printer Repair
- Mechanical
- Calibration
- Civil

## Security Features
- JWT token-based authentication
- Protected routes for profile access
- Role-based access control
- Backend validation on all endpoints

## Testing Checklist

### Signup Tests
- [ ] Lab Assistant signup without lab field - success
- [ ] Lab Technician signup without skills field - success
- [ ] Email validation working
- [ ] Password min-length validation working

### Login Tests
- [ ] Lab Assistant login redirects to dashboard
- [ ] Lab Technician login redirects to technician-dashboard

### Profile Tests
- [ ] Technician Profile link appears in navbar only for technicians
- [ ] Profile page displays technician name and email
- [ ] Skill selection working with checkboxes
- [ ] Progress counter updates with selections
- [ ] Submit button saves skills to backend
- [ ] Success message appears after save
- [ ] Skills persist after refresh

### Integration Tests
- [ ] Issue creation with skill filtering works
- [ ] Technician assignment only shows candidates with required skill
- [ ] Dashboard displays correctly for both roles

## Troubleshooting

### Route Error
If you see: "Route.get() requires a callback function but got a [object Object]"
- Check that middleware/auth.js exports `verifyToken` correctly
- Verify authRoutes.js imports `auth` and uses it as middleware

### Skills Not Updating
- Check browser console for API errors
- Verify token is being sent in Authorization header
- Ensure user is logged in as lab_technician

### Profile Not Showing
- Confirm user role is 'lab_technician'
- Check localStorage for correct user role
- Verify route is protected with correct role requirement

## API Reference

### Authentication Endpoints

**POST /api/auth/signup**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "lab_assistant"
}
```

**POST /api/auth/login**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "role": "lab_assistant"
}
```

**PATCH /api/auth/update-skills** (Protected)
```json
{
  "skills": ["computer", "electronics"]
}
```

**GET /api/auth/technicians/by-skill** (Protected)
```
Query param: ?skill=computer
```

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Signup.js (UPDATED)
│   │   ├── Login.js
│   │   ├── LabAssistantDashboard.js
│   │   ├── LabTechnicianDashboard.js
│   │   ├── TechnicianProfile.js (NEW)
│   │   └── ... (others)
│   ├── styles/
│   │   ├── Signup.css
│   │   ├── TechnicianProfile.css (NEW)
│   │   └── ... (others)
│   └── App.js (UPDATED)

backend/
├── controllers/
│   └── authController.js (UPDATED)
├── middleware/
│   └── auth.js (UPDATED)
├── models/
│   └── User.js (UPDATED)
├── routes/
│   └── authRoutes.js (UPDATED)
└── server.js
```

## Next Session Tasks
1. Add email notifications for skill updates
2. Implement skill requirement templates for common issues
3. Add skill endorsements/verification system
4. Create technician availability calendar
5. Add performance metrics based on completed tasks
