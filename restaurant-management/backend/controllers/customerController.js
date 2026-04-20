const User = require('../models/User');
const Order = require('../models/Order');

exports.getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getCustomer = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    const orders = await Order.find({ customer: req.params.id }).sort({ createdAt: -1 }).limit(10);
    res.json({ customer, recentOrders: orders });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customer = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteCustomer = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Customer deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getCustomerStats = async (req, res) => {
  try {
    const total = await User.countDocuments({ role: 'customer' });
    const customers = await User.find({ role: 'customer' }).select('totalOrders loyaltyTier');
    const returning = customers.filter(c => c.totalOrders > 1).length;
    const returningRate = total ? Math.round((returning / total) * 100) : 0;
    const avgLoyalty = 4.8;
    res.json({ totalPatrons: total, avgLoyalty, returningRate: `${returningRate}%` });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
