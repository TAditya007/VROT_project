const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const { otpStore } = require('./otpRoutes');

const USERS_FILE = path.join(__dirname, '../data/users.json');
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Ensure directories exist
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Define allowed document fields
const documentFields = [
  { name: 'aadhaar', maxCount: 1 },
  { name: 'addressProof', maxCount: 1 },
  { name: 'vehicleInvoice', maxCount: 1 },
  { name: 'insurance', maxCount: 1 },
  { name: 'pollution', maxCount: 1 },
  { name: 'photo', maxCount: 1 }
];

// Helper functions
const readUsers = () => {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
    return [];
  }
  const data = fs.readFileSync(USERS_FILE, 'utf8');
  return JSON.parse(data);
};

const writeUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

const findUserById = (users, id) => users.find(u => u.id === id);
const findUserByEmail = (users, email) => users.find(u => u.email === email);

// ==================== SEED DEFAULT USERS ====================
const seedDefaultUsers = () => {
  const users = readUsers();
  const defaultUsers = [
    {
      id: "seed-admin",
      name: "Admin User",
      email: "admin@vrot.com",
      phone: "9999999999",
      password: "admin123",
      role: "admin",
      isVerified: true,
      profile: { age: '', sex: '', address: '', profileImage: '', idProof: { type: '', number: '', file: '' } },
      applications: [],
      payments: []
    },
    {
      id: "seed-demo",
      name: "Demo User",
      email: "demo@vrot.com",
      phone: "8888888888",
      password: "123456",
      role: "citizen",
      isVerified: true,
      profile: { age: '', sex: '', address: '', profileImage: '', idProof: { type: '', number: '', file: '' } },
      applications: [],
      payments: []
    }
  ];

  let changed = false;
  defaultUsers.forEach(defaultUser => {
    const exists = users.find(u => u.email === defaultUser.email);
    if (!exists) {
      users.push(defaultUser);
      changed = true;
    }
  });

  if (changed) {
    writeUsers(users);
    console.log('✅ Seeded default users (admin/demo)');
  }
};

// Run seeding once when the module loads
seedDefaultUsers();

