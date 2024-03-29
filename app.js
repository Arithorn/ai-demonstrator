import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
// import { Sequelize } from "sequelize";

import { setupDb } from "./src/db.mjs";
import { setupRoutes } from "./src/routes.mjs";

import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const port = 3000;
const app = express();
let sequelize;
const limiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 20 });

app.use(compression());
// app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: "*" }));
// app.use(limiter);
app.use(bodyParser.json());

const main = async () => {
  sequelize = await setupDb();
  await setupRoutes(app);

  try {
    app.listen(port, () => {
      console.info(`Application Listening in port ${port}`);
    });
  } catch (err) {
    console.error(err);
  }
};
main();
