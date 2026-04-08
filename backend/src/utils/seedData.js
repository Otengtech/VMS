import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'; // ✅ Add bcrypt import
import User from '../../models/User.model.js';
import connectDB from '../../config/database.js';

// Load env vars first
dotenv.config();

const importData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
    
    if (existingSuperAdmin) {
      console.log('⚠️ Super Admin already exists!');
      console.log(`📧 Email: ${existingSuperAdmin.email}`);
      console.log('Skipping creation...');
      process.exit(0);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('super@admin.com', salt);

    // Create super admin user with hashed password
    console.log('Creating Super Admin user...');
    const superAdmin = await User.create({
      name: "System Administrator",
      email: "super@admin.com",
      password: hashedPassword, // ✅ Use hashed password
      role: "superadmin",
      terminalId: null,
      isFirstLogin: true
    });
    
    console.log('✅ Super Admin created successfully!');
    console.log('\nYou can now login with:');
    console.log(`📧 Email: ${superAdmin.email}`);
    console.log(`🔑 Password: super@admin.com`);
    console.log('\n⚠️ Please change your password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    if (error.code === 11000) {
      console.error('Duplicate key error. Super admin email already exists.');
    }
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    
    console.log('Destroying super admin...');
    const result = await User.deleteOne({ role: 'superadmin', email: 'super@admin.com' });
    
    if (result.deletedCount > 0) {
      console.log('✅ Super admin destroyed successfully!');
    } else {
      console.log('⚠️ No super admin found to delete.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}