// ==================== AUTH ENDPOINTS ====================
router.post('/register', (req, res) => {
  const { fullName, email, phone, password, role = 'citizen' } = req.body;
  if (!fullName || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const users = readUsers();
  if (findUserByEmail(users, email)) {
    return res.status(400).json({ message: 'User already exists with this email.' });
  }

  const newUser = {
    id: Date.now().toString(),
    name: fullName,
    email,
    phone,
    password,
    role,
    isVerified: false,
    profile: {
      age: '',
      sex: '',
      address: '',
      profileImage: '',
      idProof: { type: '', number: '', file: '' }
    },
    applications: [],
    payments: []
  };

  users.push(newUser);
  writeUsers(users);

  res.status(201).json({
    message: 'Registration successful. Please wait for admin verification.',
    user: newUser
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  const users = readUsers();
  const user = findUserByEmail(users, email);
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }
  if (!user.isVerified && user.role !== 'admin') {
    return res.status(403).json({ message: 'Account pending admin verification.' });
  }

  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// ==================== ADMIN ENDPOINTS ====================
router.get('/users', (req, res) => {
  const users = readUsers();
  const safeUsers = users.map(({ password, ...rest }) => rest);
  res.json(safeUsers);
});

router.get('/user/:id', (req, res) => {
  const { id } = req.params;
  const users = readUsers();
  const user = findUserById(users, id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

router.patch('/verify/:id', (req, res) => {
  const { id } = req.params;
  const users = readUsers();
  const user = findUserById(users, id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.isVerified = true;
  writeUsers(users);
  res.json({ message: 'User verified successfully.', user });
});

// ==================== USER PROFILE ENDPOINTS ====================
router.get('/me', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: 'Missing userId' });

  const users = readUsers();
  const user = findUserById(users, userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { password, ...safeUser } = user;
  res.json(safeUser);
});

router.put('/profile', (req, res) => {
  const { userId, profile } = req.body;
  if (!userId || !profile) {
    return res.status(400).json({ message: 'Missing userId or profile data' });
  }

  const users = readUsers();
  const user = findUserById(users, userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.profile = { ...user.profile, ...profile };
  writeUsers(users);

  const { password, ...safeUser } = user;
  res.json({ message: 'Profile updated', user: safeUser });
});

// ==================== APPLICATIONS (with file upload) ====================
router.post('/application', upload.array('documents', 10), (req, res) => {
  const { userId, type, data } = req.body;
  if (!userId || !type || !data) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  let parsedData;
  try {
    parsedData = JSON.parse(data);
  } catch (err) {
    return res.status(400).json({ message: 'Invalid data format' });
  }

  const users = readUsers();
  const user = findUserById(users, userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  // Process uploaded files (initial documents from form submission – can be empty)
  const documents = req.files ? req.files.map(file => ({
    filename: file.filename,
    originalname: file.originalname,
    path: `/uploads/${file.filename}`,
    mimetype: file.mimetype,
    size: file.size
  })) : [];

  const newApp = {
    id: Date.now().toString(),
    type, // 'registration', 'transfer', 'noc'
    data: parsedData,
    documents,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  user.applications.push(newApp);
  writeUsers(users);

  res.status(201).json({ message: 'Application submitted', application: newApp });
});

router.get('/applications', (req, res) => {
  const { userId, admin } = req.query;
  if (!userId) return res.status(400).json({ message: 'Missing userId' });

  const users = readUsers();
  if (admin === 'true') {
    const allApps = users.flatMap(u =>
      u.applications.map(app => ({ ...app, userEmail: u.email, userName: u.name }))
    );
    return res.json(allApps);
  }

  const user = findUserById(users, userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user.applications);
});

router.get('/application/:id', (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: 'Missing userId' });

  const users = readUsers();
  const user = findUserById(users, userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const app = user.applications.find(a => a.id === id);
  if (!app) return res.status(404).json({ message: 'Application not found' });

  res.json(app);
});

router.patch('/application/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ message: 'Missing status' });

  const users = readUsers();
  let foundApp = null;
  for (const user of users) {
    const app = user.applications.find(a => a.id === id);
    if (app) {
      app.status = status;
      foundApp = app;
      break;
    }
  }
  if (!foundApp) return res.status(404).json({ message: 'Application not found' });

  writeUsers(users);
  res.json({ message: 'Application status updated', application: foundApp });
});

// ==================== DOCUMENT UPLOAD FOR APPLICATION ====================
router.post('/application/:id/documents', upload.fields(documentFields), (req, res) => {
  const { id } = req.params;
  const users = readUsers();
  let foundApp = null;

  for (const user of users) {
    const app = user.applications.find(a => a.id === id);
    if (app) {
      foundApp = app;
      break;
    }
  }
  if (!foundApp) return res.status(404).json({ message: 'Application not found' });

  // Process uploaded files – each field is an array (maxCount 1, so one file per field)
  const documents = [];
  for (const field of documentFields) {
    const files = req.files[field.name] || [];
    if (files.length > 0) {
      const file = files[0];
      documents.push({
        type: field.name,
        filename: file.filename,
        originalname: file.originalname,
        path: `/uploads/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size
      });
    }
  }

  // Replace existing documents (or initialize)
  foundApp.documents = documents;
  writeUsers(users);

  res.json({ message: 'Documents uploaded successfully', documents: foundApp.documents });
});

// ==================== PAYMENT FOR SPECIFIC APPLICATION ====================
// NEW: Record payment for a specific application
router.post('/application/:id/payment', (req, res) => {
  const { id } = req.params;
  const { transactionId, amount } = req.body;
  if (!transactionId || !amount) {
    return res.status(400).json({ message: 'Transaction ID and amount are required' });
  }

  const users = readUsers();
  let foundApp = null;

  for (const user of users) {
    const app = user.applications.find(a => a.id === id);
    if (app) {
      foundApp = app;
      break;
    }
  }
  if (!foundApp) return res.status(404).json({ message: 'Application not found' });

  // Record payment
  foundApp.payment = {
    transactionId,
    amount: Number(amount),
    status: 'pending_verification',
    paidAt: new Date().toISOString()
  };
  foundApp.status = 'payment-verification-pending';

  writeUsers(users);
  res.json({ message: 'Payment recorded successfully', application: foundApp });
});

// ==================== GENERIC PAYMENT ENDPOINTS ====================
router.post('/payment', (req, res) => {
  const { userId, amount, description, reference } = req.body;
  if (!userId || !amount) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const users = readUsers();
  const user = findUserById(users, userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const payment = {
    id: Date.now().toString(),
    amount,
    description: description || '',
    reference: reference || '',
    status: 'completed',
    createdAt: new Date().toISOString()
  };

  user.payments.push(payment);
  writeUsers(users);

  res.status(201).json({ message: 'Payment recorded', payment });
});

router.get('/payments', (req, res) => {
  const { userId, admin } = req.query;
  if (!userId) return res.status(400).json({ message: 'Missing userId' });

  const users = readUsers();
  if (admin === 'true') {
    const allPayments = users.flatMap(u => u.payments.map(p => ({ ...p, user: u.email })));
    return res.json(allPayments);
  }

  const user = findUserById(users, userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user.payments);
});

// ==================== PASSWORD MANAGEMENT ====================
router.post('/change-password', (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const users = readUsers();
  const user = findUserByEmail(users, email);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.password !== currentPassword) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  writeUsers(users);
  res.json({ message: 'Password changed successfully' });
});

router.post('/reset-password', (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required' });
  }

  const record = otpStore[email];
  if (!record) {
    return res.status(400).json({ message: 'OTP not found or expired' });
  }
  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ message: 'OTP expired' });
  }
  if (record.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  delete otpStore[email];

  const users = readUsers();
  const userIndex = users.findIndex(u => u.email === email);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  users[userIndex].password = newPassword;
  writeUsers(users);

  res.json({ message: 'Password reset successfully' });
});

module.exports = router;