# Role-Based Issue Management System - Implementation Guide

## Overview
A complete role-based issue/maintenance management system has been implemented with two primary roles:
1. **Lab Assistant** - Can report issues and close resolved issues
2. **Lab Technician** - Can manage and resolve issues

## Features Implemented

### Backend Components

#### 1. **User Model** (`backend/models/User.js`)
```javascript
{
  name: String,
  email: String (unique),
  password: String,
  role: 'lab_assistant' | 'lab_technician' | 'admin',
  lab: String,
  department: String,
  isActive: Boolean
}
```

#### 2. **Issue Model** (`backend/models/Issue.js`)
```javascript
{
  assetId: ObjectId (ref: Asset),
  labId: String,
  reportedBy: ObjectId (ref: User - Lab Assistant),
  assignedTechnician: ObjectId (ref: User - Lab Technician),
  issueType: 'preventive' | 'breakdown' | 'calibration',
  description: String,
  severity: 'low' | 'medium' | 'high',
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'resolved' | 'closed',
  technicianRemarks: String,
  rejectionReason: String,
  checklist: [{text: String, completed: Boolean}],
  reportedAt: Date,
  acceptedAt: Date,
  startedAt: Date,
  resolvedAt: Date,
  closedAt: Date
}
```

#### 3. **Authentication Middleware** (`backend/middleware/auth.js`)
- `verifyToken()` - Verifies JWT tokens
- `authorizeRole(...roles)` - Role-based access control

#### 4. **Issue Controller** (`backend/controllers/issueController.js`)
Functions implemented:
- `createIssue()` - Lab Assistant creates issues
- `getAllIssues()` - Get issues with role-based filtering
- `getIssueById()` - Get single issue details
- `updateIssueStatus()` - Lab Technician updates status
- `getIssuesByLab()` - Filter by lab
- `closeIssue()` - Lab Assistant closes resolved issues
- `getTechnicianStats()` - Get technician dashboard stats

#### 5. **Issue Routes** (`backend/routes/issueRoutes.js`)
```
POST   /api/issues                 - Create issue
GET    /api/issues                 - Get all issues (filtered)
GET    /api/issues/:id             - Get single issue
PATCH  /api/issues/:id/status      - Update issue status
GET    /api/issues/lab/:labId      - Get issues by lab
PATCH  /api/issues/:id/close       - Close issue
GET    /api/issues/stats/technician-stats - Get stats
```

### Frontend Components

#### 1. **Lab Assistant Dashboard** (`frontend/src/components/LabAssistantDashboard.js`)
Features:
- View all reported issues
- Create new issues with checklist
- Filter issues by status
- View issue details in modal
- Close resolved issues
- Real-time updates via polling (5 seconds)

#### 2. **Lab Technician Dashboard** (`frontend/src/components/LabTechnicianDashboard.js`)
Features:
- Dashboard stats (Pending, In Progress, Resolved, Rejected, Unassigned)
- View all assigned and unassigned issues
- Filter by status and severity
- Accept/Reject pending issues
- Mark issues as In Progress
- Mark issues as Resolved with remarks
- Add rejection reasons
- Real-time updates via polling (5 seconds)

#### 3. **Issue Service Layer** (`frontend/src/services/issueService.js`)
API wrapper methods:
- `createIssue()`
- `getAllIssues()`
- `getIssueById()`
- `updateIssueStatus()`
- `getIssuesByLab()`
- `closeIssue()`
- `getTechnicianStats()`

#### 4. **Updated App.js**
- Role toggle dropdown for demo purposes
- Conditional navigation based on role
- Route switching between Lab Assistant and Lab Technician dashboards
- Dynamic header text based on role

### Styling

#### 1. **Lab Technician Dashboard Styles** (`frontend/src/styles/LabTechnicianDashboard.css`)
- Stats cards with color coding
- Status and severity badges
- Responsive table layout
- Modal for issue details
- Action forms for fulfill/reject

#### 2. **Lab Assistant Dashboard Styles** (`frontend/src/styles/LabAssistantDashboard.css`)
- Create issue form
- Issue cards grid
- Modal details view
- Checklist management UI
- Color-coded status and severity badges

#### 3. **Updated App Styles** (`frontend/src/styles/index.css`)
- Role selector dropdown styling
- Navbar flexbox layout adjustments
- Role-specific styling

## Issue Status Flow

```
pending → accepted → in_progress → resolved → closed
   ↓
rejected
```

### Status Transitions:

**Lab Assistant:**
- Create issue (status: pending)
- Close issue (when status: resolved)

**Lab Technician:**
- Accept pending issue (pending → accepted)
- Reject issue (any status → rejected, with reason)
- Start work (accepted → in_progress)
- Mark resolved (in_progress → resolved, with remarks)

