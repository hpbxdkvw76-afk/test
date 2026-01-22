/**
 * Banking App - Configuration & Examples
 */

// ==================== ENVIRONMENT CONFIGURATION ====================

/**
 * Create .env file in project root:
 * 
 * # Server Configuration
 * PORT=3000
 * NODE_ENV=development
 * 
 * # Database
 * MONGODB_URI=mongodb://localhost:27017/banking-app
 * # Or MongoDB Atlas:
 * # MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/banking-app
 * 
 * # Security
 * JWT_SECRET=your_secret_key_here_minimum_32_chars
 * JWT_EXPIRES_IN=7d
 * 
 * # AI Service
 * OPENAI_API_KEY=sk-your-openai-api-key-here
 * OPENAI_MODEL=gpt-3.5-turbo
 * 
 * # CORS
 * ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19000,http://192.168.1.100:8081
 * 
 * # Security
 * BCRYPT_ROUNDS=10
 * RATE_LIMIT_WINDOW=15 # minutes
 * RATE_LIMIT_MAX_REQUESTS=100
 */

// ==================== DEVELOPMENT SETUP ====================

/**
 * 1. Install Node.js
 *    Download: https://nodejs.org/
 *    Recommended: LTS version
 * 
 * 2. Install MongoDB Community
 *    Download: https://www.mongodb.com/try/download/community
 *    Or use MongoDB Atlas: https://www.mongodb.com/cloud/atlas
 * 
 * 3. Get OpenAI API Key
 *    Signup: https://platform.openai.com/
 *    Create API key at: https://platform.openai.com/account/api-keys
 * 
 * 4. Install Project Dependencies
 *    npm install
 * 
 * 5. Configure .env file
 *    See example above
 * 
 * 6. Start Development Server
 *    npm run dev
 * 
 * 7. Start Frontend
 *    expo start
 */

// ==================== API REQUEST EXAMPLES ====================

// Example 1: User Registration
const registerExample = {
  url: 'http://localhost:3000/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: {
    email: 'john.doe@example.com',
    password: 'SecurePassword123!',
    deviceFingerprint: {
      deviceId: 'device_iphone_14_001',
      deviceBrand: 'Apple',
      deviceModel: 'iPhone 14',
      osVersion: '17.0',
      appVersion: '1.0.0',
      buildId: 'build_001',
      platform: 'ios',
      manufacturer: 'Apple'
    }
  },
  expectedResponse: {
    message: 'User registered successfully',
    user: {
      id: '507f1f77bcf86cd799439011',
      email: 'john.doe@example.com'
    },
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
};

// Example 2: User Login
const loginExample = {
  url: 'http://localhost:3000/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: {
    email: 'john.doe@example.com',
    password: 'SecurePassword123!',
    deviceFingerprint: {
      deviceId: 'device_iphone_14_001',
      deviceBrand: 'Apple',
      deviceModel: 'iPhone 14',
      osVersion: '17.0',
      appVersion: '1.0.0',
      buildId: 'build_001',
      platform: 'ios',
      manufacturer: "apple"
    }
  },
  expectedResponse: {
    message: 'Login successful',
    user: {
      id: '507f1f77bcf86cd799439011',
      email: 'john.doe@example.com',
      balance: 10000
    },
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
};

// Example 3: Check Device Status
const deviceStatusExample = {
  url: 'http://localhost:3000/api/devices/status?fingerprint=%7B%22deviceId%22%3A%22device_iphone_14_001%22%7D',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  expectedResponse: {
    isTrusted: false,
    reason: 'Device not found in trusted list',
    riskScore: 0.7,
    devices: [
      {
        model: 'iPhone 14',
        platform: 'ios',
        trustedDate: '2024-01-16T10:30:00Z'
      }
    ]
  }
};

// Example 4: Trust Device
const trustDeviceExample = {
  url: 'http://localhost:3000/api/devices/trust',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'Content-Type': 'application/json'
  },
  body: {
    deviceFingerprint: {
      deviceId: 'device_iphone_14_001',
      deviceBrand: 'Apple',
      deviceModel: 'iPhone 14',
      osVersion: '17.0',
      appVersion: '1.0.0',
      buildId: 'build_001',
      platform: 'ios',
      manufacturer: 'Apple'
    }
  },
  expectedResponse: {
    message: 'Device trusted successfully'
  }
};

