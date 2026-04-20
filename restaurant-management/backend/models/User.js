const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'staff', 'customer'], default: 'customer' },
  phone: { type: String },
  // Staff-specific
  position: { type: String },
  shiftEnd: { type: String },
  tablesManaged: { type: Number, default: 0 },
  serviceRating: { type: Number, default: 4.8 },
  isActive: { type: Boolean, default: true },
  // Customer-specific
  loyaltyTier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  notes: { type: String },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
