import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { connectToDatabase } from '../src/lib/db';
import { User } from '../src/models/User';
import bcrypt from 'bcryptjs';

async function createAdminAccount() {
  try {
    console.log('Connecting to MongoDB...');
    await connectToDatabase();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@travelgenie.local';
    const adminPassword = process.env.ADMIN_PASSWORD || 'TravelGenie@2026!';

    // Check if user with adminEmail already exists
    let existingUser = await User.findOne({ email: adminEmail.toLowerCase().trim() });

    if (existingUser) {
      existingUser.role = 'admin';
      existingUser.isActive = true;
      existingUser.passwordHash = await bcrypt.hash(adminPassword, 10);
      await existingUser.save();
      console.log(`Admin account updated:`);
      console.log(adminEmail);
    } else {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: 'Travel Genie Admin',
        email: adminEmail.toLowerCase().trim(),
        passwordHash,
        role: 'admin',
        isActive: true,
        emailVerified: true,
      });
      console.log(`Admin account ready:`);
      console.log(adminEmail);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    process.exit(1);
  }
}

createAdminAccount();
