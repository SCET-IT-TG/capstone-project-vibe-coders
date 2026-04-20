const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const Table = require('../models/Table');

exports.getOrders = async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    let filter = {};
    if (req.user.role === 'customer') filter.customer = req.user._id;
    if (status) filter.status = status;
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(Number(limit))
      .populate('customer', 'name email').populate('items.menuItem', 'name');
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'name email').populate('items.menuItem');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user.role === 'customer' && order.customer?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createOrder = async (req, res) => {
  try {
    const { items, tableNumber, guestCount, kitchenNotes } = req.body;
    const orderItems = [];
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) return res.status(404).json({ message: `Menu item not found` });
      if (!menuItem.isAvailable) return res.status(400).json({ message: `${menuItem.name} is not available` });
      orderItems.push({ menuItem: menuItem._id, name: menuItem.name, price: menuItem.price, quantity: item.quantity, notes: item.notes });
      menuItem.soldCount += item.quantity;
      await menuItem.save();
    }
    const table = await Table.findOne({ number: tableNumber });
    const order = await Order.create({
      customer: req.user._id,
      customerName: req.user.name,
      table: table?._id,
      tableNumber,
      guestCount,
      items: orderItems,
      kitchenNotes,
    });
    if (table) { table.status = 'occupied'; table.currentOrder = order._id; table.seatedAt = new Date(); await table.save(); }
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalOrders: 1, totalSpent: order.total } });
    res.status(201).json(order);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (status === 'completed' || status === 'cancelled') {
      await Table.findOneAndUpdate({ currentOrder: order._id }, { status: 'available', currentOrder: null, seatedAt: null });
    }
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
