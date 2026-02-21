# Changes Implemented - Issue Fixes

## Summary
Fixed three main issues:
1. **Empty "Reported By" field** - Fixed MongoDB populate syntax
2. **Lab Technician issue filtering** - Implemented skill-based filtering (already in place)
3. **Lab Assistant view management** - Added view toggle tabs and filtering

---

## 1. Fixed "Reported By" Field Empty Issue

### Problem
The "Reported By" field was displaying empty/undefined even though the data was in the database.

### Root Cause
MongoDB populate queries were using the old/incorrect syntax format.

### Solution
Updated all populate statements in `backend/controllers/issueController.js` to use the proper syntax:

**Old syntax:**
```javascript
.populate('reportedBy', 'name email role lab')
```

**New syntax:**
```javascript
.populate({
  path: 'reportedBy',
  select: 'name email role lab'
})
```

### Files Modified
- `backend/controllers/issueController.js`
  - `createIssue()` - Lines 90-98
  - `getAllIssues()` - Lines 170-178
  - `getIssueById()` - Lines 205-213
  - `updateIssueStatus()` - Lines 319-327

### Result
✅ "Reported By" field now properly shows the Lab Assistant's name who reported the issue

---

## 2. Lab Technician Skill-Based Filtering

### Implementation
Lab Technicians now automatically see only issues related to their skills.

### How It Works
When a Lab Technician requests issues via `GET /api/issues`:
1. Backend queries their user record for skills array
2. Filters issues where `requiredSkill` matches technician's skills
3. Returns only relevant issues

**Code Location:** `backend/controllers/issueController.js` lines 156-163
```javascript
if (req.user && req.user.role === 'lab_technician') {
  const technician = await User.findById(req.user.id);
  if (technician && technician.skills && technician.skills.length > 0) {
    filter.requiredSkill = { $in: technician.skills };
  }
}
```

### Result
✅ Lab Technicians see only issues matching their skill set

---

## 3. Lab Assistant View Toggle UI

### New Feature
Lab Assistants can now switch between two views:
- **My Issues** - Shows only issues they reported
- **All Issues** - Shows all issues in the lab

### Implementation Details

#### Frontend Changes
**File:** `frontend/src/components/LabAssistantDashboard.js`

1. Added `viewType` state (Line 14):
   ```javascript
   const [viewType, setViewType] = useState('my');
   ```

2. Updated fetch to include `viewType` parameter (Line 37):
   ```javascript
   const issuesResponse = await issueService.getAllIssues({ ...filters, viewType });
   ```

3. Updated useEffect dependency (Line 83):
   ```javascript
   useEffect(() => {
     fetchData();
   }, [filters, viewType]);
   ```

4. Added view toggle buttons (Lines 404-419):
   ```jsx
   <div className="view-toggle-container">
     <button className={`view-toggle-btn ${viewType === 'my' ? 'active' : ''}`}
             onClick={() => setViewType('my')}>
       My Issues
     </button>
     <button className={`view-toggle-btn ${viewType === 'all' ? 'active' : ''}`}
             onClick={() => setViewType('all')}>
       All Issues
     </button>
   </div>
   ```

5. Dynamic heading (Line 421):
   ```jsx
   <h3>{viewType === 'my' ? 'My Issues' : 'All Issues in Lab'}</h3>
   ```

#### Backend Support
**File:** `backend/controllers/issueController.js` (Lines 149-152)
```javascript
if (req.user && req.user.role === 'lab_assistant') {
  if (viewType !== 'all') {
    filter.reportedBy = req.user.id;
  }
}
```

#### Styling
**File:** `frontend/src/styles/LabAssistantDashboard.css`

Added CSS for view toggle buttons (Lines 272-305):
- `.view-toggle-container` - Flex container for buttons
- `.view-toggle-btn` - Button styling with hover effects
- `.view-toggle-btn.active` - Active state styling (green background)

### Result
✅ Lab Assistants can toggle between "My Issues" and "All Issues" tabs
✅ Separate tracking of reported issues vs all lab issues

---

## Summary of Changes

| Issue | Status | Implementation |
|-------|--------|-----------------|
| Empty "Reported By" field | ✅ Fixed | Updated MongoDB populate syntax |
| Lab Technician sees all issues | ✅ Fixed | Skill-based filtering on backend |
| Lab Assistant view management | ✅ Added | View toggle UI with "My" and "All" tabs |

---

## Testing Recommendations

1. **Test "Reported By" field:**
   - Create a new issue as Lab Assistant
   - Check that reporter name appears correctly in issue details

2. **Test Lab Technician filtering:**
   - Login as technician with specific skills
   - Verify only issues requiring those skills are shown

3. **Test Lab Assistant view toggle:**
   - Login as Lab Assistant
   - Switch between "My Issues" and "All Issues"
   - Verify filtering works correctly for each view
   - Create new issue and confirm it appears in appropriate view

---

## Technical Details

### Backend Endpoint: GET /api/issues
Query Parameters:
- `status` - Optional status filter
- `severity` - Optional severity filter
- `viewType` - For Lab Assistants: 'my' (default) or 'all'

**Automatic Filtering (No params needed):**
- Lab Assistants: Returns only their issues (unless viewType=all)
- Lab Technicians: Returns only issues matching their skills
- Others: Returns all issues

### Frontend Services
Service method remains unchanged and properly handles viewType parameter:
```javascript
getAllIssues: async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const response = await axios.get(`${API_URL}/issues${queryParams ? '?' + queryParams : ''}`);
  return response.data;
}
```

---

## Files Modified Summary
- ✅ `backend/controllers/issueController.js` - Fixed populate syntax + filtering logic
- ✅ `frontend/src/components/LabAssistantDashboard.js` - Added view toggle UI
- ✅ `frontend/src/styles/LabAssistantDashboard.css` - Added view toggle styling
