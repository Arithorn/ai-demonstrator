import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
// import { Sequelize } from "sequelize";

import { setupRoutes } from "./src/routes.mjs";
import { setupDb } from "./src/db.mjs";

const port = 3001;
const app = express();
let sequelize;
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

const main = () => {
  sequelize = setupDb();
  setupRoutes(app);

  try {
    app.listen(port, () => {
      console.info(`Application Listening in port ${port}`);
    });
  } catch (err) {
    console.error(err);
  }
};
main();