// Example 5: Create Money Transfer
const transferExample = {
  url: 'http://localhost:3000/api/transfers/create',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'Content-Type': 'application/json'
  },
  body: {
    recipientEmail: 'jane.smith@example.com',
    amount: 1500.50,
    purpose: 'Payment for consulting services',
    deviceFingerprint: {
      deviceId: 'device_iphone_14_001',
      deviceBrand: 'Apple',
      deviceModel: 'iPhone 14',
      osVersion: '17.0',
      appVersion: '1.0.0',
      buildId: 'build_001',
      platform: 'ios',
      manufacturer: 'Apple'
    }
  },
  expectedResponse: {
    message: 'Transfer completed',
    transactionId: '507f1f77bcf86cd799439011',
    status: 'completed',
    fraudDetection: {
      riskScore: 0.35,
      alerts: [],
      analysis: 'Transaction appears normal. Amount is within usual pattern.'
    }
  }
};

// Example 6: Get Transfer History
const historyExample = {
  url: 'http://localhost:3000/api/transfers/history',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  expectedResponse: {
    transactions: [
      {
        _id: '507f1f77bcf86cd799439011',
        recipientEmail: 'jane.smith@example.com',
        amount: 1500.50,
        purpose: 'Payment for consulting services',
        status: 'completed',
        fraudDetection: {
          riskScore: 0.35,
          alerts: []
        },
        createdAt: '2024-01-16T10:30:00Z',
        completedAt: '2024-01-16T10:31:00Z'
      }
    ]
  }
};

// ==================== CURL EXAMPLES ====================

/**
 * Register User:
 * 
 * curl -X POST http://localhost:3000/api/auth/register \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "email": "john@example.com",
 *     "password": "SecurePassword123!",
 *     "deviceFingerprint": {
 *       "deviceId": "device_001",
 *       "deviceModel": "iPhone 14",
 *       "platform": "ios",
 *       "osVersion": "17.0"
 *     }
 *   }'
 */

/**
 * Login User:
 * 
 * curl -X POST http://localhost:3000/api/auth/login \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "email": "john@example.com",
 *     "password": "SecurePassword123!",
 *     "deviceFingerprint": {
 *       "deviceId": "device_001",
 *       "deviceModel": "iPhone 14",
 *       "platform": "ios"
 *     }
 *   }'
 */

/**
 * Check Device Status:
 * 
 * curl -X GET "http://localhost:3000/api/devices/status?fingerprint=%7B%22deviceId%22%3A%22device_001%22%7D" \
 *   -H "Authorization: Bearer YOUR_TOKEN"
 */

/**
 * Trust Device:
 * 
 * curl -X POST http://localhost:3000/api/devices/trust \
 *   -H "Authorization: Bearer YOUR_TOKEN" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "deviceFingerprint": {
 *       "deviceId": "device_001",
 *       "deviceModel": "iPhone 14",
 *       "platform": "ios"
 *     }
 *   }'
 */

/**
 * Create Transfer:
 * 
 * curl -X POST http://localhost:3000/api/transfers/create \
 *   -H "Authorization: Bearer YOUR_TOKEN" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "recipientEmail": "recipient@example.com",
 *     "amount": 1000.50,
 *     "purpose": "Payment",
 *     "deviceFingerprint": {"deviceId": "device_001"}
 *   }'
 */

// ==================== TESTING SCENARIOS ====================

/**
 * Test Scenario 1: Happy Path
 * 1. Register new user
 * 2. Login with same device
 * 3. Device automatically trusted (low risk)
 * 4. Create transfer (should succeed)
 * 5. View transaction history
 */

/**
 * Test Scenario 2: Suspicious Device
 * 1. Register user on Device A
 * 2. Login from Device B (new device)
 * 3. Try to create transfer
 * 4. System flags as suspicious
 * 5. Trust device first
 * 6. Retry transfer (should succeed after risk assessment)
 */

