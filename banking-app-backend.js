/**
 * Banking App Backend - Node.js/Express
 * Features: Authentication, Device Verification, AI Risk Assessment
 */

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ==================== MIDDLEWARE ====================
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// ==================== DATABASE MODELS ====================

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 10000 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
});

// Device Schema
const DeviceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fingerprint: { type: String, required: true, unique: true },
  deviceInfo: {
    deviceId: String,
    deviceModel: String,
    platform: String,
    osVersion: String,
  },
  isTrusted: { type: Boolean, default: false },
  trustStatus: { type: String, enum: ['pending', 'trusted', 'restricted'], default: 'pending' },
  riskScore: { type: Number, default: 0.5 },
  riskReason: String,
  lastLogin: Date,
  trustedDate: Date,
  createdAt: { type: Date, default: Date.now },
});

// Transaction Schema
const TransactionSchema  = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientEmail: { type: String, required: true },
  amount: { type: Number, required: true },
  purpose: String,
  deviceFingerprint: String,
  status: { type: String, enum: ['pending', 'completed', 'failed', 'blocked'], default: 'pending' },
  fraudDetection: {
    riskScore: Number,
    alerts: [String],
    aiAnalysis: String,
  },
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
});

const User = mongoose.model('User', UserSchema);
const Device = mongoose.model('Device', DeviceSchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);

// ==================== AUTHENTICATION ====================

// Helper function: Hash password
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Helper function: Compare password
async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Helper function: Generate JWT token
function generateToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'secret_key_banking_app_2024',
    { expiresIn: '7d' }
  );
}

// Middleware: Verify token
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_banking_app_2024');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, deviceFingerprint } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    const user = new User({
      email,
      password: hashedPassword,
    });
    await user.save();

    // Register device
    if (deviceFingerprint) {
      const deviceHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(deviceFingerprint))
        .digest('hex');

      const device = new Device({
        userId: user._id,
        fingerprint: deviceHash,
        deviceInfo: deviceFingerprint,
        trustStatus: 'pending',
      });
      await device.save();
    }

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, email: user.email },
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, deviceFingerprint } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Handle device
    if (deviceFingerprint) {
      const deviceHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(deviceFingerprint))
        .digest('hex');

      let device = await Device.findOne({ fingerprint: deviceHash });

      if (!device) {
        // New device
        device = new Device({
          userId: user._id,
          fingerprint: deviceHash,
          deviceInfo: deviceFingerprint,
          trustStatus: 'pending',
          riskScore: 0.7,
          riskReason: 'New device detected',
        });
        await device.save();
      }

      device.lastLogin = new Date();
      await device.save();
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful',
      user: { id: user._id, email: user.email, balance: user.balance },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// ==================== DEVICE MANAGEMENT ====================

// Get device status
app.get('/api/devices/status', verifyToken, async (req, res) => {
  try {
    const { fingerprint } = req.query;
    
    if (!fingerprint) {
      return res.status(400).json({ message: 'Fingerprint required' });
    }

    const deviceHash = crypto
      .createHash('sha256')
      .update(fingerprint)
      .digest('hex');

    const device = await Device.findOne({ 
      userId: req.userId,
      fingerprint: deviceHash 
    });

    if (!device) {
      return res.status(200).json({
        isTrusted: false,
        reason: 'Device not found in trusted list',
        devices: [],
      });
    }

    // Get all trusted devices
    const devices = await Device.find({ userId: req.userId, trustStatus: 'trusted' });

    res.status(200).json({
      isTrusted: device.trustStatus === 'trusted',
      reason: device.riskReason || '',
      riskScore: device.riskScore,
      devices: devices.map(d => ({
        model: d.deviceInfo.deviceModel,
        platform: d.deviceInfo.platform,
        trustedDate: d.trustedDate
      })),
    });
  } catch (error) {
    console.error('Device status error:', error);
    res.status(500).json({ message: 'Failed to get device status', error: error.message });
  }
});

// Trust device
app.post('/api/devices/trust', verifyToken, async (req, res) => {
  try {
    const { deviceFingerprint } = req.body;

    if (!deviceFingerprint) {
      return res.status(400).json({ message: 'Device fingerprint required' });
    }

    const deviceHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(deviceFingerprint))
      .digest('hex');

    const device = await Device.findOne({
      userId: req.userId,
      fingerprint: deviceHash,
    });

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    // Assess risk before trusting
    const riskAssessment = await assessDeviceRisk(deviceFingerprint, req.userId);

    if (riskAssessment.riskScore > 0.8) {
      return res.status(400).json({
        message: 'Device cannot be trusted due to high risk score',
        reason: riskAssessment.reason,
      });
    }

    device.trustStatus = 'trusted';
    device.isTrusted = true;
    device.trustedDate = new Date();
    device.riskScore = riskAssessment.riskScore;
    device.riskReason = riskAssessment.reason;
    await device.save();

    res.status(200).json({ message: 'Device trusted successfully' });
  } catch (error) {
    console.error('Trust device error:', error);
    res.status(500).json({ message: 'Failed to trust device', error: error.message });
  }
});

// ==================== AI RISK ASSESSMENT ====================

