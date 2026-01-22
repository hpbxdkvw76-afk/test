# 🏦 Banking App System - Complete Setup Guide

**Complete Mobile Banking Application with Device Verification & AI Security**

Vietnamese: Ứng dụng ngân hàng di động với xác minh thiết bị và bảo mật AI

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Installation](#installation)
5. [Setup Instructions](#setup-instructions)
6. [API Documentation](#api-documentation)
7. [Features](#features)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 System Overview

A complete mobile banking system with:
- ✅ Mobile app frontend (React Native)
- ✅ Node.js backend server
- ✅ MongoDB database
- ✅ AI risk assessment (OpenAI)
- ✅ Device fingerprinting & verification
- ✅ Fraud detection
- ✅ Money transfer control

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│           REACT NATIVE MOBILE APP (Frontend)               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Login      │  │   Dashboard  │  │   Transfers  │     │
│  │   Register   │  │   Device Mgmt│  │   History    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│        Device Fingerprint Service (Generate)               │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│         NODE.JS/EXPRESS BACKEND (Business Logic)            │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Auth       │  │   Device     │  │   Transfers  │     │
│  │   Management │  │   Management │  │   Processing │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │        AI Risk Assessment (OpenAI API)              │  │
│  │  - Device Risk Score                                │  │
│  │  - Transaction Fraud Detection                      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓ Query/Update
┌─────────────────────────────────────────────────────────────┐
│            MONGODB DATABASE (Data Storage)                   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Users      │  │   Devices    │  │ Transactions │     │
│  │   Collection │  │   Collection │  │  Collection  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Audit Logs   │  │  Blacklist   │                        │
│  │ Collection   │  │  Collection  │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Components

### 1. Frontend: React Native Mobile App
**File:** `banking-app-frontend.js`

**Features:**
- User authentication (login/register)
- Device fingerprinting
- Account dashboard
- Money transfer interface
- Device trust management
- Transfer history

**Technology Stack:**
- React Native
- React Native Device Info
- AsyncStorage
- Axios

### 2. Backend: Node.js/Express Server
**File:** `banking-app-backend.js`

**Features:**
- User authentication (JWT)
- Device verification
- Transfer processing
- Fraud detection
- AI risk assessment
- Transaction history

**Technology Stack:**
- Express.js
- MongoDB/Mongoose
- JWT authentication
- OpenAI API
- Bcrypt for password hashing

### 3. Database: MongoDB Schema
**File:** `banking-app-database.js`

**Collections:**
- `users` - User accounts
- `devices` - Device fingerprints & trust status
- `transactions` - Money transfers
- `auditLogs` - System audit trail
- `blacklists` - Blocked devices/IPs/emails

---

## 🚀 Installation

### Prerequisites
- Node.js 14+ and npm
- MongoDB 4.0+
- Expo CLI (for React Native development)
- OpenAI API key

### Step 1: Install Dependencies

**Backend Setup:**
```bash
cd banking-app-backend
npm init -y
npm install express mongoose bcryptjs jsonwebtoken axios dotenv cors
```

**Frontend Setup:**
```bash
# Using Expo
expo init banking-app-frontend
cd banking-app-frontend
npm install react-native-device-info @react-native-async-storage/async-storage axios
```

### Step 2: Environment Variables

Create `.env` file in backend:
```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/banking-app

# JWT Secret
JWT_SECRET=your_secret_key_here_change_in_production

# AI Service
OPENAI_API_KEY=sk-your-openai-api-key-here

# CORS
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19000
```

### Step 3: Start MongoDB

**Local MongoDB:**
```bash
# Windows
mongod

# Linux/Mac
brew services start mongodb-community
```

**Or use MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/banking-app
```

### Step 4: Initialize Database

```bash
node -e "
const mongoose = require('mongoose');
const url = 'mongodb://localhost:27017/banking-app';
mongoose.connect(url, () => {
  console.log('Database initialized');
  process.exit(0);
});
"
```

---

## ⚙️ Setup Instructions

### Backend Setup

**1. Start the server:**
```bash
node banking-app-backend.js
```

**Expected output:**
```
╔════════════════════════════════════════╗
║  Banking App Backend - Node.js        ║
╠════════════════════════════════════════╣
║  Server running on: http://localhost:3000
║  
║  Endpoints:
║  - POST /api/auth/register
║  - POST /api/auth/login
║  - GET /api/devices/status
║  - POST /api/devices/trust
║  - POST /api/transfers/create
║  - GET /api/transfers/history
╚════════════════════════════════════════╝
```

### Frontend Setup

**1. Start Expo server:**
```bash
expo start
```

**2. Choose platform:**
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code for physical device

### Database Setup

**1. Create collections:**
```bash
# Run the MongoDB commands from banking-app-database.js
mongo banking-app
< banking-app-database.js
```

**2. Verify collections:**
```bash
# Check if collections exist
db.getCollectionNames()
```

---

## 📡 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Create new user account

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password_123",
  "deviceFingerprint": {
    "deviceId": "device_001",
    "deviceModel": "iPhone 14",
    "platform": "ios",
    "osVersion": "17.0"
  }
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /api/auth/login
Authenticate user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password_123",
  "deviceFingerprint": { ... }
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "balance": 10000
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Device Management Endpoints

#### GET /api/devices/status
Get current device trust status

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
```
fingerprint={"deviceId":"device_001",...}
```

**Response:**
```json
{
  "isTrusted": true,
  "reason": "Device recognized and trusted",
  "riskScore": 0.2,
  "devices": [
    {
      "model": "iPhone 14",
      "platform": "ios",
      "trustedDate": "2024-01-16T10:30:00Z"
    }
  ]
}
```

#### POST /api/devices/trust
Register current device as trusted

**Request:**
```json
{
  "deviceFingerprint": {
    "deviceId": "device_001",
    "deviceModel": "iPhone 14",
    "platform": "ios"
  }
}
```

**Response:**
```json
{
  "message": "Device trusted successfully"
}
```

### Transfer Endpoints

#### POST /api/transfers/create
Create money transfer

**Request:**
```json
{
  "recipientEmail": "recipient@example.com",
  "amount": 1000.50,
  "purpose": "Payment for services",
  "deviceFingerprint": { ... }
}
```

**Response:**
```json
{
  "message": "Transfer completed",
  "transactionId": "507f1f77bcf86cd799439011",
  "status": "completed",
  "fraudDetection": {
    "riskScore": 0.3,
    "alerts": [],
    "analysis": "Transaction appears normal"
  }
}
```

#### GET /api/transfers/history
Get transaction history

**Response:**
```json
{
  "transactions": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "recipientEmail": "recipient@example.com",
      "amount": 1000.50,
      "status": "completed",
      "fraudDetection": {
        "riskScore": 0.3,
        "alerts": []
      },
      "createdAt": "2024-01-16T10:30:00Z",
      "completedAt": "2024-01-16T10:31:00Z"
    }
  ]
}
```

---

## ✨ Features

### 1. Device Fingerprinting
```javascript
// Captures:
- Device ID
- Device Brand & Model
- OS Version
- App Version
- Platform (iOS/Android)
- Build ID
- Manufacturer
```

### 2. Device Trust System
```
New Device → Pending → AI Risk Assessment → Trusted/Restricted
```

### 3. AI Risk Assessment
```
Evaluates:
- Device characteristics
- User transaction history
- Transfer amount patterns
- Recipient history
- Timing anomalies
```

### 4. Fraud Detection
```
Checks:
- Amount spike
- Velocity testing
- Location jump
- Device change
- Unusual time
- Blacklist match
```

### 5. Security Features
```
- Password hashing (bcrypt)
- JWT token authentication
- Device fingerprinting
- Rate limiting (recommended)
- Audit logging
- Two-factor authentication ready
```

---

## 🧪 Testing

### Test User Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "deviceFingerprint": {
      "deviceId": "test_device",
      "deviceModel": "Test Device",
      "platform": "ios"
    }
  }'
```

### Test User Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "deviceFingerprint": {
      "deviceId": "test_device",
      "deviceModel": "Test Device",
      "platform": "ios"
    }
  }'
