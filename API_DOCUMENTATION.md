# Asset Management API - Complete Documentation

## Base URL
```
http://localhost:5000/api
```

## Authorization
Currently no authentication required. JWT middleware can be added in routes.

---

## 📊 Assets Endpoints

### 1. Add New Asset
**Endpoint:** `POST /assets`

**Description:** Create a new asset in the system.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "assetName": "Oscilloscope (required)",
  "category": "Electronics (required)",
  "assetType": "non-consumable (required) | consumable",
  "brand": "Agilent (optional)",
  "model": "DSO-X 2002A (optional)",
  "serialNumber": "SN123456 (optional, required for non-consumables)",
  "quantity": 1,
  "minQuantity": 0,
  "labLocation": "ECE Lab 1 (required)",
  "purchaseDate": "2026-02-01",
  "purchaseCost": 5000,
  "warrantyExpiryDate": "2028-02-01",
  "status": "available (default)",
  "condition": "good (default)",
  "supplier": "Supplier Name (optional)",
  "invoiceNumber": "INV-001 (optional)",
  "notes": "Any additional notes"
}
```

**Required Fields:**
- `assetName`
- `category`
- `assetType`
- `labLocation`

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Asset added successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "assetName": "Oscilloscope",
    "category": "Electronics",
    "assetType": "non-consumable",
    "brand": "Agilent",
    "model": "DSO-X 2002A",
    "serialNumber": "SN123456",
    "quantity": 1,
    "minQuantity": 0,
    "labLocation": "ECE Lab 1",
    "purchaseDate": "2026-02-01T00:00:00.000Z",
    "purchaseCost": 5000,
    "warrantyExpiryDate": "2028-02-01T00:00:00.000Z",
    "status": "available",
    "condition": "good",
    "supplier": "Supplier Name",
    "invoiceNumber": "INV-001",
    "notes": "Any notes",
    "isLowStock": false,
    "isWarrantyExpiring": false,
    "createdAt": "2026-02-11T10:30:45.123Z",
    "updatedAt": "2026-02-11T10:30:45.123Z"
  }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

---

### 2. Get All Assets (with Filters)
**Endpoint:** `GET /assets`

**Description:** Retrieve all assets with optional filtering and sorting.

**Query Parameters:**
```
?search=oscilloscope              // Search by name or serial
&labLocation=ECE Lab 1            // Filter by location
&category=Electronics             // Filter by category
&status=available                 // Filter by status
&sortBy=warrantyExpiring|lowStock // Sort by field
```

**Example:**
```
GET /assets?search=oscil&category=Electronics&status=available
```

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "assetName": "Oscilloscope",
      "category": "Electronics",
      ...
    },
    ...
  ]
}
```

---

### 3. Get Single Asset
**Endpoint:** `GET /assets/:id`

**Description:** Retrieve detailed information about a specific asset.

**Parameters:**
```
:id (required) - Asset MongoDB ID
```

**Example:**
```
GET /assets/507f1f77bcf86cd799439011
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "assetName": "Oscilloscope",
    ...
  }
}
```

**Error Response:** `404 Not Found`
```json
{
  "success": false,
  "message": "Asset not found"
}
```

---

### 4. Update Asset Details
**Endpoint:** `PUT /assets/:id`

**Description:** Update any fields of an existing asset.

**Parameters:**
```
:id (required) - Asset MongoDB ID
```

**Request Body:** (send only fields to update)
```json
{
  "brand": "Keysight",
  "model": "DSOX2004A",
  "purchaseCost": 5500,
  "notes": "Updated notes",
  "minQuantity": 5
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Asset updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "assetName": "Oscilloscope",
    "brand": "Keysight",
    ...
  }
}
```

---

### 5. Update Asset Status
**Endpoint:** `PATCH /assets/:id/status`

**Description:** Change the status of an asset.

**Parameters:**
```
:id (required) - Asset MongoDB ID
```

**Request Body:**
```json
{
  "status": "in_use" // available | in_use | under_maintenance | disposed
}
```

