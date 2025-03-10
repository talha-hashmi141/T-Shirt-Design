const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  // Add delivery information
  deliveryInfo: {
    fullName: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    defaultDeliveryMethod: { type: String, enum: ['delivery', 'pickup'], default: 'delivery' },
    lastUpdated: { type: Date, default: Date.now }
  }
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Check if the password is modified; if not, move to the next middleware
  if (!this.isModified("password")) return next();

  try { 
    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next(); // Call next middleware
  } catch (err) {
    next(err); // Pass error to the next middleware
  }
});

// Compare passwords
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