```

### Test Device Status
```bash
curl -X GET "http://localhost:3000/api/devices/status?fingerprint=%7B%22deviceId%22%3A%22test_device%22%7D" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Transfer
```bash
curl -X POST http://localhost:3000/api/transfers/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "recipientEmail": "recipient@example.com",
    "amount": 500,
    "purpose": "Test transfer",
    "deviceFingerprint": {"deviceId": "test_device"}
  }'
```

### Test with Postman Collection
Import this JSON into Postman:
```json
{
  "info": {
    "name": "Banking App API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/auth/register",
        "body": {
          "mode": "raw",
          "raw": "{\"email\": \"test@example.com\", \"password\": \"test123\"}"
        }
      }
    }
  ]
}
```

---

## 🔧 Troubleshooting

### Error: MongoDB Connection Failed
**Solution:**
```bash
# Check if MongoDB is running
mongo --version

# Start MongoDB
mongod

# Check connection
mongo mongodb://localhost:27017/banking-app
```

### Error: "Device not trusted for transfers"
**Solution:**
1. Trust the device first using `/api/devices/trust`
2. Wait for AI risk assessment to complete
3. Ensure risk score < 0.8

### Error: "Invalid token"
**Solution:**
```bash
# Ensure token is included in header
Authorization: Bearer {token_from_login}

# Token expires in 7 days by default
```