**Valid Status Values:**
- `available` - Ready for use
- `in_use` - Currently issued
- `under_maintenance` - Not usable
- `disposed` - Permanently removed

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Asset status updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "assetName": "Oscilloscope",
    "status": "in_use",
    ...
  }
}
```

---

### 6. Update Asset Quantity (Consumables)
**Endpoint:** `PATCH /assets/:id/quantity`

**Description:** Increase or decrease the quantity of a consumable asset.

**Parameters:**
```
:id (required) - Asset MongoDB ID
```

**Request Body:**
```json
{
  "quantityChange": 5  // Positive to increase, negative to decrease
}
```

**Examples:**
```json
{"quantityChange": 10}   // Add 10 units
{"quantityChange": -3}   // Remove 3 units
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Asset quantity updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "assetName": "Resistor Pack",
    "quantity": 45,
    "minQuantity": 10,
    ...
  },
  "isLowStock": false
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Quantity cannot be negative"
}
```

---

### 7. Delete Asset
**Endpoint:** `DELETE /assets/:id`

**Description:** Remove an asset from the system permanently.

**Parameters:**
```
:id (required) - Asset MongoDB ID
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Asset deleted successfully",
  "data": {}
}
```

---

## 🚨 Alert Endpoints

### 8. Get Low Stock Assets
**Endpoint:** `GET /assets/alerts/low-stock`

**Description:** Retrieve all consumable items with quantity below minimum.

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "assetName": "Resistor Pack",
      "quantity": 5,
      "minQuantity": 10,
      "isLowStock": true,
      "labLocation": "ECE Lab 1",
      ...
    },
    ...
  ]
}
```

---

### 9. Get Warranty Expiring Assets
**Endpoint:** `GET /assets/alerts/warranty-expiring`

**Description:** Retrieve all assets with warranty expiring within 30 days.

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "assetName": "Oscilloscope",
      "warrantyExpiryDate": "2026-03-10T00:00:00.000Z",
      "isWarrantyExpiring": true,
      "labLocation": "ECE Lab 1",
      ...
    },
    ...
  ]
}
```

---

## 📊 Statistics Endpoints

### 10. Get Assets by Location
**Endpoint:** `GET /assets/location/:labLocation`

**Description:** Get all assets in a specific lab location.

**Parameters:**
```
:labLocation (required) - Lab location name
```

**Example:**
```
GET /assets/location/ECE%20Lab%201
```

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 12,
  "data": [...]
}
```

---

### 11. Get Dashboard Statistics
**Endpoint:** `GET /assets/stats/dashboard`

**Description:** Get summary statistics for the dashboard.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalAssets": 45,
    "availableAssets": 35,
    "inUseAssets": 8,
    "underMaintenanceAssets": 2,
    "lowStockAssets": 3,
    "warrantyExpiringAssets": 2,
    "categories": [
      "Electronics",
      "Mechanical",
      "Computer",
      "Civil",
      "Tools"
    ],
    "labLocations": [
      "ECE Lab 1",
      "ECE Lab 2",
      "Mechanical Workshop",
      "Computer Lab",
      "Main Store"
    ]
  }
}
```

---

## ❤️ Health Check

**Endpoint:** `GET /health`

**Description:** Simple endpoint to verify server is running.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Server is running"
}
```

---

## Error Codes

| Code | Message | Meaning |
|------|---------|---------|
| 200 | OK | Request successful |
| 201 | Created | Asset successfully created |
| 400 | Bad Request | Invalid input or missing required fields |
| 404 | Not Found | Asset ID not found |
| 500 | Internal Server Error | Server error occurred |

---

## Data Types Reference

### Asset Type Enum
```
"consumable" - High quantity items (resistors, chemicals, wires)
"non-consumable" - Single unit items (oscilloscope, microscope)
```

### Status Enum
```
"available" - Ready for use
"in_use" - Currently issued to someone
"under_maintenance" - Broken or being serviced
"disposed" - Permanently removed from inventory
```

### Condition Enum
```
"excellent" - Like new
"good" - Normal wear and tear
"fair" - Some damage but functional
"damaged" - Not functional
```

---

## Request Examples Using cURL

### Add a New Asset
```bash
curl -X POST http://localhost:5000/api/assets \
  -H "Content-Type: application/json" \
  -d '{
    "assetName": "Oscilloscope",
    "category": "Electronics",
    "assetType": "non-consumable",
    "brand": "Agilent",
    "labLocation": "ECE Lab 1",
    "serialNumber": "SN123456"
  }'
```

### Get All Assets
```bash
curl http://localhost:5000/api/assets
```

### Search Assets
```bash
curl "http://localhost:5000/api/assets?search=oscilloscope&category=Electronics"
```

### Update Quantity
```bash
curl -X PATCH http://localhost:5000/api/assets/[ID]/quantity \
  -H "Content-Type: application/json" \
  -d '{"quantityChange": 5}'
```

### Get Low Stock Items
```bash
curl http://localhost:5000/api/assets/alerts/low-stock
```

---

## Response Format

All responses follow this format:

**Success:**
```json
{
  "success": true,
  "message": "Optional message",
  "data": {...} or [...]
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Rate Limiting
Currently no rate limiting implemented. Can be added using `express-rate-limit` middleware.

---

## Pagination
Currently not implemented. Can be added with `skip` and `limit` query parameters.

---

## Version
API Version: 1.0.0  
Last Updated: February 2026

---

## Support
For API issues, check the backend console logs and ensure MongoDB is connected.
