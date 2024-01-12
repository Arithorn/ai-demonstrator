import { sequelize } from "../db.mjs";
import { DataTypes } from "sequelize";

const user = sequelize.define(
  "user",
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
        len: [1, 255], // Adjust the maximum length as needed
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255],
      },
    },
    auth: {
      type: DataTypes.BOOLEAN,
    },
  },
  {
    timestamps: true, // Include createdAt and updatedAt timestamps
  }
);

export { user };
