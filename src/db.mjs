import { Sequelize } from "sequelize";

const sequelize = new Sequelize({ dialect: "sqlite", storage: "db.sqlite" });

const setupDb = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    await sequelize.sync();
    console.log("Database synchronized successfully.");

    return { success: true, sequelize };
  } catch (error) {
    console.error("Database setup failed:", error.message);
    return { success: false, error: error.message };
  }
};

export { setupDb, sequelize };