### Error: OpenAI API Rate Limit
**Solution:**
```env
# Update API key limits in OpenAI dashboard
# Or implement rate limiting in backend
```

### Error: CORS Issues
**Solution:**
Update backend CORS settings:
```javascript
app.use(cors({
  origin: ['http://localhost:19000', 'http://192.168.1.100:8081'],
  credentials: true
}));
```

### Error: Device Fingerprint Mismatch
**Solution:**
```javascript
// Ensure fingerprint is generated consistently
// Same device should always produce same fingerprint hash
// Check for:
- Device ID changes
- OS updates
- App reinstalls
```

---

## 📊 Database Query Examples

### Find user by email
```javascript
db.users.findOne({ email: "user@example.com" })
```

### Get all trusted devices for user
```javascript
db.devices.find({ 
  userId: ObjectId("..."), 
  trustStatus: "trusted" 
})
```

### Get high-risk transactions
```javascript
db.transactions.find({ 
  "fraudDetection.riskScore": { $gt: 0.7 }
})
```

### Get daily transaction count
```javascript
db.transactions.aggregate([
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      count: { $sum: 1 },
      totalAmount: { $sum: "$amount" }
    }
  }
])
```

---

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit API keys 
   - Use strong JWT secret
   - Change default passwords

2. **Database**
   - Enable MongoDB authentication
   - Use connection encryption
   - Regular backups

3. **API**
   - Implement rate limiting
   - Add HTTPS in production
   - Validate all inputs
   - Implement CSRF protection

4. **Frontend**
   - Store tokens securely
   - Implement certificate pinning
   - Never store sensitive data locally

5. **Monitoring**
   - Log all transactions
   - Alert on suspicious activity
   - Regular security audits

---

## 📈 Performance Optimization

```javascript
// Add caching layer
// Implement database indexing
// Use connection pooling
// Compress API responses
// Optimize database queries
```

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review API documentation
3. Check database logs
4. Monitor OpenAI API status

---

**Version:** 1.0.0
**Last Updated:** January 2024
**Author:** Banking App Team
