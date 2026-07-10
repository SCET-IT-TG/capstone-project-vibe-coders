const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

exports.getReservations = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'customer') filter.customer = req.user._id;
    const reservations = await Reservation.find(filter).sort({ date: 1 }).populate('customer', 'name email').populate('table');
    res.json(reservations);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createReservation = async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, tableNumber, date, time, guestCount, specialRequests } = req.body;
    const table = await Table.findOne({ number: tableNumber });
    const reservation = await Reservation.create({
      customer: req.user.role !== 'customer' ? null : req.user._id,
      customerName: customerName || req.user.name,
      customerEmail: customerEmail || req.user.email,
      customerPhone,
      table: table?._id,
      tableNumber,
      date: new Date(date),
      time,
      guestCount,
      specialRequests,
    });
    if (table) { table.status = 'reserved'; await table.save(); }
    res.status(201).json(reservation);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    res.json(reservation);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    if (reservation.tableNumber) {
      await Table.findOneAndUpdate({ number: reservation.tableNumber }, { status: 'available' });
    }
    await Reservation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reservation deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
