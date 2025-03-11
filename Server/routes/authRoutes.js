const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const authMiddleware = require("../middlewares/authMiddleware");

dotenv.config(); // Load environment variables
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ 
      token: `Bearer ${token}`,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin,
        deliveryInfo: user.deliveryInfo || {
          fullName: '',
          phone: '',
          address: '',
          defaultDeliveryMethod: 'delivery'
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Profile Route
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    console.log('Fetching profile for user ID:', req.user);
    const user = await User.findById(req.user);
    
    if (!user) {
      console.log('User not found for ID:', req.user);
      return res.status(404).json({ error: "User not found" });
    }

    // Return user data without sensitive information
    res.json({
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin,
      deliveryInfo: user.deliveryInfo || {
        fullName: '',
        phone: '',
        address: '',
        defaultDeliveryMethod: 'delivery'
      }
    });
  } catch (error) {
    console.error('Profile route error:', error);
    res.status(500).json({ error: "Error fetching user profile" });
  }
});

// Forgot Password Route
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Received forgot password request for email:', email);

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(404).json({ error: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create transporter with error handling
    let transporter;
    try {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } catch (error) {
      console.error('Error creating email transporter:', error);
      return res.status(500).json({ error: "Email service configuration error" });
    }

    // Send email with error handling
    try {
      await transporter.sendMail({
        to: user.email,
        subject: 'Password Reset Link',
        html: `
          <p>You requested a password reset</p>
          <p>Click this <a href="${process.env.CLIENT_URL}/reset-password/${resetToken}">link</a> to reset your password</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request this reset, please ignore this email.</p>
        `
      });
      console.log('Password reset email sent successfully to:', email);
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ error: "Error sending reset email" });
    }

    res.json({ message: "Password reset link sent to email" });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reset Password Route
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Profile Route
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const {
      fullName,
      phone,
      address,
      defaultDeliveryMethod
    } = req.body;

    // Update delivery info
    user.deliveryInfo = {
      fullName: fullName || user.deliveryInfo?.fullName || '',
      phone: phone || user.deliveryInfo?.phone || '',
      address: address || user.deliveryInfo?.address || '',
      defaultDeliveryMethod: defaultDeliveryMethod || user.deliveryInfo?.defaultDeliveryMethod || 'delivery'
    };

    await user.save();
    res.json({ 
      message: "Profile updated successfully",
      deliveryInfo: user.deliveryInfo
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
