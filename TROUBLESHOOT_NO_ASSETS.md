# Troubleshooting - No Assets Showing in Issue Form

## Issue
When trying to create a new issue in Lab Assistant Dashboard, the Asset dropdown shows "Select Asset" but no assets are visible or selectable.

## Root Cause
The database may not have any assets yet. The Issue form requires existing assets to be able to create an issue.

## Solution: Add Test Assets

### Method 1: Using the "Add Asset" Form (Easiest)

1. In the app (when logged in as Lab Assistant), click "Add Asset"
2. Fill in the form with sample data:
   - **Asset Name**: Oscilloscope
   - **Category**: Electronics
   - **Asset Type**: non-consumable
   - **Brand**: Tektronix
   - **Model**: MSO4102B
   - **Serial Number**: TEK123456
   - **Lab Location**: ECE Lab 1
   - **Condition**: Active
   - **Quantity**: 1
3. Click "Add Asset"
4. Repeat for more assets (to have options in the dropdown)

### Method 2: Using MongoDB Compass (Direct Database Insert)

1. Open MongoDB Compass
2. Connect to your MongoDB instance (usually `mongodb://localhost:27017`)
3. Navigate to your database (default: `asset_management_db`)
4. Open the `assets` collection
5. Click "Insert Document"
6. Paste this sample asset:

```json
{
  "assetName": "Multimeter",
  "category": "Electronics",
  "assetType": "non-consumable",
  "brand": "Fluke",
  "model": "87V",
  "serialNumber": "FLUKE001",
  "quantity": 1,
  "minQuantity": 0,
  "labLocation": "ECE Lab 1",
  "warrantyExpiryDate": "2027-02-19",
  "status": "active",
  "condition": "good",
  "purchaseDate": "2023-02-19",
  "cost": 5000,
  "maintenanceCycleDays": 90
}
```

### Method 3: Using Postman/cURL (API call)

**POST to**: `http://localhost:5000/api/assets`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "assetName": "Power Supply",
  "category": "Electronics",
  "assetType": "non-consumable",
  "brand": "ISO-TECH",
  "model": "IPS3010",
  "serialNumber": "ISO123",
  "quantity": 1,
  "minQuantity": 0,
  "labLocation": "ECE Lab 1",
  "warrantyExpiryDate": "2027-02-19",
  "status": "active",
  "condition": "good",
  "purchaseDate": "2023-02-19",
  "cost": 15000,
  "maintenanceCycleDays": 180
}
```

### Method 4: Bulk Insert with MongoDB Shell

Run this in MongoDB shell or MongoDB Compass Script editor:

```javascript
db.assets.insertMany([
  {
    "assetName": "Oscilloscope",
    "category": "Electronics",
    "assetType": "non-consumable",
    "brand": "Tektronix",
    "model": "MSO4102B",
    "serialNumber": "TEK123456",
    "quantity": 1,
    "minQuantity": 0,
    "labLocation": "ECE Lab 1",
    "status": "active",
    "condition": "good",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "assetName": "Multimeter",
    "category": "Electronics",
    "assetType": "non-consumable",
    "brand": "Fluke",
    "model": "87V",
    "serialNumber": "FLUKE001",
    "quantity": 1,
    "minQuantity": 0,
    "labLocation": "Mechanical Lab",
    "status": "active",
    "condition": "good",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "assetName": "Soldering Iron",
    "category": "Tools",
    "assetType": "non-consumable",
    "brand": "Weller",
    "model": "WES51",
    "serialNumber": "WEL001",
    "quantity": 5,
    "minQuantity": 2,
    "labLocation": "ECE Lab 1",
    "status": "active",
    "condition": "good",
    "createdAt": new Date(),
    "updatedAt": new Date()
  }
])
```

## Verification

After adding assets, refresh the app (F5 or Cmd+R) and check:

1. **Lab Assistant Dashboard**:
   - Click "Create New Issue"
   - Asset dropdown should now show multiple options
   - You can see asset names and serial numbers

2. **Browser Console**:
   - Open DevTools (F12)
   - Go to Console tab
   - You should see:
     ```
     Assets response: { data: { success: true, count: 3, data: [...] } }
     Extracted assets array: [...]
     ```

## If Assets Still Don't Show

### Step 1: Check Backend Connection
```bash
# Test if backend is running
curl http://localhost:5000/api/health
# Should return: { "success": true, "message": "Server is running" }
```

### Step 2: Verify Assets in Database
```bash
# Using curl (will show all assets)
curl http://localhost:5000/api/assets
```

### Step 3: Check Browser Console
1. Open DevTools (F12)
2. Go to "Console" tab
3. Look for errors or warning logs
4. Check "Network" tab for failed API calls

### Step 4: Restart Frontend
1. Stop frontend: `Ctrl+C`
2. Wait 2 seconds
3. Start frontend: `npm start`
4. Refresh browser: `F5`

### Step 5: Clear Browser Cache
1. DevTools → Application → Clear Site Data
2. Refresh page

## Sample Workflow After Adding Assets

1. **Add Assets** using one of the methods above
2. **Refresh the app** (F5)
3. **Lab Assistant Dashboard**:
   - Click "Create New Issue"
   - Select an asset from dropdown ✓
   - Fill in other details
   - Add checklist items
   - Submit
4. **Lab Technician Dashboard**:
   - You'll see the pending issue
   - Accept it
   - Mark as In Progress
   - Resolve it
5. **Back to Lab Assistant**:
   - See the resolved issue
   - Close it

## Quick Test Data Summary

| Asset | Type | Lab | Serial |
|-------|------|-----|--------|
| Oscilloscope | Electronics | ECE Lab 1 | TEK123456 |
| Multimeter | Electronics | Mechanical Lab | FLUKE001 |
| Soldering Iron | Tools | ECE Lab 1 | WEL001 |

---

**Note**: Once you have at least one asset in the database, the Asset dropdown will work perfectly for creating issues!
