const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/tables', require('./routes/tables'));

app.get('/', (req, res) => res.json({ message: 'The Culinary Architect API Running' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🍽️  Server running on port ${PORT}`));
