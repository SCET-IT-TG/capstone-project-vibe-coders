const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  number: { type: mongoose.Schema.Types.Mixed, required: true, unique: true },
  capacity: { type: Number, required: true },
  type: { type: String, enum: ['standard', 'booth', 'bar', 'private'], default: 'standard' },
  status: { type: String, enum: ['available', 'occupied', 'reserved', 'cleaning'], default: 'available' },
  location: { type: String, enum: ['window', 'main', 'private', 'bar'], default: 'main' },
  currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  seatedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);
