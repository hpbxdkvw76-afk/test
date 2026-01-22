/**
 * MongoDB Database Schema and Configuration
 * Collections: Users, Devices, Transactions
 */

// ==================== DATABASE CONFIGURATION ====================

/**
 * Connection String Options:
 * 
 * Local MongoDB:
 * mongodb://localhost:27017/banking-app
 * 
 * MongoDB Atlas Cloud:
 * mongodb+srv://username:password@cluster.mongodb.net/banking-app
 * 
 * Environment Variable (.env):
 * MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/banking-app
 */

// ==================== USER COLLECTION ====================

/**
 * Users Collection Schema
 * Purpose: Store user account information
 */

db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password"],
      properties: {
        _id: { bsonType: "objectId" },
        
        // Authentication
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "User email (unique)"
        },
        password: {
          bsonType: "string",
          description: "Hashed password (bcrypt)"
        },
        
        // Account
        balance: {
          bsonType: "double",
          description: "Account balance in USD",
          minimum: 0
        },
        status: {
          enum: ["active", "blocked", "suspended"],
          description: "account status"
        },
        
        // Profile
        fullName: { bsonType: "string" },
        phone: { bsonType: "string" },
        address: { bsonType: "string" },
        dateOfBirth: { bsonType: "date" },
        
        // Verification
        emailVerified: { bsonType: "bool", default: false },
        phoneVerified: { bsonType: "bool", default: false },
        kycVerified: { bsonType: "bool", default: false },
        
        // Limits
        dailyTransferLimit: {
          bsonType: "double",
          description: "Daily transfer limit",
          default: 10000        },
        monthlyTransferLimit: {
          bsonType: "double",
          description: "Monthly transfer limit",
          default: 50000
        },
        
        // Security
        twoFactorEnabled: { bsonType: "bool", default: false },
        lastLoginAt: { bsonType: "date" },
        passwordChangedAt: { bsonType: "date" },
        
        // Metadata
        createdAt: { bsonType: "date", default: new Date() },
        updatedAt: { bsonType: "date", default: new Date() },
        lastModifiedBy: { bsonType: "objectId" }
      }
    }
  }
});

// Indexes for Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ status: 1 });
db.users.createIndex({ createdAt: -1 });

// ==================== DEVICE COLLECTION ====================

/**
 * Devices Collection Schema
 * Purpose: Store device fingerprints and trust status
 */

db.createCollection("devices", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "fingerprint"],
      properties: {
        _id: { bsonType: "objectId" },
        
        // Device Owner
        userId: {
          bsonType: "objectId",
          description: "Reference to User document"
        },
        
        // Device Fingerprint
        fingerprint: {
          bsonType: "string",
          description: "SHA-256 hash of device information (unique)"
        },
        
        // Device Information
        deviceInfo: {
          bsonType: "object",
          properties: {
            deviceId: { bsonType: "string" },
            deviceBrand: { bsonType: "string" },
            deviceModel: { bsonType: "string" },
            osVersion: { bsonType: "string" },
            appVersion: { bsonType: "string" },
            buildId: { bsonType: "string" },
            platform: {
              enum: ["ios", "android"],
              description: "Operating system platform"
            },
            manufacturer: { bsonType: "string" }
          }
        },
        
        // Trust Status
        trustStatus: {
          enum: ["pending", "trusted", "restricted"],
          description: "Device verification status"
        },
        isTrusted: {
          bsonType: "bool",
          description: "Quick access to trust status"
        },
        
        // Risk Assessment
        riskScore: {
          bsonType: "double",
          minimum: 0,
          maximum: 1,
          description: "AI-assessed risk score (0=safe, 1=high risk)"
        },
        riskReason: {
          bsonType: "string",
          description: "Reason for risk score"
        },
        
        // Activity
        lastLogin: { bsonType: "date" },
        trustedDate: { bsonType: "date" },
        lastLocationEstimate: { bsonType: "string" },
        failedLoginAttempts: { bsonType: "int", default: 0 },
        
        // Metadata
        createdAt: { bsonType: "date", default: new Date() },
        updatedAt: { bsonType: "date", default: new Date() }
      }
    }
  }
});

