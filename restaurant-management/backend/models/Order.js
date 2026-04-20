const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  notes: { type: String },
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String },
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  tableNumber: { type: String },
  guestCount: { type: Number, default: 1 },
  items: [orderItemSchema],
  status: { type: String, enum: ['new', 'preparing', 'ready', 'served', 'completed', 'cancelled'], default: 'new' },
  subtotal: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0.085 },
  tax: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['credit_card', 'cash', 'debit_card'], default: 'credit_card' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  kitchenNotes: { type: String },
  staffAssigned: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `#${2400 + count + 1}`;
  }
  this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  this.tax = parseFloat((this.subtotal * this.taxRate).toFixed(2));
  this.total = parseFloat((this.subtotal + this.tax).toFixed(2));
  next();
});

module.exports = mongoose.model('Order', orderSchema);
