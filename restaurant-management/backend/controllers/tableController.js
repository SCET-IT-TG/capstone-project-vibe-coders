const Table = require('../models/Table');

exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({ number: 1 }).populate('currentOrder');
    res.json(tables);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateTableStatus = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.json(table);
  } catch (err) { res.status(400).json({ message: err.message }); }
};