## Demo Usage

### Switching Roles
1. Use the "Switch Role" dropdown in the navbar
2. Select "Lab Assistant" or "Lab Technician"
3. Navigation menu updates automatically
4. Dashboard switches to role-specific view

### Lab Assistant Workflow
1. Click "Create New Issue"
2. Select asset and issue type
3. Add checklist items
4. Submit to create issue
5. View issues in the dashboard
6. Once resolved by technician, click "Close Issue"

### Lab Technician Workflow
1. View all issues in dashboard
2. Filter by status or severity
3. Click "View Details" on an issue
4. Accept pending issues
5. Mark as In Progress when starting work
6. Mark as Resolved with technician remarks
7. Or Reject issue with rejection reason

## Real-Time Updates
- Both dashboards poll for updates every 5 seconds
- When a technician updates status, the changes appear in the assistant's dashboard within 5 seconds
- Stats update automatically

## API Endpoints

### Create Issue (Lab Assistant)
```
POST /api/issues
Body: {
  assetId: ObjectId,
  issueType: 'preventive' | 'breakdown' | 'calibration',
  description: String,
  severity: 'low' | 'medium' | 'high',
  checklist: [{text: String}]
}
```

### Get Issues
```
GET /api/issues?status=pending&severity=high
```

### Update Status (Lab Technician)
```
PATCH /api/issues/:id/status
Body: {
  status: 'accepted' | 'rejected' | 'in_progress' | 'resolved' | 'closed',
  technicianRemarks: String (optional),
  rejectionReason: String (optional)
}
```

### Close Issue (Lab Assistant)
```
PATCH /api/issues/:id/close
```

## Authentication Implementation Notes

Currently, for **demo purposes**, the routes are unprotected. In production:

1. Enable JWT verification in routes:
```javascript
router.post('/', verifyToken, authorizeRole('lab_assistant', 'admin'), createIssue);
```

2. Implement login endpoint to issue JWT tokens:
```javascript
POST /api/auth/login
Body: { email, password }
Response: { token, user }
```

3. Add token to frontend API calls:
```javascript
headers: { 'Authorization': `Bearer ${token}` }
```

## File Structure

```
backend/
├── models/
│   ├── User.js (NEW)
│   └── Issue.js (NEW)
├── middleware/
│   └── auth.js (NEW)
├── controllers/
│   └── issueController.js (NEW)
├── routes/
│   └── issueRoutes.js (NEW)
└── server.js (UPDATED)

frontend/
├── components/
│   ├── LabAssistantDashboard.js (NEW)
│   └── LabTechnicianDashboard.js (NEW)
├── services/
│   └── issueService.js (NEW)
├── styles/
│   ├── LabAssistantDashboard.css (NEW)
│   ├── LabTechnicianDashboard.css (NEW)
│   └── index.css (UPDATED)
└── App.js (UPDATED)
```

## Next Steps for Production

1. **Database Seeding**: Create test users with different roles
   ```javascript
   const testUsers = [
     { name: 'John Doe', email: 'John@lab.com', role: 'lab_assistant', lab: 'ECE Lab 1' },
     { name: 'Jane Smith', email: 'jane@lab.com', role: 'lab_technician', lab: 'ECE Lab 1' }
   ];
   ```

2. **JWT Implementation**: Add login endpoint and token generation
3. **Email Notifications**: Notify when issue status changes
4. **Audit Logging**: Track all status changes and updates
5. **Advanced Filtering**: Date range, assigned technician, priority queues
6. **Export/Reports**: Generate PDF or Excel reports per lab/technician
7. **Attachment Support**: Allow file uploads for issue documentation
8. **Comments/Notes**: Add discussion thread on issues
9. **SLA Tracking**: Monitor response and resolution times
10. **Performance Improvements**: Replace polling with WebSockets for real-time updates

## Testing the System

1. Start backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Start frontend:
   ```bash
   cd frontend
   npm start
   ```

3. Test Role Switching:
   - Use the dropdown in the navbar to switch between roles
   - Navigation items change based on selected role

4. Test Creation & Status Flow:
   - Create issues as Lab Assistant
   - Accept/Update status as Lab Technician
   - Watch real-time updates (5-second polling)

## Styling Notes

- **Status Badges**: Pending (yellow), Accepted (cyan), In Progress (blue), Resolved (green), Rejected (red), Closed (gray)
- **Severity Badges**: Low (green), Medium (yellow), High (red)
- **Color Scheme**: Professional blue/green with consistent shadows and transitions
- **Responsive**: All components are mobile-friendly

---

**Last Updated**: February 19, 2026
**Version**: 1.0.0
