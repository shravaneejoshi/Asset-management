# Quick Start Guide - Role-Based Issue Management System

## System Overview

This system implements a role-based issue/maintenance management platform with two main roles:

### 🔷 Lab Assistant
- **Can**: Report issues, create maintenance requests, close resolved issues
- **Cannot**: Accept/reject issues or mark status

### 🔴 Lab Technician  
- **Can**: Accept issues, reject issues, mark in progress, resolve issues
- **Cannot**: Close issues (only assistants can close)

## Quick Setup

### 1. Backend Setup ✅ DONE
```bash
cd backend
npm install
npm run dev
```

**New Files Created:**
- `models/User.js` - User schema with roles
- `models/Issue.js` - Issue/maintenance schema
- `middleware/auth.js` - JWT and role-based auth
- `controllers/issueController.js` - Issue CRUD operations
- `routes/issueRoutes.js` - Issue API endpoints
- `server.js` - Updated with issue routes

**No database migration needed** - Just restart the server

### 2. Frontend Setup ✅ DONE
```bash
cd frontend
npm start
```

**New Files Created:**
- `components/LabAssistantDashboard.js` - Create and manage issues
- `components/LabTechnicianDashboard.js` - Resolve and track issues
- `services/issueService.js` - API wrapper
- `styles/LabAssistantDashboard.css` - Styling
- `styles/LabTechnicianDashboard.css` - Styling
- `App.js` - Updated with role toggle

## Testing the System

### Step 1: Open Application
```
http://localhost:3000
```

### Step 2: Switch Role
1. Look for "Switch Role" dropdown in navbar (top center)
2. Select "Lab Assistant" or "Lab Technician"
3. Navigation updates automatically

### Step 3: Lab Assistant Demo
1. Select "Lab Assistant" from role dropdown
2. Click "Create New Issue"
3. Fill in details:
   - Select an asset
   - Choose issue type (Preventive, Breakdown, Calibration)
   - Set severity (Low, Medium, High)
   - Add description
   - Add at least one checklist item
4. Click "Create Issue"
5. View issue in dashboard
6. See status updates from technician in real-time

### Step 4: Lab Technician Demo
1. Select "Lab Technician" from role dropdown
2. View Dashboard with stats:
   - Pending (yellow)
   - In Progress (blue)
   - Resolved (green)
   - Rejected (red)
   - Unassigned (gray)
3. Click "View Details" on an issue
4. Accept the issue → Status changes to "Accepted"
5. Mark as "In Progress" → Status changes
6. Enter remarks and mark as "Resolved"
7. Or enter rejection reason and "Reject"

### Step 5: See Real-Time Updates
1. Open two browser tabs (or windows)
2. Tab 1: Lab Assistant role
3. Tab 2: Lab Technician role
4. Make status changes in Tab 2
5. Watch Tab 1 update automatically (within 5 seconds)

## Key Features

### Status Flow
```
pending → accepted → in_progress → resolved → closed
   ↓
 rejected
```

### Filtering Options

**Lab Technician:**
- Filter by Status (Pending, Accepted, In Progress, Resolved, Rejected, Closed)
- Filter by Severity (Low, Medium, High)

**Lab Assistant:**
- Filter by Status

### Dashboard Stats
**Lab Technician sees:**
- Pending count
- In Progress count
- Resolved count
- Rejected count
- Unassigned issues in their lab

### Color Coding
- **Pending**: Yellow ⚠️
- **Accepted**: Cyan 🔵
- **In Progress**: Blue 🟦
- **Resolved**: Green ✅
- **Rejected**: Red ❌
- **Closed**: Gray ⊘

**Severity:**
- **Low**: Green ✓
- **Medium**: Yellow ⚠
- **High**: Red ⛔

## API Endpoints Summary

