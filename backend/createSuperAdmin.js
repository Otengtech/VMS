import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

import connectDB from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

const createSuperAdmin = async () => {

  try {

    await connectDB();

    const existingAdmin = await User.findOne({
      role: "superadmin"
    });

    if (existingAdmin) {
      console.log("Super Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("superadmin@gmail.com", 10);

    const superAdmin = await User.create({
      name: "superadmin",
      email: "superadmin@gmail.com",
      password: hashedPassword,
      role: "superadmin"
    });

    console.log("Super Admin Created:");
    console.log(superAdmin);

    process.exit();

  } catch (error) {

    console.error(error);
    process.exit(1);

  }

};

createSuperAdmin();