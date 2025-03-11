const express = require("express");
const Order = require("../models/Order");
const nodemailer = require("nodemailer");
const router = express.Router();

// Generate order number
const generateOrderNumber = () => {
  return 'ORD' + Date.now().toString().slice(-8) + Math.random().toString(36).substring(2, 5).toUpperCase();
};

// Add this at the top of your routes
router.get("/test", (req, res) => {
  res.json({ message: "Order API is working" });
});

// Create order
router.post("/orders", async (req, res) => {
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

    // Create new order without userId
    const order = new Order({
      orderNumber,
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

    res.json({ 
      message: "Order placed successfully", 
      orderNumber 
    });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 