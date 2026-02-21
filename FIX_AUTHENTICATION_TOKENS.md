# Fix: Add Authentication Tokens to API Requests

## Problem
Frontend was getting 401 Unauthorized errors when trying to fetch issues and other data:
```
GET http://localhost:5000/api/issues?status=&viewType=my 401 (Unauthorized)
Error: 'No token provided'
```

## Root Cause
All frontend services (issueService, assetService, maintenanceService) were making API requests without including the JWT authentication token that was stored in localStorage after login.

## Solution
Added a `getAuthHeaders()` helper function to all frontend services that retrieves the token from localStorage and includes it in every API request's Authorization header with the "Bearer" scheme.

### Pattern Used
```javascript
// Helper function in each service
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    }
  };
};

// Usage in API calls
await axios.get(`${API_URL}/issues`, getAuthHeaders());
await axios.post(`${API_URL}/issues`, data, getAuthHeaders());
await axios.patch(`${API_URL}/issues/${id}`, data, getAuthHeaders());
```

## Files Modified

### 1. `frontend/src/services/issueService.js`
- Added `getAuthHeaders()` helper
- Updated methods:
  - `createIssue()`
  - `getAllIssues()`
  - `getIssueById()`
  - `updateIssueStatus()`
  - `getIssuesByLab()`
  - `closeIssue()`
  - `getTechnicianStats()`

### 2. `frontend/src/services/assetService.js`
- Added `getAuthHeaders()` helper
- Updated all 11 methods to include authentication

### 3. `frontend/src/services/maintenanceService.js`
- Added `getAuthHeaders()` helper
- Updated all 9 methods to include authentication

## How It Works

1. **User Login**: User logs in, backend sends JWT token in response
2. **Token Storage**: authService stores token in `localStorage.setItem('token', token)`
3. **API Requests**: When services make requests, they:
   - Call `getAuthHeaders()` to get the token
   - Include it in the request headers as `Authorization: Bearer <token>`
4. **Backend Validation**: Backend middleware validates the token
5. **Authorized Access**: If token is valid, request succeeds; if invalid/missing, returns 401

## Testing Steps

1. **Login**: Navigate to login page and login with valid credentials
2. **Fetch Issues**: Navigate to Dashboard or Issue Management tabs
   - Should now fetch issues successfully without 401 errors
   - "Reported By" field should display the Lab Assistant's name
3. **View Toggle**: Lab Assistant can now use "My Issues" and "All Issues" tabs
4. **Skill Filtering**: Lab Technician sees only issues matching their skills

## Technical Details

### API Request Flow
```
Frontend Service
  ↓
getAuthHeaders() → Gets token from localStorage
  ↓
Axios Request with headers
  ↓ Authorization: Bearer <token>
Backend API
  ↓
auth middleware (verifyToken)
  ↓
Validates token signature
  ↓
Attaches decoded user to req.user
  ↓
Route Handler
  ↓
Returns data with proper population
```

### Token Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Notes
- Token is persisted in localStorage even after page refresh
- If token expires, user will get 401 and should log in again
- getAuthHeaders() handles missing token gracefully (empty string if no token)
- All services now follow the same authorization pattern for consistency

## Result
✅ All API requests now include authentication tokens
✅ Issues and assets now fetch correctly
✅ 401 unauthorized errors resolved
✅ Full role-based filtering works (Lab Technician sees only their skills, Lab Assistant sees filtered/all views)
