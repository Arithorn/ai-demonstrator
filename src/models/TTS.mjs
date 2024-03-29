import { sequelize } from "../db.mjs";
import { DataTypes } from "sequelize";

const tts = sequelize.define(
  "tts",
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
        len: [1, 255], // Adjust the maximum length as needed
      },
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255],
      },
    },
    fname: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255],
      },
    },
  },
  {
    timestamps: true, // Include createdAt and updatedAt timestamps
  }
);

export { tts };
