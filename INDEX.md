![Asset Management System](https://img.shields.io/badge/Status-Ready%20to%20Deploy-brightgreen)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-green)
![License](https://img.shields.io/badge/License-ISC-orange)

# 🏭 Asset Management Software - Lab Assistant Edition

> A complete, production-ready MERN Stack application for managing laboratory equipment, consumables, and asset inventory.

---

## 📖 Documentation Index

### 🚀 Getting Started
**Start Here!** Go through these in order:

1. **[SETUP_COMPLETE.md](./SETUP_COMPLETE.md)** ← **START HERE**
   - What has been created
   - Step-by-step installation
   - Quick troubleshooting
   - Project overview

2. **[QUICKSTART.md](./QUICKSTART.md)** ← **Quick Setup**
   - Fast installation commands
   - Running the application
   - Accessing localhost servers

3. **[README.md](./README.md)** ← **Full Documentation**
   - Feature descriptions
   - Technology stack details
   - API endpoints overview
   - Schema definition
   - Future enhancements

### 🏗️ Architecture & Code
4. **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** ← **Code Organization**
   - Complete directory structure
   - File descriptions
   - Data flow diagrams
   - Extensibility points

5. **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** ← **API Reference**
   - All 11 endpoints documented
   - Request/response examples
   - Query parameters
   - Error codes
   - cURL examples

### 🎯 What's Included

```
✅ Backend (Node.js + Express)
   • MongoDB connection configuration
   • Complete Asset model with validation
   • 11 API endpoints with full CRUD
   • Pre-save middleware for automatic calculations
   • Error handling throughout

✅ Frontend (React + React Router)
   • Dashboard with real-time statistics
   • Add New Asset form (comprehensive)
   • View & Search Assets (with filtering)
   • Stock Control for consumables
   • Responsive CSS styling
   • Centralized API service layer

✅ Documentation
   • Setup guides
   • API reference
   • Project structure
   • Code organization
   • Troubleshooting

✅ Configuration
   • Environment setup templates
   • Git ignore files
   • Root package scripts
   • Development instructions
```

---

## ⚡ Quick Start (5 Minutes)

### 1️⃣ Install Dependencies
```bash
cd AssetManagement
npm run install-all
```

### 2️⃣ Configure MongoDB
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI
```

### 3️⃣ Start Both Servers
```bash
npm run dev
```

### 4️⃣ Open Browser
- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000/api/health

✨ **Done!** You're ready to manage assets!

---

## 📁 Project Structure at a Glance

```
AssetManagement/
│
├── 📚 DOCUMENTATION
│   ├── SETUP_COMPLETE.md ................... Setup & Overview
│   ├── QUICKSTART.md ....................... Quick installation
│   ├── README.md ........................... Full documentation
│   ├── PROJECT_STRUCTURE.md ................ Code organization
│   └── API_DOCUMENTATION.md ................ API reference
│
├── 🔧 Backend (Node.js + Express)
│   ├── server.js ........................... Express app
│   ├── config/database.js .................. MongoDB setup
│   ├── models/Asset.js ..................... Data schema
│   ├── controllers/assetController.js ....... Business logic
│   ├── routes/assetRoutes.js ............... API endpoints
│   ├── .env.example ........................ Configuration template
│   └── package.json ........................ Dependencies
│
├── 🎨 Frontend (React)
│   ├── src/App.js .......................... Main app
│   ├── src/components/
│   │   ├── Dashboard.js .................... Statistics view
│   │   ├── AddAsset.js ..................... Create form
│   │   ├── ViewAssets.js ................... List & edit
│   │   └── StockControl.js ................. Consumable management
│   ├── src/services/assetService.js ........ API client
│   ├── src/styles/ ......................... Component styles
│   ├── public/index.html ................... HTML template
│   └── package.json ........................ Dependencies
│
└── ⚙️ Configuration
    ├── package.json ........................ Root scripts
    └── .gitignore .......................... Git settings
```

---

## 🎯 Core Components

### **Dashboard** 📊
- 6 statistics cards
- Real-time asset counts
- Low stock alerts
- Warranty expiration warnings

### **Add Asset** ➕
- 4-section form
- Client-side validation
- Support for consumables & non-consumables
- Success/error feedback

### **View Assets** 📋
- Advanced search
- Multi-filter support
- Inline editing
- Quick status updates
- Delete functionality

### **Stock Control** 📦
- Consumables only
- +/- quantity buttons
- Low-stock highlighting
- Real-time updates

---

## 🔌 API Endpoints (11 Total)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/assets` | List all (with filters) |
| POST | `/assets` | Create asset |
| GET | `/assets/:id` | Get single |
| PUT | `/assets/:id` | Update details |
| PATCH | `/assets/:id/status` | Change status |
| PATCH | `/assets/:id/quantity` | Update stock |
| DELETE | `/assets/:id` | Delete asset |
| GET | `/assets/alerts/low-stock` | Low stock items |
| GET | `/assets/alerts/warranty-expiring` | Expiring warranties |
| GET | `/assets/stats/dashboard` | Dashboard stats |
| GET | `/assets/location/:loc` | Assets by location |

**Full details in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

---

## 🛠️ Technology Stack

**Frontend:**
- React 18
- React Router DOM 6
- Axios
- CSS3 (responsive)

**Backend:**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT ready

**Features:**
- Input validation (client + server)
- Error handling
- CORS enabled
- Environment configuration
- Pre-save middleware

---

## 📋 Asset Schema

```javascript
{
  assetName: String (required),
  category: String (required),
  assetType: "consumable" | "non-consumable",
  brand: String,
  model: String,
  serialNumber: String (unique for non-consumables),
  quantity: Number,
  minQuantity: Number,
  labLocation: String (required),
  purchaseDate: Date,
  purchaseCost: Number,
  warrantyExpiryDate: Date,
  status: "available" | "in_use" | "under_maintenance" | "disposed",
  condition: "excellent" | "good" | "fair" | "damaged",
  supplier: String,
  invoiceNumber: String,
  notes: String,
  // Auto-calculated
  isLowStock: Boolean,
  isWarrantyExpiring: Boolean
}
```

---

## 🚀 Getting Started - Step by Step

### Prerequisites
- Node.js v14+
- MongoDB (local or Atlas cloud)
- npm or yarn

### Installation

**Step 1:** Install all dependencies
```bash
cd AssetManagement
npm run install-all
```

**Step 2:** Configure environment
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with:
# - MONGODB_URI: Your MongoDB connection
# - PORT: 5000
# - JWT_SECRET: Any string
# - FRONTEND_URL: http://localhost:3000
```

**Step 3:** Start MongoDB
```bash
mongod  # or use MongoDB Atlas cloud connection
```

**Step 4:** Run the application
```bash
npm run dev
```

**Step 5:** Open browser
- Frontend: http://localhost:3000
- Backend Health: http://localhost:5000/api/health

---

## 💡 Usage Examples

### Add a New Asset
1. Click "Add Asset" in navigation
2. Fill in required fields (name, category, location, type)
3. Add optional details (brand, price, warranty, etc.)
4. Click "Add Asset"

### Search & Filter
1. Go to "View Assets"
2. Use search box or filters
3. Select specific criteria
4. View filtered results

### Manage Stock
1. Go to "Stock Control"
2. View all consumables
3. Use +/- buttons to adjust quantities
4. System alerts on low stock

### Update Status
1. View Assets or Dashboard
2. Change status from dropdown
3. Update saves immediately

---

## ⚙️ Configuration Guide

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/asset-management
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:3000
```

### Environment Modes
- **development** - Hot reload, detailed errors
- **production** - Optimized, minimal logging

### Port Changes
- Frontend: `PORT=3001 npm start` in frontend folder
- Backend: Change `PORT=5000` in .env

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
**Problem:** `Error: connect ECONNREFUSED`
**Solution:** 
- Start MongoDB: `mongod`
- Or use MongoDB Atlas cloud
- Check MONGODB_URI in .env

### Port Already in Use
**Problem:** `EADDRINUSE: address already in use`
**Solution:**
- Change PORT in .env
- Or kill existing process on that port

### CORS Error
**Problem:** Access to XMLHttpRequest blocked by CORS
**Solution:**
- Verify FRONTEND_URL in .env
- Restart backend server

### Module Not Found
**Problem:** Cannot find module 'express'
**Solution:** Run `npm install` in backend and frontend folders

---

## 📈 Performance & Scalability

### Optimizations Included
✅ Database indexes on frequent search fields  
✅ Efficient query filtering  
✅ Lazy loading in React components  
✅ Error boundaries for robustness  
✅ API service layer for reusability  

### Ready for Growth
- Authentication system (JWT structure ready)
- Role-based access control (authorization ready)
- Audit logging capability
- API rate limiting integration point
- Database sharding support

---

## 🔐 Security Features

✅ Input validation (server-side)  
✅ MongoDB injection prevention (Mongoose)  
✅ CORS configured properly  
✅ Environment variable protection  
✅ Error handling (no sensitive data leaked)  
✅ Unique constraint on serial numbers  

### Future Security Features
- JWT authentication
- Role-based access control
- Audit logging
- Rate limiting
- HTTPS enforcement

---

## 📚 Additional Resources

### Related Files
- [Installation Guide](./SETUP_COMPLETE.md)
- [API Reference](./API_DOCUMENTATION.md)
- [Code Structure](./PROJECT_STRUCTURE.md)
- [Features Readme](./README.md)

### External Resources
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Mongoose ODM](https://mongoosejs.com/)

---

## 🎯 Next Steps

1. **Complete Installation** - Follow [SETUP_COMPLETE.md](./SETUP_COMPLETE.md)
2. **Explore Features** - Try the application in browser
3. **Review Code** - Check [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
4. **Read API Docs** - See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
5. **Customize** - Modify styles and add features
6. **Deploy** - When ready for production

---

## 📞 Support

### Documentation
- ✅ [Setup Guide](./SETUP_COMPLETE.md) - Installation & overview
- ✅ [Quick Start](./QUICKSTART.md) - Fast setup
- ✅ [Full Readme](./README.md) - Features & details
- ✅ [API Docs](./API_DOCUMENTATION.md) - Endpoint reference
- ✅ [Code Structure](./PROJECT_STRUCTURE.md) - Architecture

### Common Issues
- See **Troubleshooting** section above
- Check console logs for errors
- Verify MongoDB is running
- Ensure .env is configured

---

## 📊 Project Statistics

- **Files Created**: 30+
- **Backend Routes**: 11 endpoints
- **React Components**: 4 main + 1 detail modal
- **CSS Files**: 5 component files + global styles
- **Documentation**: 5 comprehensive guides
- **Code Lines**: 3000+ lines of production code
- **Time to Setup**: ~5 minutes

---

## 🎉 Features Summary

### Asset Management
✅ Add new assets with full details  
✅ Search by name or serial number  
✅ Filter by location, category, status  
✅ Edit asset information  
✅ Delete assets  
✅ Manage quantities  

### Monitoring & Alerts
✅ Real-time dashboard  
✅ Low stock notifications  
✅ Warranty expiration alerts  
✅ Asset status tracking  
✅ Condition monitoring  

### Organization
✅ Multi-location support  
✅ Category classification  
✅ Lab storage organization  
✅ Statistics and reports  
✅ Supplier tracking  

### Technology
✅ Modern MERN stack  
✅ Responsive design  
✅ RESTful API  
✅ Database indexing  
✅ Error handling  

---

## 🏗️ Architecture Highlights

### Separation of Concerns
- **Controllers**: Business logic
- **Models**: Data validation & schema
- **Routes**: API endpoints
- **Services**: API client wrapper
- **Components**: UI logic

### Data Flow
```
User Input → React Component → API Service → Express Route 
→ Controller → MongoDB → Response → State Update → UI Re-render
```

### Scalability Points
- Add authentication layer
- Implement caching (Redis)
- Database optimization
- API rate limiting
- Component code splitting

---

## 📝 Version Info

- **Version**: 1.0.0
- **Created**: February 2026
- **Status**: Production Ready
- **Maintenance**: Active

---

## 🙏 Acknowledgments

Built with modern web technologies for lab management.

---

<div align="center">

### Ready to Manage Your Lab Assets? 🚀

**[Start with SETUP_COMPLETE.md →](./SETUP_COMPLETE.md)**

---

Made with ❤️ for Lab Assistants  
Asset Management System v1.0.0

</div>
