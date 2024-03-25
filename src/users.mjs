import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";

import { user } from "./models/Users.mjs";
import "dotenv/config";

const hashPassword = async (password) => {
  console.log("Password:", password);
  try {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
};

const comparePassword = async (password, hash) => {
  try {
    const result = await bcrypt.compare(password, hash);
    return result;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    throw error;
  }
};

const loginUser = async (email, password) => {
  try {
    const luser = await user.findOne({ where: { email } });

    if (luser === null || !(await comparePassword(password, luser.password))) {
      return { status: false, message: "User not found or incorrect password" };
    }

    const claims = { email, password, auth: true };
    const token = jsonwebtoken.sign(claims, process.env.JWT_SECRET);

    return { status: true, token };
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

const registerUser = async (email, password) => {
  try {
    const existingUser = await user.findOne({ where: { email } });

    if (existingUser === null) {
      const hash = await hashPassword(password);
      await user.create({ email, password: hash });
      return { status: true, message: "User Created" };
    } else {
      return { status: false, message: "User Exists" };
    }
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export { loginUser, registerUser, user };
