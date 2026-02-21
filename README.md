# Asset Management Software for Lab Assistants

A comprehensive MERN (MongoDB, Express, React, Node.js) stack-based Asset Management System designed specifically for laboratory assistants to efficiently manage, track, and control lab equipment and consumables.

## Features

### 1. **Dashboard**
- Real-time overview of all assets
- Total assets count
- Asset status distribution (Available, In Use, Under Maintenance, Disposed)
- Low stock alerts for consumables
- Warranty expiration warnings (30-day alert)
- Quick access to critical information

### 2. **Add New Asset**
- Comprehensive form for adding assets with all details
- Support for both consumable and non-consumable items
- Automatic validation of required fields
- Duplicate serial number prevention
- Real-time feedback on successful asset addition

### 3. **View & Search Assets**
- Advanced search by asset name or serial number
- Filter by:
  - Lab location
  - Category
  - Status (Available, In Use, Under Maintenance, Disposed)
- View detailed asset information
- Edit asset details (brand, model, dates, costs, notes, etc.)
- Quick status update dropdowns
- Delete assets if needed

### 4. **Stock Control (Consumables)**
- Dedicated interface for managing consumable items
- Increment/Decrement quantity with one click
- Low stock indicators with automatic alerts
- Real-time stock level updates
- Minimum stock level management
- Stock statistics overview

### 5. **Asset Status Management**
- Easy status updates:
  - Available (Ready for use)
  - In Use (Currently issued)
  - Under Maintenance (Not usable)
  - Disposed (Permanently removed)

## Project Structure

```
AssetManagement/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   └── assetController.js   # Business logic for assets
│   ├── models/
│   │   └── Asset.js             # MongoDB schema
│   ├── routes/
│   │   └── assetRoutes.js       # API endpoints
│   ├── middleware/              # Custom middleware (if needed)
│   ├── .env.example             # Environment variables template
│   ├── package.json
│   └── server.js                # Main server file
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.js      # Dashboard component
    │   │   ├── AddAsset.js       # Add asset form
    │   │   ├── ViewAssets.js     # Asset inventory & editing
    │   │   └── StockControl.js   # Stock management
    │   ├── services/
    │   │   └── assetService.js   # API calls
    │   ├── styles/
    │   │   ├── index.css         # Global styles
    │   │   ├── App.css
    │   │   ├── Dashboard.css
    │   │   ├── AddAsset.css
    │   │   ├── ViewAssets.css
    │   │   └── StockControl.css
    │   ├── App.js                # Main application
    │   ├── index.js
    ├── package.json
    └── .gitignore
```

## Technology Stack

- **Frontend**: React 18, React Router DOM 6, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (ready for implementation)
- **Styling**: CSS3 with responsive design

## Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
MONGODB_URI=mongodb://localhost:27017/asset-management
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=http://localhost:3000
```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Assets

- `GET /api/assets` - Get all assets (with filters)
- `POST /api/assets` - Add new asset
- `GET /api/assets/:id` - Get single asset
- `PUT /api/assets/:id` - Update asset details
- `PATCH /api/assets/:id/status` - Update asset status
- `PATCH /api/assets/:id/quantity` - Update asset quantity (consumables)
- `DELETE /api/assets/:id` - Delete asset
- `GET /api/assets/location/:labLocation` - Get assets by lab
- `GET /api/assets/alerts/low-stock` - Get low stock consumables
- `GET /api/assets/alerts/warranty-expiring` - Get expiring warranties
- `GET /api/assets/stats/dashboard` - Get dashboard statistics

### Query Parameters for GET /api/assets

- `search` - Search by name or serial number
- `labLocation` - Filter by lab location
- `category` - Filter by category
- `status` - Filter by status
- `sortBy` - Sort by field (warrantyExpiring, lowStock)

## Asset Schema

```javascript
{
  assetName: String (required),
  category: String (required),
  assetType: "consumable" | "non-consumable" (required),
  brand: String,
  model: String,
  serialNumber: String (unique for non-consumables),
  quantity: Number (default: 1),
  minQuantity: Number (default: 0),
  labLocation: String (required),
  purchaseDate: Date,
  purchaseCost: Number,
  warrantyExpiryDate: Date,
  status: "available" | "in_use" | "under_maintenance" | "disposed" (default: "available"),
  condition: "excellent" | "good" | "fair" | "damaged" (default: "good"),
  supplier: String,
  invoiceNumber: String,
  notes: String,
  isLowStock: Boolean,
  isWarrantyExpiring: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Usage Guide

### Adding a New Asset
1. Navigate to "Add Asset" tab
2. Fill in the required fields (Asset Name, Category, Type, Lab Location)
3. Fill in optional details (brand, model, costs, warranty info)
4. Click "Add Asset" button

### Managing Inventory
1. Go to "View Assets" tab
2. Use filters to find specific assets
3. Click "View/Edit" to modify details
4. Quick status change using dropdown
5. Delete if asset is removed

### Stock Control
1. Navigate to "Stock Control" tab
2. View all consumable items
3. Use + button to increase stock
4. Use - button to decrease stock
5. Automatic low-stock alerts appear when quantity < minimum

### Monitoring Alerts
- **Dashboard** shows:
  - Low stock items
  - Warranty expiring within 30 days
  - Asset status distribution

## Future Enhancements

- User authentication and role-based access
- Asset maintenance history tracking
- Barcode/QR code generation for quick scanning
- Export reports (Excel, PDF)
- Asset depreciation calculation
- Email notifications for alerts
- Multi-user support with audit logs
- Mobile app version
- Integration with procurement system

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/asset-management
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=http://localhost:3000
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify MongoDB port (default: 27017)

### Port Already in Use
- Frontend default: 3000
- Backend default: 5000
- Change ports in respective config files if needed

### CORS Error
- Check FRONTEND_URL in backend .env
- Ensure server.js has cors middleware enabled

## License

ISC License

## Support

For issues or questions, please reach out to the development team.

---

**Author**: Asset Management Team  
**Created**: February 2026  
**Version**: 1.0.0
