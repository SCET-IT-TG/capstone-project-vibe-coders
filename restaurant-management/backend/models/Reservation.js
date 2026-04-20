const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String, required: true },
  customerEmail: { type: String },
  customerPhone: { type: String },
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  tableNumber: { type: String },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  guestCount: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ['confirmed', 'pending', 'cancelled', 'completed'], default: 'confirmed' },
  specialRequests: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
