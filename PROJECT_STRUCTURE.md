# ASSET MANAGEMENT SYSTEM - PROJECT STRUCTURE

## Complete Directory Structure

```
AssetManagement/
│
├── .github/
│   └── copilot-instructions.md       # Development guide
│
├── backend/
│   ├── config/
│   │   └── database.js               # MongoDB connection config
│   │
│   ├── controllers/
│   │   └── assetController.js        # All asset operations
│   │
│   ├── models/
│   │   └── Asset.js                  # MongoDB schema & validations
│   │
│   ├── routes/
│   │   └── assetRoutes.js            # API endpoints
│   │
│   ├── middleware/                   # Custom middleware (expandable)
│   │
│   ├── .env.example                  # Environment template
│   ├── .gitignore
│   ├── package.json
│   └── server.js                     # Express server entry point
│
├── frontend/
│   ├── public/
│   │   └── index.html                # HTML template
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js          # Statistics & alerts view
│   │   │   ├── AddAsset.js           # Asset creation form
│   │   │   ├── ViewAssets.js         # Asset listing & editing
│   │   │   └── StockControl.js       # Consumable management
│   │   │
│   │   ├── services/
│   │   │   └── assetService.js       # API client
│   │   │
│   │   ├── styles/
│   │   │   ├── index.css             # Global styles
│   │   │   ├── App.css
│   │   │   ├── Dashboard.css
│   │   │   ├── AddAsset.css
│   │   │   ├── ViewAssets.css
│   │   │   └── StockControl.css
│   │   │
│   │   ├── App.js                    # Main app component
│   │   ├── index.js                  # React entry point
│   │   └── index.css
│   │
│   ├── .gitignore
│   ├── package.json
│   └── .env (create from .env.example)
│
├── .gitignore                        # Root level git ignore
├── package.json                      # Root scripts for both backend & frontend
├── README.md                         # Full documentation
├── QUICKSTART.md                     # Quick start guide
└── PROJECT_STRUCTURE.md              # This file
```

## File Descriptions

### Backend Files

**config/database.js**
- MongoDB connection setup
- Mongoose configuration
- Connection pooling

**models/Asset.js**
- Asset schema with all fields
- Indexes for search optimization
- Virtual properties for computed values
- Pre-save middleware for automatic low-stock and warranty flag calculation

**controllers/assetController.js**
- 11 handler functions for CRUD operations
- Input validation
- Error handling
- Business logic implementation

**routes/assetRoutes.js**
- RESTful API endpoints
- Route protection (ready for authentication)
- Parameter parsing

**server.js**
- Express app initialization
- Middleware setup (CORS, JSON parser)
- Error handling
- Port configuration

### Frontend Files

**components/Dashboard.js**
- Real-time statistics cards
- Low stock alerts section
- Warranty expiration warnings
- Responsive grid layout

**components/AddAsset.js**
- Multi-section form
- Client-side validation
- File organized by asset characteristics
- Success/error feedback

**components/ViewAssets.js**
- Searchable table with filters
- Inline asset details modal
- Quick status updates
- Edit functionality
- Delete capability

**components/StockControl.js**
- Consumables-only view
- Quick +/- quantity buttons
- Real-time stock updates
- Low-stock highlighting
- Statistics dashboard

**services/assetService.js**
- Axios instance configuration
- All API calls centralized
- Query parameter building
- Request/response handling

**styles/*.css**
- Component-specific styling
- CSS variables for theming
- Responsive design breakpoints
- Dark mode ready (extensible)

### Configuration Files

**package.json (Root)**
```json
{
  "scripts": {
    "install-all": "Install both backend & frontend",
    "dev": "Run both servers concurrently",
    "dev-backend": "Run backend only",
    "dev-frontend": "Run frontend only",
    "build": "Production build frontend"
  }
}
```

**package.json (Backend)**
- Dependencies: express, mongoose, cors, dotenv, bcryptjs, jsonwebtoken
- Dev: nodemon

**package.json (Frontend)**
- Dependencies: react, react-dom, react-router-dom, axios
- Build: react-scripts

## API Endpoint Map

```
GET    /api/assets                    # List all (with filters)
POST   /api/assets                    # Create new
GET    /api/assets/stats/dashboard    # Dashboard stats
GET    /api/assets/alerts/low-stock   # Low stock items
GET    /api/assets/alerts/warranty    # Warranty expiring
GET    /api/assets/:id                # Get single
PUT    /api/assets/:id                # Update details
PATCH  /api/assets/:id/status         # Update status
PATCH  /api/assets/:id/quantity       # Update qty (consumables)
DELETE /api/assets/:id                # Delete asset
GET    /api/assets/location/:loc      # By location
```

## Data Flow

### Adding an Asset
1. User fills form in AddAsset component
2. Frontend validates client-side
3. assetService.addAsset() sends POST to /api/assets
4. Backend validates and saves to MongoDB
5. Pre-save middleware calculates flags
6. Response returned with success message
7. Form resets, callback triggers refresh

### Updating Quantity
1. User clicks + or - in StockControl
2. assetService.updateAssetQuantity() sends PATCH
3. Backend updates MongoDB document
4. Pre-save triggers recalculation of isLowStock
5. Response includes updated asset
6. Frontend updates local state immediately
7. Visual feedback if low-stock status changes

### Searching Assets
1. User types in search/filter fields
2. onChange handler updates filter state
3. assetService.getAllAssets(filters) called
4. Query parameters built in service
5. Backend receives filters, constructs MongoDB query
6. Results returned and displayed in table
7. User can expand details for inline editing

## Technology Decisions

**Why MERN Stack?**
- MongoDB: Flexible schema for asset variations
- Express: Lightweight, fast API development
- React: Component reusability, state management
- Node.js: JavaScript across full stack

**Database Approach:**
- Single Collection: All asset types in one table
- Indexes: Optimized for common searches
- Virtual Properties: Computed fields without storage overhead
- Pre-save Middleware: Automatic flag calculations

**Frontend Architecture:**
- Service Layer: Separation of concerns
- Component-based: Easy to extend and maintain
- CSS Modules: Namespace isolation (expandable)
- React Router: Multi-page user experience

## Deployment Ready

- Separate frontend/backend directories
- Environment configuration with .env
- CORS configured properly
- Error handling throughout
- Production build script ready
- Docker-ready structure (can add Dockerfile)

## Extensibility Points

1. **Authentication**: Add JWT middleware to routes
2. **Authorization**: Role-based access control in controllers
3. **Database**: Add indexes, denormalization as scale increases
4. **Frontend**: Component library integration (Material-UI, Bootstrap)
5. **API**: GraphQL migration path exists
6. **Notifications**: Email/SMS integration point
7. **Storage**: Image uploads for asset photos
8. **Reporting**: Export to Excel/PDF

## Development Workflow

```
1. Make changes to backend code
2. Backend automatically restarts (nodemon)
3. Make changes to frontend code  
4. Frontend hot-reloads (react-scripts)
5. Test in browser http://localhost:3000
6. Verify API calls in Network tab
7. Check console for errors
8. Commit changes to git
```

---

This structure provides a solid foundation for a production-grade asset management system with room for growth and enhancement.
