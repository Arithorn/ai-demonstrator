import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";

import { user } from "./models/Users.mjs";
import "dotenv/config";

const hashPassword = async (password) => {
  const hash = await bcrypt.hash(password, 10);

  return hash;
};
const comparePassword = async (password, hash) => {
  const result = await bcrypt.compare(password, hash);
  return result;
};

const loginUser = async (email, password) => {
  const luser = await user.findOne({ where: { email } });
  if (luser === null) {
    return { status: false, message: "User Not Found or Wrong Password" };
  }
  if (await comparePassword(password, luser.password)) {
    const claims = { email, password, auth: true };
    const token = jsonwebtoken.sign(claims, process.env.JWT_SECRET);
    return { status: true, token };
  } else {
    return { status: false, message: "User Not Found or Wrong Password" };
  }
};

const registerUser = async (email, password) => {
  const luser = await user.findOne({ where: { email } });
  if (luser === null) {
    const hash = await hashPassword(password);
    await luser.create({ email, password: hash });
    return { status: true, message: "User Created" };
  } else {
    return { status: false, message: "User Exists" };
  }
};

export { loginUser, registerUser, user };
