# Issue Fixes: Lab Technician Issues View & File Upload

## Problems Solved

### 1. Lab Technician Not Seeing Assigned Issues
**Issue:** Lab Technicians could not see issues assigned to them, only issues matching their skills.

**Solution:** Updated filtering logic in `backend/controllers/issueController.js` to show both:
- Issues directly assigned to the technician
- Issues matching their skill set (available to accept)

**Code Change:**
```javascript
// OLD: Only showed skill-matched issues
filter.requiredSkill = { $in: technician.skills };

// NEW: Shows both assigned and skill-matched issues
filter.$or = [
  { assignedTechnician: req.user.id },
  { requiredSkill: { $in: technician.skills } }
];
```

### 2. File Upload Option for Issues
**Feature Added:** Users can now upload files/attachments to issues.

**Implementation:**

#### Backend Changes:

1. **Issue Model** (`backend/models/Issue.js`):
   - Added `attachments` array field supporting:
     - filename, originalName, mimetype, size
     - uploadedAt timestamp
     - uploadedBy user reference

2. **Issue Controller** (`backend/controllers/issueController.js`):
   - Added `uploadAttachment()` - Upload file to issue
   - Added `downloadAttachment()` - Get file metadata
   - Added `deleteAttachment()` - Remove file from issue

3. **Issue Routes** (`backend/routes/issueRoutes.js`):
   - `POST /:id/upload` - Upload attachment
   - `GET /:id/attachment/:attachmentId` - Download attachment
   - `DELETE /:id/attachment/:attachmentId` - Delete attachment

#### Frontend Changes:

1. **Issue Service** (`frontend/src/services/issueService.js`):
   - `uploadAttachment()` - Sends file as base64 to backend
   - `downloadAttachment()` - Retrieves file metadata
   - `deleteAttachment()` - Removes file

2. **Lab Technician Dashboard** (`frontend/src/components/LabTechnicianDashboard.js`):
   - Added file upload state management
   - Added `handleFileUpload()` handler
   - Added `handleDeleteAttachment()` handler
   - Added file upload UI with attachment list display
   - Added file upload styling

3. **Lab Assistant Dashboard** (`frontend/src/components/LabAssistantDashboard.js`):
   - Added same file upload functionality
   - Added handlers and UI in issue detail modal
   - Integrated with existing issue view

4. **CSS Styling**:
   - `LabTechnicianDashboard.css` - File upload styling
   - `LabAssistantDashboard.css` - File upload styling
   - Includes upload button, file list, delete button styling

## Files Modified

### Backend
- ✅ `backend/models/Issue.js` - Added attachments field
- ✅ `backend/controllers/issueController.js` - Fixed filtering + added file methods
- ✅ `backend/routes/issueRoutes.js` - Added file upload routes

### Frontend
- ✅ `frontend/src/services/issueService.js` - Added file upload methods
- ✅ `frontend/src/components/LabTechnicianDashboard.js` - Added file UI
- ✅ `frontend/src/components/LabAssistantDashboard.js` - Added file UI
- ✅ `frontend/src/styles/LabTechnicianDashboard.css` - File styling
- ✅ `frontend/src/styles/LabAssistantDashboard.css` - File styling

## User Experience

### Lab Technician:
1. **View Issues:** Now sees both assigned issues and available skill-matched issues
2. **Upload Files:** Can upload documents/images via "Upload File" button in issue details
3. **View Files:** Sees list of all uploaded files with names, sizes, and upload dates
4. **Delete Files:** Can remove files from issues

### Lab Assistant:
1. **View Issues:** "My Issues" and "All Issues" tabs work correctly
2. **Upload Files:** Can upload supporting documents when viewing issues
3. **Manage Files:** Can view and delete uploaded files
4. **Track:** Sees who uploaded each file and when

## File Upload Flow

```
1. User selects file via file picker
2. File is read as base64 by FileReader API
3. Sent to backend with metadata (name, size, mimetype)
4. Backend stores filename and metadata in Issue.attachments array
5. File data stored as base64 string in MongoDB
6. UI updates to show file in list
7. User can download or delete via buttons
```

## Testing Checklist

- [ ] Lab Technician logs in and sees assigned issues
- [ ] Lab Technician sees unassigned issues matching their skills
- [ ] Click "View Details" on an issue
- [ ] Upload a file using "+ Upload File" button
- [ ] File appears in attachments list
- [ ] Verify file name, size, and upload date display correctly
- [ ] Delete file and verify removal
- [ ] Lab Assistant can upload files to issues in their view
- [ ] Refresh page and verify issues/files persist
- [ ] Try different file types (pdf, doc, image, etc.)

## Technical Notes

- Files are stored as base64 in MongoDB (max 16MB per document)
- Attachments are part of the issue document, not separate collection
- All file operations require authentication
- File size validation happens on both frontend and backend
- Pagination not yet implemented for file lists (works for typical use)

## Result

✅ Lab Technicians now see all relevant issues (assigned + skill-matched)
✅ File upload functionality available in both dashboards
✅ Users can upload/download/delete files from issues
✅ Attachments tracked with upload date and uploader info