// Indexes for Devices
db.devices.createIndex({ userId: 1 });
db.devices.createIndex({ fingerprint: 1 }, { unique: true });
db.devices.createIndex({ trustStatus: 1 });
db.devices.createIndex({ userId: 1, trustStatus: 1 });
db.devices.createIndex({ userId: 1, createdAt: -1 });

// ==================== TRANSACTION COLLECTION ====================

/**
 * Transactions Collection Schema
 * Purpose: Store money transfer transactions
 */

db.createCollection("transactions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["senderId", "recipientEmail", "amount"],
      properties: {
        _id: { bsonType: "objectId" },
        
        // Parties
        senderId: {
          bsonType: "objectId",
          description: "Reference to sender User document"
        },
        recipientEmail: {
          bsonType: "string",
          description: "Recipient email address"
        },
        
        // Transaction Details
        amount: {
          bsonType: "double",
          minimum: 0.01,
          description: "Transfer amount in USD"
        },
        currency: {
          bsonType: "string",
          default: "USD",
          description: "Currency code"
        },
        purpose: {
          bsonType: "string",
          description: "Transaction purpose (optional)"
        },
        referenceNumber: {
          bsonType: "string",
          description: "Unique reference number"
        },
        
        // Device Information
        deviceFingerprint: {
          bsonType: "string",
          description: "Device fingerprint used for transaction"
        },
        deviceInfo: {
          bsonType: "object",
          description: "Device details at time of transaction"
        },
        
        // Status
        status: {
          enum: ["pending", "completed", "failed", "blocked", "cancelled"],
          description: "Transaction status"
        },
        
        // Fraud Detection
        fraudDetection: {
          bsonType: "object",
          properties: {
            riskScore: {
              bsonType: "double",
              minimum: 0,
              maximum: 1,
              description: "Overall fraud risk score"
            },
            alerts: {
              bsonType: "array",
              items: { bsonType: "string" },
              description: "List of fraud alerts"
            },
            aiAnalysis: {
              bsonType: "string",
              description: "AI model analysis explanation"
            },
            reviewedBy: {
              bsonType: "objectId",
              description: "Admin who reviewed the transaction"
            },
            reviewedAt: {
              bsonType: "date",
              description: "When transaction was reviewed"
            }
          }
        },
        
        // Additional Rules
        additionalRules: {
          bsonType: "object",
          description: "Output from fraud detection system",
          properties: {
            amountSpike: { bsonType: "bool" },
            velocityCheck: { bsonType: "bool" },
            locationJump: { bsonType: "bool" },
            deviceChange: { bsonType: "bool" },
            unusualTime: { bsonType: "bool" },
            blacklistMatch: { bsonType: "bool" }
          }
        },
        
        // Verification
        otp: { bsonType: "string" },
        otpVerified: { bsonType: "bool", default: false },
        otpVerifiedAt: { bsonType: "date" },
        
        // Timeline
        createdAt: { bsonType: "date", default: new Date() },
        completedAt: { bsonType: "date" },
        failedAt: { bsonType: "date" },
        failureReason: { bsonType: "string" },
        
        // Tracking
        ipAddress: { bsonType: "string" },
        userAgent: { bsonType: "string" }
      }
    }
  }
});

// Indexes for Transactions
db.transactions.createIndex({ senderId: 1 });
db.transactions.createIndex({ recipientEmail: 1 });
db.transactions.createIndex({ status: 1 });
db.transactions.createIndex({ senderId: 1, createdAt: -1 });
db.transactions.createIndex({ createdAt: -1 });
db.transactions.createIndex({ "fraudDetection.riskScore": 1 });

// ==================== AUDIT LOG COLLECTION ====================

/**
 * Audit Logs Collection
 * Purpose: Track all important system events
 */