async function assessDeviceRisk(deviceInfo, userId) {
  try {
    // Get user transaction history
    const transactions = await Transaction.find({ senderId: userId });
    const recentTransactions = transactions.slice(-10);

    const prompt = `
Analyze the risk of this mobile banking device based on the following information:

Device Information:
- Model: ${deviceInfo.deviceModel}
- Platform: ${deviceInfo.platform}
- OS Version: ${deviceInfo.osVersion}
- Brand: ${deviceInfo.deviceBrand}

User History:
- Total Transactions: ${transactions.length}
- Recent Transactions: ${recentTransactions.length}
- Device is New: Yes

Rate the risk as a score from 0 (safe) to 1 (high risk).
Provide a brief reason for the risk score.

Response format:
RISK_SCORE: [0-1]
REASON: [brief explanation]
    `;

    // Call OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4.0-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY || 'sk-your-api-key'}`,
        },
      }
    );

    const result = response.data.choices[0].message.content;
    const lines = result.split('\n');
    const riskScoreLine = lines.find(l => l.includes('RISK_SCORE'));
    const reasonLine = lines.find(l => l.includes('REASON'));

    const riskScore = parseFloat(riskScoreLine?.split(':')[1]?.trim() || 0.5);
    const reason = reasonLine?.split(':')[1]?.trim() || 'Automated risk assessment';

    return {
      riskScore: Math.min(1, Math.max(0, riskScore)),
      reason,
    };
  } catch (error) {
    console.error('AI risk assessment error:', error);
    return {
      riskScore: 0.6,
      reason: 'Unable to perform AI risk assessment',
    };
  }
}

// ==================== TRANSFER MANAGEMENT ====================

// Create transfer
app.post('/api/transfers/create', verifyToken, async (req, res) => {
  try {
    const { recipientEmail, amount, purpose, deviceFingerprint } = req.body;

    if (!recipientEmail || !amount) {
      return res.status(400).json({ message: 'Recipient and amount required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }

    // Get device
    const deviceHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(deviceFingerprint))
      .digest('hex');

    const device = await Device.findOne({
      userId: req.userId,
      fingerprint: deviceHash,
    });

    if (!device || device.trustStatus !== 'trusted') {
      return res.status(403).json({ message: 'Device not trusted for transfers' });
    }

    // Get user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Fraud detection
    const fraudAnalysis = await performFraudDetection({
      userId: req.userId,
      amount,
      recipientEmail,
      device: device.deviceInfo,
    });

    // Create transaction
    const transaction = new Transaction({
      senderId: req.userId,
      recipientEmail,
      amount,
      purpose,
      deviceFingerprint: deviceHash,
      status: fraudAnalysis.riskScore > 0.8 ? 'blocked' : 'pending',
      fraudDetection: {
        riskScore: fraudAnalysis.riskScore,
        alerts: fraudAnalysis.alerts,
        aiAnalysis: fraudAnalysis.analysis,
      },
    });

    if (fraudAnalysis.riskScore <= 0.8) {
      // Process transfer
      user.balance -= amount;
      await user.save();

      transaction.status = 'completed';
      transaction.completedAt = new Date();
    }

    await transaction.save();

    res.status(200).json({
      message: transaction.status === 'completed' ? 'Transfer completed' : 'Transfer blocked due to fraud detection',
      transactionId: transaction._id,
      status: transaction.status,
      fraudDetection: fraudAnalysis,
    });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ message: 'Transfer failed', error: error.message });
  }
});

// Fraud detection
async function performFraudDetection(transferData) {
  try {
    const prompt = `
Analyze this banking transfer for fraud risk:

Transfer Details:
- Amount: $${transferData.amount}
- Recipient: ${transferData.recipientEmail}
- Device: ${transferData.device.deviceModel} (${transferData.device.platform})

Assess for:
1. Unusual amount for this user
2. Suspicious recipient
3. Device inconsistencies
4. Timing patterns

Provide risk assessment in format:
RISK_SCORE: [0-1]
ALERTS: [comma-separated alerts]
ANALYSIS: [brief explanation]
    `;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY || 'sk-your-api-key'}`,
        },
      }
    );

    const result = response.data.choices[0].message.content;
    const lines = result.split('\n');

    const riskScore = parseFloat(
      lines.find(l => l.includes('RISK_SCORE'))?.split(':')[1]?.trim() || 0.3
    );
    const alerts = lines
      .find(l => l.includes('ALERTS'))
      ?.split(':')[1]
      ?.trim()
      ?.split(',')
      ?.map(a => a.trim()) || [];
    const analysis = lines.find(l => l.includes('ANALYSIS'))?.split(':')[1]?.trim() || 'Normal';

    return {
      riskScore: Math.min(1, Math.max(0, riskScore)),
      alerts,
      analysis,
    };
  } catch (error) {
    console.error('Fraud detection error:', error);
    return {
      riskScore: 0.4,
      alerts: [],
      analysis: 'Unable to perform AI analysis',
    };
  }
}

// Get transaction history
app.get('/api/transfers/history', verifyToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ senderId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ transactions });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ message: 'Failed to get history', error: error.message });
  }
});

// ==================== DATABASE CONNECTION ====================

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/banking-app';

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✓ Connected to MongoDB');
}).catch(err => {
  console.error('✗ MongoDB connection error:', err);
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  Banking App Backend - Node.js        ║
╠════════════════════════════════════════╣
║  Server running on: http://localhost:${PORT}
║  
║  Endpoints:
║  - POST /api/auth/register
║  - POST /api/auth/login
║  - GET /api/devices/status
║  - POST /api/devices/trust
║  - POST /api/transfers/create
║  - GET /api/transfers/history
╚════════════════════════════════════════╝
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

module.exports = app;
