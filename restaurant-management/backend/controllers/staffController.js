const User = require('../models/User');

exports.getStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' }).select('-password').sort({ name: 1 });
    res.json(staff);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createStaff = async (req, res) => {
  try {
    const { name, email, password, phone, position, shiftEnd } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const staff = await User.create({ name, email, password, phone, role: 'staff', position, shiftEnd });
    res.status(201).json({ id: staff._id, name: staff.name, email: staff.email, position: staff.position });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateStaff = async (req, res) => {
  try {
    const { password, ...updates } = req.body;
    const staff = await User.findById(req.params.id);
    if (!staff || staff.role !== 'staff') return res.status(404).json({ message: 'Staff not found' });
    Object.assign(staff, updates);
    if (password) staff.password = password;
    await staff.save();
    res.json({ message: 'Staff updated', staff: { id: staff._id, name: staff.name } });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);
    if (!staff || staff.role !== 'staff') return res.status(404).json({ message: 'Staff not found' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Staff deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getStaffStats = async (req, res) => {
  try {
    const total = await User.countDocuments({ role: 'staff', isActive: true });
    const staff = await User.find({ role: 'staff' }).select('serviceRating tablesManaged');
    const avgRating = staff.length ? (staff.reduce((s, m) => s + m.serviceRating, 0) / staff.length).toFixed(1) : 0;
    const totalTables = staff.reduce((s, m) => s + m.tablesManaged, 0);
    res.json({ totalActive: total, avgServiceRating: avgRating, totalTablesManaged: totalTables, floorEfficiency: 94 });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