db.createCollection("auditLogs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["eventType", "timestamp"],
      properties: {
        _id: { bsonType: "objectId" },
        
        eventType: {
          enum: [
            "LOGIN", "LOGOUT", "REGISTER",
            "DEVICE_TRUSTED", "DEVICE_BLOCKED",
            "TRANSFER_CREATED", "TRANSFER_COMPLETED", "TRANSFER_BLOCKED",
            "PASSWORD_CHANGED", "2FA_ENABLED", "2FA_DISABLED",
            "ACCOUNT_LOCKED", "ACCOUNT_UNLOCKED"
          ]
        },
        
        userId: { bsonType: "objectId" },
        description: { bsonType: "string" },
        
        previousState: { bsonType: "object" },
        newState: { bsonType: "object" },
        
        ipAddress: { bsonType: "string" },
        userAgent: { bsonType: "string" },
        
        timestamp: { bsonType: "date", default: new Date() }
      }
    }
  }
});

// Indexes for Audit Logs
db.auditLogs.createIndex({ userId: 1 });
db.auditLogs.createIndex({ eventType: 1 });
db.auditLogs.createIndex({ timestamp: -1 });

// ==================== BLACKLIST COLLECTION ====================

/**
 * Blacklist Collection
 * Purpose: Store blocked devices, IPs, merchants
 */

db.createCollection("blacklists", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["entityType", "value"],
      properties: {
        _id: { bsonType: "objectId" },
        
        entityType: {
          enum: ["device", "ip", "email", "merchant"],
          description: "Type of blacklisted entity"
        },
        
        value: {
          bsonType: "string",
          description: "The blacklisted value"
        },
        
        reason: { bsonType: "string" },
        severity: {
          enum: ["low", "medium", "high", "critical"],
          default: "medium"
        },
        
        addedBy: { bsonType: "objectId" },
        addedAt: { bsonType: "date", default: new Date() },
        
        expiresAt: { bsonType: "date" },
        isActive: { bsonType: "bool", default: true }
      }
    }
  }
});

// Indexes for Blacklist
db.blacklists.createIndex({ entityType: 1, value: 1 }, { unique: true });
db.blacklists.createIndex({ isActive: 1 });

// ==================== SAMPLE DATA ====================

// Insert sample user
db.users.insertOne({
  email: "user@example.com",
  password: "$2a$10$...", // Hashed password
  balance: 10000,
  status: "active",
  fullName: "John Doe",
  phone: "+1234567890",
  emailVerified: true,
  dailyTransferLimit: 10000,
  monthlyTransferLimit: 50000,
  twoFactorEnabled: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Insert sample device
db.devices.insertOne({
  userId: ObjectId("..."), // Reference to user
  fingerprint: "abc123def456...",
  deviceInfo: {
    deviceId: "device_001",
    deviceBrand: "Apple",
    deviceModel: "iPhone 14",
    osVersion: "17.0",
    platform: "ios"
  },
  trustStatus: "trusted",
  isTrusted: true,
  riskScore: 0.2,
  riskReason: "Device recognized and trusted",
  lastLogin: new Date(),
  trustedDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
});

// ==================== BACKUP & RESTORE ====================

/**
 * Backup database:
 * mongodump --uri "mongodb://localhost:27017/banking-app" --out ./backup
 * 
 * Restore database:
 * mongorestore --uri "mongodb://localhost:27017/banking-app" ./backup/banking-app
 * 
 * Export to CSV:
 * mongoexport --uri "mongodb://localhost:27017/banking-app" --collection users --out users.csv
 */

// ==================== MAINTENANCE QUERIES ====================

// Find all trusted devices for a user
db.devices.find({ userId: ObjectId("..."), trustStatus: "trusted" });

// Find transactions with high fraud risk
db.transactions.find({ "fraudDetection.riskScore": { $gt: 0.7 } });

// Find pending transactions
db.transactions.find({ status: "pending" });

// Count transactions by status
db.transactions.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
]);

// Get daily transaction volume
db.transactions.aggregate([
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      count: { $sum: 1 },
      totalAmount: { $sum: "$amount" }
    }
  },
  { $sort: { _id: -1 } }
]);

// Find suspicious devices (high risk score)
db.devices.find({ riskScore: { $gt: 0.7 } });

// Get active users
db.users.find({ status: "active" });

// Find failed transfers
db.transactions.find({ status: "failed" });