/**
 * Test Scenario 3: High-Risk Transfer
 * 1. User with avg $500 transfers
 * 2. Attempts $5000 transfer (10x average)
 * 3. System blocks due to fraud detection
 * 4. Shows riskScore > 0.8
 */

/**
 * Test Scenario 4: Rapid Transactions
 * 1. Create 12 transfers in 1 hour
 * 2. System detects velocity attack
 * 3. Flags as suspicious
 * 4. Requires manual review
 */

// ==================== POSTMAN COLLECTION ====================

/**
 * Import this into Postman as Collection
 * 
 * {
 *   "info": {
 *     "name": "Banking App API",
 *     "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
 *   },
 *   "item": [
 *     {
 *       "name": "Auth",
 *       "item": [
 *         {
 *           "name": "Register",
 *           "request": {
 *             "method": "POST",
 *             "url": "{{base_url}}/api/auth/register",
 *             "body": {...}
 *           }
 *         },
 *         {
 *           "name": "Login",
 *           "request": {
 *             "method": "POST",
 *             "url": "{{base_url}}/api/auth/login",
 *             "body": {...}
 *           }
 *         }
 *       ]
 *     },
 *     {
 *       "name": "Devices",
 *       "item": [...],
 *     },
 *     {
 *       "name": "Transfers",
 *       "item": [...]
 *     }
 *   ],
 *   "variable": [
 *     {
 *       "key": "base_url",
 *       "value": "http://localhost:3000"
 *     },
 *     {
 *       "key": "token",
 *       "value": ""
 *     }
 *   ]
 * }
 */

// ==================== TROUBLESHOOTING CHECKLIST ====================

/**
 * If backend won't start:
 * ✓ Check if port 3000 is available
 * ✓ Check if MongoDB is running
 * ✓ Check .env file configuration
 * ✓ Check Node.js version (should be 14+)
 * ✓ Check if all dependencies are installed
 * 
 * If database connection fails:
 * ✓ Verify MongoDB URI in .env
 * ✓ Check if MongoDB service is running
 * ✓ Verify credentials for MongoDB Atlas
 * ✓ Check firewall/network settings
 * 
 * If API returns 401 errors:
 * ✓ Check if token is included in header
 * ✓ Verify token hasn't expired
 * ✓ Check if JWT_SECRET matches
 * 
 * If device verification fails:
 * ✓ Ensure device fingerprint is sent correctly
 * ✓ Check if device collection exists in database
 * ✓ Verify risk score calculation
 */

// ==================== PRODUCTION DEPLOYMENT ====================

/**
 * Before deploying to production:
 * 
 * 1. Update environment variables
 *    - Change JWT_SECRET to strong random value
 *    - Set NODE_ENV=production
 *    - Update MONGODB_URI to production database
 *    - Configure CORS properly
 * 
 * 2. Enable HTTPS
 *    - Install SSL certificate
 *    - Update CORS allowed origins
 *    - Use secure cookies
 * 
 * 3. Security hardening
 *    - Enable rate limiting
 *    - Add helmet middleware
 *    - Implement CSRF protection
 *    - Validate all inputs
 *    - Add request logging
 * 
 * 4. Performance optimization
 *    - Enable caching
 *    - Optimize database indexes
 *    - Use connection pooling
 *    - Implement pagination
 * 
 * 5. Monitoring
 *    - Setup error tracking (Sentry)
 *    - Enable application logging
 *    - Monitor API performance
 *    - Track transaction volume
 */

// ==================== DEPLOYMENT EXAMPLE ====================

/**
 * Using Heroku:
 * 
 * 1. Install Heroku CLI
 * 2. Create .gitignore (exclude node_modules, .env)
 * 3. Initialize git: git init
 * 4. Login: heroku login
 * 5. Create app: heroku create banking-app
 * 6. Set env vars: heroku config:set MONGODB_URI=...
 * 7. Deploy: git push heroku main
 * 
 * Using Docker:
 * 
 * 1. Create Dockerfile
 * 2. Create docker-compose.yml
 * 3. Build: docker build -t banking-app .
 * 4. Run: docker-compose up
 */

module.exports = {
  registerExample,
  loginExample,
  deviceStatusExample,
  trustDeviceExample,
  transferExample,
  historyExample
};
