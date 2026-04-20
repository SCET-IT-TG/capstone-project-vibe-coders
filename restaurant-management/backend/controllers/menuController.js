const MenuItem = require('../models/MenuItem');

exports.getMenuItems = async (req, res) => {
  try {
    const { category, available } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (available !== undefined) filter.isAvailable = available === 'true';
    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getStats = async (req, res) => {
  try {
    const total = await MenuItem.countDocuments();
    const outOfStock = await MenuItem.countDocuments({ isAvailable: false });
    const categories = await MenuItem.distinct('category');
    const popular = await MenuItem.findOne({ isPopular: true }).select('name');
    res.json({ total, outOfStock, activeCategories: categories.length, popularItem: popular?.name || 'N/A' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
