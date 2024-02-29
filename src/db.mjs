import { Sequelize } from "sequelize";
import "dotenv/config";

const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  ssl: true,
  native: true,
  dialect: "postgres",
  authenticate: true,
});
const setupDb = async () => {
  console.log("Setting up database...");
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
