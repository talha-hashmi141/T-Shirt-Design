const express = require("express");
const Order = require("../models/Order");
const GuestInfo = require("../models/GuestInfo");
const nodemailer = require("nodemailer");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

// Generate order number
const generateOrderNumber = () => {
  return 'ORD' + Date.now().toString().slice(-8) + Math.random().toString(36).substring(2, 5).toUpperCase();
};

// Get guest info by email
router.get("/guest-info/:email", async (req, res) => {
  try {
    const guestInfo = await GuestInfo.findOne({ email: req.params.email });
    if (!guestInfo) {
      return res.status(404).json({ error: "No saved information found" });
    }
    res.json(guestInfo);
  } catch (error) {
    console.error('Error fetching guest info:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save or update guest info
router.post("/guest-info", async (req, res) => {
  try {
    const {
      email,
      fullName,
      phone,
      address,
      defaultDeliveryMethod
    } = req.body;

    const guestInfo = await GuestInfo.findOneAndUpdate(
      { email },
      {
        email,
        fullName,
        phone,
        address,
        defaultDeliveryMethod,
        lastUpdated: Date.now()
      },
      { upsert: true, new: true }
    );

    res.json({
      message: "Information saved successfully",
      guestInfo
    });
  } catch (error) {
    console.error('Error saving guest info:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Order API is working" });
});

// Create order
router.post("/orders", authMiddleware, async (req, res) => {
  try {
    console.log('Received order request:', req.body);
    
    const {
      fullName,
      email,
      phone,
      deliveryMethod,
      address,
      sizeData,
      totalPrice,
      designImage
    } = req.body;

    const orderNumber = generateOrderNumber();

    // Create new order with user ID
    const order = new Order({
      orderNumber,
      userId: req.user, // Add authenticated user's ID
      fullName,
      email,
      phone,
      deliveryMethod,
      address: deliveryMethod === 'delivery' ? address : '',
      sizeData,
      totalPrice,
      designImage,
      status: 'pending'
    });

    await order.save();
    console.log('Order saved successfully:', orderNumber);

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Send confirmation email
    try {
      await transporter.sendMail({
        to: email,
        subject: `Order Confirmation - ${orderNumber}`,
        html: `
          <h1>Order Confirmation</h1>
          <p>Thank you for your order!</p>
          <p>Order Number: ${orderNumber}</p>
          <h2>Order Details:</h2>
          <p>Name: ${fullName}</p>
          <p>Total Amount: $${totalPrice}</p>
          <p>Delivery Method: ${deliveryMethod}</p>
          ${deliveryMethod === 'delivery' ? `<p>Delivery Address: ${address}</p>` : ''}
          <h3>Size Details:</h3>
          <ul>
            ${Object.entries(sizeData)
              .filter(([_, quantity]) => quantity > 0)
              .map(([size, quantity]) => `<li>${size.toUpperCase()}: ${quantity}</li>`)
              .join('')}
          </ul>
          <p>We'll process your order soon!</p>
        `
      });
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Continue with order confirmation even if email fails
    }

    res.json({ 
      message: "Order placed successfully", 
      orderNumber 
    });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ error: error.message || 'Failed to place order' });
  }
});

// Get user's orders
router.get("/orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get specific order
router.get("/orders/:orderNumber", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      orderNumber: req.params.orderNumber,
      userId: req.user 
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

module.exports = router; 