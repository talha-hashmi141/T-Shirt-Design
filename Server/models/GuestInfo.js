const mongoose = require("mongoose");

const guestInfoSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    default: ''
  },
  defaultDeliveryMethod: {
    type: String,
    enum: ['delivery', 'pickup'],
    default: 'delivery'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("GuestInfo", guestInfoSchema); 