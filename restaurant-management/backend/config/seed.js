const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected for seeding');
};

const seed = async () => {
  await connectDB();

  // Clear existing
  await User.deleteMany({});
  await MenuItem.deleteMany({});
  await Table.deleteMany({});

  // Create users
  const hashedAdmin = await bcrypt.hash('admin123', 10);
  const hashedStaff = await bcrypt.hash('staff123', 10);
  const hashedCustomer = await bcrypt.hash('customer123', 10);

  await User.insertMany([
    { name: 'Admin Chef', email: 'admin@culina.com', password: hashedAdmin, role: 'admin', phone: '555-0001' },
    { name: 'Julian Ricci', email: 'julian@culina.com', password: hashedStaff, role: 'staff', position: 'Sous Chef', phone: '555-0002', shiftEnd: '11:00 PM', tablesManaged: 24 },
    { name: 'Sofia Mancini', email: 'sofia@culina.com', password: hashedStaff, role: 'staff', position: 'Head Waiter', phone: '555-0003', shiftEnd: '10:00 PM', tablesManaged: 18 },
    { name: 'Julian Casablancas', email: 'julian.c@email.com', password: hashedCustomer, role: 'customer', phone: '555-1001', loyaltyTier: 'platinum', totalOrders: 42 },
    { name: 'Eleanor Shellstrop', email: 'eleanor@email.com', password: hashedCustomer, role: 'customer', phone: '555-1002', loyaltyTier: 'gold', totalOrders: 18 },
  ]);

  // Create menu items
  await MenuItem.insertMany([
  
    // STARTERS
    { name: 'Tandoori Paneer Tikka', description: 'Charcoal-grilled cottage cheese marinated in hung curd, Kashmiri chili, and spices', category: 'starters', price: 380, isAvailable: true, isPopular: true },
    { name: 'Palak Patta Chaat', description: 'Crispy spinach leaves topped with sweetened yogurt, tamarind glaze, and mint chutney', category: 'starters', price: 290, isAvailable: true },
    { name: 'Hara Bhara Kebab', description: 'Pan-seared spiced patties of spinach, green peas, and roasted cashews', category: 'starters', price: 320, isAvailable: true, isFeatured: true },
    { name: 'Dahi Ke Sholay', description: 'Crispy bread rolls stuffed with hung curd, bell peppers, and fresh coriander', category: 'starters', price: 340, isAvailable: true },
    { name: 'Tandoori Stuffed Mushroom', description: 'Button mushrooms stuffed with cheese and spices, roasted in a clay oven', category: 'starters', price: 350, isAvailable: true },
    { name: 'Crispy Lotus Stem', description: 'Thinly sliced lotus stem tossed in a tangy honey-chili plum sauce', category: 'starters', price: 310, isAvailable: true },
    { name: 'Veg Galouti Kebab', description: 'Melt-in-the-mouth smoked mushroom and lentil kebabs served on mini parathas', category: 'starters', price: 390, isAvailable: true, isPopular: true },
    { name: 'Paneer Banjara', description: 'Cottage cheese cubes coated in fresh coriander, mint, and green chili marinade', category: 'starters', price: 370, isAvailable: true },
    { name: 'Kurkuri Bhindi', description: 'Thinly sliced, deep-fried okra sprinkled with tangy chaat masala', category: 'starters', price: 250, isAvailable: true },
    { name: 'Aloo Tuk', description: 'Double-fried smashed baby potatoes tossed in Sindhi spices', category: 'starters', price: 260, isAvailable: false },

    // MAINS (Curries & Rice)
    { name: 'Dal Makhani', description: 'Black lentils slow-cooked for 24 hours, finished with white butter and cream', category: 'mains', price: 390, isAvailable: true, isPopular: true },
    { name: 'Paneer Butter Masala', description: 'Cottage cheese simmered in a rich tomato, cashew, and butter gravy', category: 'mains', price: 450, isAvailable: true, isPopular: true },
    { name: 'Malai Kofta', description: 'Hand-rolled cheese and potato dumplings in a velvety cashew and saffron sauce', category: 'mains', price: 470, isAvailable: true },
    { name: 'Palak Paneer', description: 'Cottage cheese cubes cooked in a mildly spiced fresh spinach puree', category: 'mains', price: 420, isAvailable: true },
    { name: 'Smoked Baingan Bharta', description: 'Fire-roasted mashed eggplant sautéed with caramelized onions and tomatoes', category: 'mains', price: 350, isAvailable: true },
    { name: 'Kashmiri Dum Aloo', description: 'Baby potatoes slow-cooked in a yogurt-based fennel and dry ginger sauce', category: 'mains', price: 360, isAvailable: true, isFeatured: true },
    { name: 'Pindi Chole', description: 'Amritsari-style chickpeas cooked with dried amla and roasted spices', category: 'mains', price: 340, isAvailable: true },
    { name: 'Vegetable Chettinad', description: 'Mixed vegetables cooked in a fiery South Indian black pepper and coconut gravy', category: 'mains', price: 380, isAvailable: true },
    { name: 'Paneer Tikka Masala', description: 'Charred paneer cubes tossed in a robust onion and tomato masala', category: 'mains', price: 460, isAvailable: true },
    { name: 'Dal Tadka', description: 'Yellow lentils tempered with ghee, cumin, garlic, and whole red chilies', category: 'mains', price: 310, isAvailable: true },
    { name: 'Khumb Matar', description: 'Fresh button mushrooms and green peas in a savory onion gravy', category: 'mains', price: 370, isAvailable: true },
    { name: 'Subz Diwani Handi', description: 'Seasonal vegetables cooked in a creamy spinach and mint sauce', category: 'mains', price: 390, isAvailable: false },
    { name: 'Veg Hyderabadi Biryani', description: 'Basmati rice cooked with vegetables, mint, and saffron, sealed with dough', category: 'mains', price: 420, isAvailable: true, isPopular: true },
    { name: 'Awadhi Zaffrani Pulao', description: 'Mildly sweet saffron rice tossed with dry fruits and nuts', category: 'mains', price: 350, isAvailable: true },

    //Breads
    { name: 'Butter Naan', description: 'Classic leavened flatbread baked in a tandoor, brushed with butter', category: 'breads', price: 90, isAvailable: true, isPopular: true },
    { name: 'Garlic Naan', description: 'Tandoor-baked flatbread topped with minced garlic and fresh coriander', category: 'breads', price: 110, isAvailable: true, isPopular: true },
    { name: 'Tandoori Roti', description: 'Whole wheat flatbread cooked in a traditional clay oven', category: 'breads', price: 60, isAvailable: true },
    { name: 'Lachha Paratha', description: 'Flaky, multi-layered whole wheat flatbread brushed with ghee', category: 'breads', price: 100, isAvailable: true },
    { name: 'Pudina Paratha', description: 'Multi-layered flatbread flavored with dried mint leaves', category: 'breads', price: 110, isAvailable: true },
    { name: 'Paneer Kulcha', description: 'Soft bread stuffed with spiced cottage cheese and herbs', category: 'breads', price: 140, isAvailable: true, isFeatured: true },

    // DESSERTS
    { name: 'Saffron Rasmalai', description: 'Soft cottage cheese discs steeped in cardamom and saffron-infused milk', category: 'desserts', price: 220, isAvailable: true, isPopular: true },
    { name: 'Pista Gulab Jamun', description: 'Warm milk solid dumplings soaked in a delicate rose sugar syrup', category: 'desserts', price: 180, isAvailable: true },
    { name: 'Moong Dal Halwa', description: 'Rich, slow-cooked dessert made from yellow lentils, ghee, and nuts', category: 'desserts', price: 240, isAvailable: true, isFeatured: true },
    { name: 'Shahi Tukda', description: 'Fried bread slices soaked in saffron syrup, topped with reduced thickened milk', category: 'desserts', price: 250, isAvailable: true },
    { name: 'Malpua with Rabdi', description: 'Traditional Indian pancakes served warm with chilled thickened milk', category: 'desserts', price: 260, isAvailable: false },
    { name: 'Matka Kulfi', description: 'Traditional dense Indian ice cream flavored with cardamom and pistachios', category: 'desserts', price: 190, isAvailable: true },

    // BEVERAGES
    { name: 'Alphonso Mango Lassi', description: 'Thick, chilled yogurt blended with premium Alphonso mango pulp', category: 'beverages', price: 180, isAvailable: true, isPopular: true },
    { name: 'Smoked Masala Chaas', description: 'Spiced buttermilk infused with roasted cumin and smoked with charcoal', category: 'beverages', price: 120, isAvailable: true },
    { name: 'Rose Sharbat', description: 'Cooling drink made with rose syrup, sweet basil seeds, and chilled milk', category: 'beverages', price: 140, isAvailable: true },
    { name: 'Kullad Masala Chai', description: 'Traditional black tea brewed with fresh ginger and cardamom, served in an earthen cup', category: 'beverages', price: 90, isAvailable: true, isPopular: true }

]);

  // Create tables
  const tableData = [];
  for (let i = 1; i <= 12; i++) {
    tableData.push({ number: i, capacity: i <= 4 ? 2 : i <= 8 ? 4 : 6, status: i === 4 ? 'occupied' : 'available', location: i <= 3 ? 'window' : i <= 6 ? 'main' : 'private' });
  }
  tableData.push({ number: 'B1', capacity: 4, type: 'booth', status: 'available', location: 'window' });
  tableData.push({ number: 'B2', capacity: 6, type: 'booth', status: 'reserved', location: 'main' });
  await Table.insertMany(tableData);

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('Admin:    admin@culina.com / admin123');
  console.log('Staff:    julian@culina.com / staff123');
  console.log('Customer: julian.c@email.com / customer123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
