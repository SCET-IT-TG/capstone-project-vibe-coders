const Order = require('../models/Order');
const User = require('../models/User');

exports.getBill = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('items.menuItem', 'name price').populate('customer', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.processPayment = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.paymentMethod = paymentMethod;
    order.paymentStatus = 'paid';
    order.status = 'completed';
    await order.save();
    res.json({ message: 'Payment processed', order });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getRevenueSummary = async (req, res) => {
  try {
    const { period = 'today' } = req.query;
    const now = new Date();
    let startDate = new Date();
    if (period === 'today') startDate.setHours(0, 0, 0, 0);
    else if (period === 'week') startDate.setDate(now.getDate() - 7);
    else if (period === 'month') startDate.setMonth(now.getMonth() - 1);

    const orders = await Order.find({ createdAt: { $gte: startDate }, paymentStatus: 'paid' });
    const revenue = orders.reduce((sum, o) => sum + o.total, 0);
    res.json({ period, revenue: revenue.toFixed(2), orderCount: orders.length, avgOrderValue: orders.length ? (revenue / orders.length).toFixed(2) : 0 });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
