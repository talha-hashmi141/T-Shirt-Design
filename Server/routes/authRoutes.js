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

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ 
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        deliveryInfo: user.deliveryInfo
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Profile Route
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      username,
      email,
      currentPassword,
      newPassword,
      fullName,
      phone,
      address,
      defaultDeliveryMethod
    } = req.body;

    // Update delivery info
    user.deliveryInfo = {
      fullName: fullName || user.deliveryInfo?.fullName,
      phone: phone || user.deliveryInfo?.phone,
      address: address || user.deliveryInfo?.address,
      defaultDeliveryMethod: defaultDeliveryMethod || user.deliveryInfo?.defaultDeliveryMethod
    };

    // Update other fields
    if (username) user.username = username;
    if (email) user.email = email;

    // Handle password change
    if (currentPassword && newPassword) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
      user.password = newPassword;
    }

    await user.save();
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