### Issues API

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| POST | `/api/issues` | Lab Assistant | Create new issue |
| GET | `/api/issues` | Both | Get all issues (filtered by role) |
| GET | `/api/issues/:id` | Both | Get issue details |
| PATCH | `/api/issues/:id/status` | Lab Technician | Update issue status |
| GET | `/api/issues/lab/:labId` | Lab Technician | Get issues by lab |
| PATCH | `/api/issues/:id/close` | Lab Assistant | Close resolved issue |
| GET | `/api/issues/stats/technician-stats` | Lab Technician | Get dashboard stats |

## Issue Lifecycle Example

### Example 1: Normal Resolution Flow
```
1. Lab Assistant reports issue
   → Status: pending
   → Created by: Lab Assistant
   → Created at: 2026-02-19 10:00

2. Lab Technician accepts issue
   → Status: accepted
   → Assigned to: Technician name
   → Accepted at: 2026-02-19 10:15

3. Lab Technician starts work
   → Status: in_progress
   → Started at: 2026-02-19 10:20

4. Lab Technician completes work
   → Status: resolved
   → Remarks: "Fixed the calibration issue"
   → Resolved at: 2026-02-19 11:30

5. Lab Assistant closes issue
   → Status: closed
   → Closed at: 2026-02-19 11:45
```

### Example 2: Rejection Flow
```
1. Lab Assistant reports issue
   → Status: pending

2. Lab Technician reviews and rejects
   → Status: rejected
   → Reason: "Not a valid maintenance request. Asset is working properly"
   → Rejected at: 2026-02-19 10:30
```

## Troubleshooting

### Issue Not Appearing in Technician Dashboard
- Check Lab ID matches
- Refresh the page or wait 5 seconds

### Can't Create Issue
- Ensure you have selected an asset
- Ensure you have added at least one checklist item
- All required fields highlighted with *

### Backend Connection Error
- Ensure backend is running on port 5000
- Check `.env` file has correct MongoDB URI
- Verify CORS is enabled

### Changes Not Showing in Real-Time
- System updates every 5 seconds automatically
- Manual refresh available via F5 or Cmd+R

## Demo Workflow (5 minutes)

1. **Create Issue (1 min)**
   - Switch to Lab Assistant
   - Create → Select any asset → Preventive maintenance → Add checklist → Submit

2. **Accept & Start Work (1 min)**
   - Switch to Lab Technician
   - View Details on issue → Click Accept → Click "Mark as In Progress"

3. **Resolve Issue (1 min)**
   - Click "Mark as Resolved"
   - Enter remarks: "Completed scheduled maintenance"

4. **Close Issue (1 min)**
   - Switch back to Lab Assistant
   - View the issue → Click "Close Issue"

5. **Verify Real-Time (1 min)**
   - Open two browser tabs
   - One as Assistant, one as Technician
   - Make changes in Technician, see updates in Assistant

## Architecture

### Backend
```
Issue Request Flow:
User Request → Auth Middleware → Controller Logic → Database
             (verifyToken)    (Business Logic)   (MongoDB)
```

### Frontend
```
User Action → Component State → Issue Service → API Call
                              Get/Update Issue Data
                                    ↓
                              Refresh Display (Auto-refresh every 5s)
```

### Real-Time Updates
```
Technician Tab Updates → API Call → Database Update
                                        ↓
                             Assistant Tab Polls (every 5s)
                                        ↓
                             New Data Fetched & Displayed
```

## Production Considerations

✅ **Currently Implemented:**
- Role-based access control structure
- Status flow and transitions
- Database schema
- API endpoints
- Real-time polling
- UI components

⚠️ **Not Yet Implemented (For Production):**
- JWT authentication (currently unprotected routes)
- Email notifications
- Audit logging
- SLA tracking
- Attachment uploads
- Advanced filtering
- WebSocket support (using polling instead)
- Database migrations

## Support & Documentation

For detailed information, see:
- `ROLE_BASED_SYSTEM.md` - Complete technical documentation
- `backend/controllers/issueController.js` - API logic
- `frontend/components/LabAssistantDashboard.js` - Assistant UI
- `frontend/components/LabTechnicianDashboard.js` - Technician UI

---

**Ready to use!** 🚀 Both Lab Assistant and Lab Technician dashboards are fully functional.
