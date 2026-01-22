/**
 * Mobile Banking App - Frontend (React Native)
 * Features: Login, Device Registration, Transfer Control
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { DeviceInfo } from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.100:3000/api';

// ==================== DEVICE FINGERPRINT SERVICE ====================
class DeviceFingerprintService {
  static async generateFingerprint() {
    try {
      const fingerprint = {
        deviceId: await DeviceInfo.getUniqueId(),
        deviceBrand: await DeviceInfo.getBrand(),
        deviceModel: await DeviceInfo.getModel(),
        osVersion: await DeviceInfo.getSystemVersion(),
        appVersion: await DeviceInfo.getVersion(),
        buildId: await DeviceInfo.getBuildId(),
        platform: Platform.OS,
        manufacturer: await DeviceInfo.getManufacturer(),
        timestamp: new Date().toISOString(),
      };

      return fingerprint;
    } catch (error) {
      console.error('Error generating fingerprint:', error);
      throw error;
    }
  }

  static generateHash(fingerprint) {
    const crypto = require('crypto');
    const data = JSON.stringify(fingerprint);
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

// ==================== BANKING APP COMPONENT ====================
const BankingApp = () => {
  // Auth State
  const [authState, setAuthState] = useState('login'); // 'login', 'register', 'dashboard'
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [deviceTrusted, setDeviceTrusted] = useState(false);

  // Transfer State
  const [recipientEmail, setRecipientEmail] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferPurpose, setTransferPurpose] = useState('');
  const [transferLocked, setTransferLocked] = useState(false);
  const [lockReason, setLockReason] = useState('');

  // Device State
  const [deviceFingerprint, setDeviceFingerprint] = useState(null);
  const [deviceList, setDeviceList] = useState([]);

  // ==================== LIFECYCLE ====================
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Generate device fingerprint
      const fingerprint = await DeviceFingerprintService.generateFingerprint();
      setDeviceFingerprint(fingerprint);

      // Check if user is already logged in
      const savedUser = await AsyncStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setAuthState('dashboard');
        checkDeviceStatus(JSON.parse(savedUser).id);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  // ==================== AUTHENTICATION ====================
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
        deviceFingerprint,
      });

      const { user, token } = response.data;

      // Save user data
      await AsyncStorageStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('token', token);

      setUser(user);
      setAuthState('dashboard');

      // Check device status
      checkDeviceStatus(user.id);

      Alert.alert('Success', 'logged in Successfully');
    } catch (error) {
      Alert.alert('Login Error', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        password,
        deviceFingerprint,
      });

      const { user, token } = response.data;

      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('token', token);

      setUser(user);
      setAuthState('dashboard');

      Alert.alert('Success', 'Account created successfully');
    } catch (error) {
      Alert.alert('Register Error', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
    setUser(null);
    setAuthState('login');
    setEmail('');
    setPassword('');
  };

  // ==================== DEVICE MANAGEMENT ====================
  const checkDeviceStatus = async (userId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/devices/status`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { fingerprint: JSON.stringify(deviceFingerprint) },
      });

      setDeviceTrusted(response.data.isTrusted);
      setTransferLocked(!response.data.isTrusted);
      setLockReason(response.data.reason || 'Device not recognized');
      setDeviceList(response.data.devices || []);
    } catch (error) {
      console.error('Error checking device status:', error);
      setTransferLocked(true);
      setLockReason('Unable to verify device');
    }
  };

  const trustThisDevice = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/devices/trust`,
        { deviceFingerprint },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDeviceTrusted(true);
      setTransferLocked(false);
      Alert.alert('Success', 'Device trusted successfully');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || error.message);
    }
  };

  // ==================== TRANSFER OPERATIONS ====================
  const handleTransfer = async () => {
    if (transferLocked) {
      Alert.alert('Transfer Locked', 'This device is not trusted. Please verify it first.');
      return;
    }

    if (!recipientEmail || !transferAmount) {
      Alert.alert('Error', 'Please enter recipient and amount');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/transfers/create`,
        {
          recipientEmail,
          amount: parseFloat(transferAmount),
          purpose: transferPurpose,
          deviceFingerprint,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Success', `Transfer initiated: ${response.data.transactionId}`);
      setRecipientEmail('');
      setTransferAmount('');
      setTransferPurpose('');
    } catch (error) {
      Alert.alert('Transfer Error', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==================== UI SCREENS ====================

  // Login Screen
  if (authState === 'login') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>🏦 Banking App</Text>
          <Text style={styles.subtitle}>Login to your account</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setAuthState('register')}>
            <Text style={styles.linkText}>Don't have an account? Register</Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Device Info:</Text>
            {deviceFingerprint && (
              <>
                <Text style={styles.infoText}>Device: {deviceFingerprint.deviceModel}</Text>
                <Text style={styles.infoText}>OS: {deviceFingerprint.platform}</Text>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    );
  }

  // Register Screen
  if (authState === 'register') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>🏦 Create Account</Text>
          <Text style={styles.subtitle}>Register new account</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setAuthState('login')}>
            <Text style={styles.linkText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Dashboard Screen
  return (
    <ScrollView style={styles.container}>
      {/* User Info Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Welcome, {user?.email}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Device Status Card */}
      <View style={[styles.card, deviceTrusted ? styles.successCard : styles.warningCard]}>
        <Text style={styles.cardTitle}>Device Status</Text>
        <Text style={styles.statusBadge}>
          {deviceTrusted ? '✅ Trusted' : '⚠️ Not Trusted'}
        </Text>
        {!deviceTrusted && <Text style={styles.reason}>{lockReason}</Text>}

        {!deviceTrusted && (
          <TouchableOpacity
            style={[styles.button, { marginTop: 15 }]}
            onPress={trustThisDevice}
          >
            <Text style={styles.buttonText}>Trust This Device</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Transfer Card */}
      <View style={[styles.card, transferLocked && styles.lockedCard]}>
        <Text style={styles.cardTitle}>💸 Send Money</Text>

        {transferLocked && (
          <View style={styles.lockAlert}>
            <Text style={styles.lockAlertText}>
              🔒 Money transfer is locked until you trust this device
            </Text>
          </View>
        )}

        <TextInput
          style={[styles.input, transferLocked && styles.inputDisabled]}
          placeholder="Recipient Email"
          value={recipientEmail}
          onChangeText={setRecipientEmail}
          editable={!transferLocked && !loading}
        />

        <TextInput
          style={[styles.input, transferLocked && styles.inputDisabled]}
          placeholder="Amount"
          value={transferAmount}
          onChangeText={setTransferAmount}
          keyboardType="decimal-pad"
          editable={!transferLocked && !loading}
        />

        <TextInput
          style={[styles.input, transferLocked && styles.inputDisabled]}
          placeholder="Purpose (optional)"
          value={transferPurpose}
          onChangeText={setTransferPurpose}
          editable={!transferLocked && !loading}
        />

        <TouchableOpacity
          style={[styles.button, (transferLocked || loading) && styles.buttonDisabled]}
          onPress={handleTransfer}
          disabled={transferLocked || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send Money</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Trusted Devices */}
      {deviceList.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trusted Devices</Text>
          {deviceList.map((device, index) => (
            <View key={index} style={styles.deviceItem}>
              <Text style={styles.deviceName}>{device.model}</Text>
              <Text style={styles.deviceDate}>
                Trusted: {new Date(device.trustedDate).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  warningCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  lockedCard: {
    opacity: 0.7,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  button: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  linkText: {
    color: '#667eea',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
  statusBadge: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  reason: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 8,
  },
  lockAlert: {
    backgroundColor: '#fff3e0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    padding: 12,
    marginBottom: 12,
    borderRadius: 4,
  },
  lockAlertText: {
    color: '#e65100',
    fontSize: 13,
  },
  infoBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  infoTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  deviceItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  deviceDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default BankingApp;
