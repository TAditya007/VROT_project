const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '../data/users.json');

// Helper to read users
const readUsers = () => {
  if (!fs.existsSync(USERS_FILE)) return [];
  const data = fs.readFileSync(USERS_FILE, 'utf8');
  return JSON.parse(data);
};

// In-memory OTP store (resets on server restart)
const otpStore = {};

// Configure transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper to send email
const sendEmail = (to, subject, text, html) => {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: `"VROT Services" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Email send error:', error);
        reject(error);
      } else {
        console.log('Email sent:', info.response);
        resolve(info);
      }
    });
  });
};

// ============ FORGOT PASSWORD: request OTP ============
router.post('/request-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Check if user exists
  const users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ message: 'No account found with this email.' });
  }

  const otp = generateOtp();
  const expiresAt = Date.now() + 5 * 60 * 1000;
  otpStore[email] = { otp, expiresAt };

  try {
    await sendEmail(
      email,
      'Your OTP for VROT Services',
      `Your OTP is: ${otp}\nIt is valid for 5 minutes.`,
      `<p>Your OTP is: <strong>${otp}</strong></p><p>It is valid for 5 minutes.</p>`
    );
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Failed to send email:', error);
    res.status(500).json({ message: 'Failed to send OTP. Check server logs.' });
  }
});

// ============ VERIFY OTP (common) ============
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
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
  res.json({ message: 'OTP verified successfully' });
});

// ============ SIGNUP: send OTP ============
router.post('/send-signup-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Check if user already exists
  const users = readUsers();
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ message: 'Email already registered. Please login.' });
  }

  const otp = generateOtp();
  const expiresAt = Date.now() + 5 * 60 * 1000;
  const key = `signup_${email}`;
  otpStore[key] = { otp, expiresAt };

  console.log(`🔐 Signup OTP for ${email}: ${otp}`); // for debugging

  try {
    await sendEmail(
      email,
      'Your OTP for VROT Registration',
      `Your OTP for registration is: ${otp}\nIt is valid for 5 minutes.`,
      `<p>Your OTP for registration is: <strong>${otp}</strong></p><p>It is valid for 5 minutes.</p>`
    );
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Failed to send signup email:', error);
    res.status(500).json({ message: 'Failed to send OTP. Check server logs.' });
  }
});

// ============ VERIFY SIGNUP OTP ============
router.post('/verify-signup-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const key = `signup_${email}`;
  const record = otpStore[key];
  if (!record) {
    return res.status(400).json({ message: 'OTP not found or expired' });
  }
  if (Date.now() > record.expiresAt) {
    delete otpStore[key];
    return res.status(400).json({ message: 'OTP expired' });
  }
  if (record.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  delete otpStore[key];
  res.json({ message: 'OTP verified successfully' });
});

// Export both router and otpStore
module.exports = { router, otpStore };