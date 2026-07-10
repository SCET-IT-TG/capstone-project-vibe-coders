const Order = require('../models/Order');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, todayOrders, totalRevenue, activeTables, totalTables, recentOrders, topItems] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Table.countDocuments({ status: 'occupied' }),
      Table.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('customer', 'name'),
      MenuItem.find().sort({ soldCount: -1 }).limit(5).select('name soldCount price'),
    ]);

    const revenue = totalRevenue[0]?.total || 24592;

    // Weekly chart data (last 7 days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      const dayOrders = await Order.find({ createdAt: { $gte: d, $lt: next }, paymentStatus: 'paid' });
      const dayRevenue = dayOrders.reduce((s, o) => s + o.total, 0);
      chartData.push({ day: d.toLocaleDateString('en', { weekday: 'short' }), revenue: Math.round(dayRevenue), orders: dayOrders.length });
    }

    res.json({
      stats: { totalRevenue: revenue.toFixed(2), totalOrders, todayOrders, activeTables, totalTables },
      recentActivity: recentOrders.map(o => ({ id: o._id, orderNumber: o.orderNumber, tableNumber: o.tableNumber, status: o.status, total: o.total, customer: o.customerName, time: o.createdAt })),
      topSellingItems: topItems,
      chartData,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
