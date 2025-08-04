const mongoose = require('mongoose');

// MongoDB connection
const mongoURI = 'mongodb+srv://chanthrampelli2005:Charith%402005@cluster0.6ysqk.mongodb.net/e-commerce';

// Admin Schema (same as in index.js)
const Admin = mongoose.model('Admin', new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'admin',
  },
  date: {
    type: Date,
    default: Date.now,
  }
}));

async function listAdmins() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Get all admin users
    const admins = await Admin.find({});
    
    console.log('\n📋 All Admin Users:');
    console.log('==================');
    
    if (admins.length === 0) {
      console.log('No admin users found.');
    } else {
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. Name: ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Created: ${admin.date}`);
        console.log('   ---');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error listing admin users:', error);
    process.exit(1);
  }
}

listAdmins();
