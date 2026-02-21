# Asset Management Software - Quick Start Guide

## Installation & Setup

### Step 1: Clone/Navigate to Project
```bash
cd AssetManagement
```

### Step 2: Install All Dependencies
```bash
npm run install-all
```

This will install dependencies for both the backend and frontend.

## Running the Application

### Option A: Run Both Backend and Frontend Simultaneously
```bash
npm run dev
```

This requires `concurrently` to be installed (included in root package.json).

### Option B: Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
npm run dev-backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev-frontend
```

## Configuration

### Backend Configuration (.env)
Create `backend/.env` file with:
```
MONGODB_URI=mongodb://localhost:27017/asset-management
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:3000
```

### MongoDB Setup
- **Option 1: Local MongoDB**
  - Download from https://www.mongodb.com/try/download/community
  - Install and run `mongod`

- **Option 2: MongoDB Atlas (Cloud)**
  - Create account at https://www.mongodb.com/cloud/atlas
  - Create a cluster and get your connection string
  - Update MONGODB_URI in .env

## Accessing the Application

Once both servers are running:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## Project Structure Overview

```
AssetManagement/
├── backend/          # Node.js + Express API
├── frontend/         # React Application
├── README.md         # Full documentation
├── package.json      # Root package with scripts
└── .gitignore        # Git ignore rules
```

## Key Features

✅ **Dashboard** - Overview of assets and alerts
✅ **Add Assets** - Create new asset entries
✅ **View & Search** - Search, filter, and edit assets
✅ **Stock Control** - Manage consumable quantities
✅ **Status Management** - Update asset status
✅ **Alerts** - Low stock and warranty expiration warnings

## Troubleshooting

### "Cannot find module 'concurrently'"
```bash
npm install -g concurrently
```

### MongoDB Connection Error
- Verify MongoDB is running
- Check connection string in .env
- For local: `mongod` should be running
- For Atlas: Verify IP whitelist and credentials

### Port Already in Use
- Backend: Change PORT in .env (default: 5000)
- Frontend: Set PORT=3001 in terminal before running

### CORS Errors
- Verify FRONTEND_URL in backend .env matches your frontend URL
- Ensure backend is running before frontend makes requests

## Building for Production

```bash
npm run build
```

This creates an optimized build of the frontend in `frontend/build/`

## Additional Information

For detailed API documentation, database schema, and advanced features, see [README.md](./README.md)

---

**Need Help?** Check the README.md for comprehensive documentation.
