import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { connectToDatabase } from '../src/lib/db';
import { User } from '../src/models/User';
import { Resort } from '../src/models/Resort';
import bcrypt from 'bcryptjs';

async function seedAdminAndRoles() {
  try {
    console.log('Connecting to MongoDB...');
    await connectToDatabase();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@travelgenie.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    const managerEmail = 'manager@travelgenie.com';
    const userAEmail = 'usera@travelgenie.com';
    const userBEmail = 'userb@travelgenie.com';

    // 1. Seed Admin
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      admin = await User.create({
        name: 'Travel Genie Admin',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        isActive: true,
        emailVerified: true,
      });
      console.log(`[SEED] Admin account created: ${adminEmail}`);
    } else {
      console.log(`[SEED] Admin account already exists: ${adminEmail}`);
    }

    // 2. Find a resort for Resort Manager test
    const firstResort = await Resort.findOne({});

    // 3. Seed Resort Manager
    let manager = await User.findOne({ email: managerEmail });
    if (!manager) {
      const passwordHash = await bcrypt.hash('Manager@123456', 10);
      manager = await User.create({
        name: 'Kerala Resort Manager',
        email: managerEmail,
        passwordHash,
        role: 'resort_manager',
        managedResortIds: firstResort ? [firstResort._id.toString()] : [],
        isActive: true,
        emailVerified: true,
      });
      console.log(`[SEED] Resort Manager account created: ${managerEmail}`);
    } else {
      console.log(`[SEED] Resort Manager account exists: ${managerEmail}`);
    }

    // Update Resort document with managerId if resort exists
    if (firstResort && manager) {
      await Resort.findByIdAndUpdate(firstResort._id, {
        $addToSet: { managerIds: manager._id.toString() },
      });
      console.log(`[SEED] Assigned Resort Manager to resort: ${firstResort.name}`);
    }

    // 4. Seed Normal User A & User B for isolation testing
    let userA = await User.findOne({ email: userAEmail });
    if (!userA) {
      const passwordHash = await bcrypt.hash('UserA@123456', 10);
      await User.create({
        name: 'User Alpha',
        email: userAEmail,
        passwordHash,
        role: 'user',
        isActive: true,
        emailVerified: true,
      });
      console.log(`[SEED] User A account created: ${userAEmail}`);
    }

    let userB = await User.findOne({ email: userBEmail });
    if (!userB) {
      const passwordHash = await bcrypt.hash('UserB@123456', 10);
      await User.create({
        name: 'User Beta',
        email: userBEmail,
        passwordHash,
        role: 'user',
        isActive: true,
        emailVerified: true,
      });
      console.log(`[SEED] User B account created: ${userBEmail}`);
    }

    console.log('✅ Seed completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedAdminAndRoles();
