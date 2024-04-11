import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
// import { Sequelize } from "sequelize";

import { setupDb } from "./src/db.mjs";
import { setupRoutes } from "./src/routes.mjs";

import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import passport from "passport";
import { Strategy as SamlStrategy } from "@node-saml/passport-saml";
import jsonwebtoken from "jsonwebtoken";

const port = 3000;
const app = express();
let sequelize;
const limiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 20 });
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(compression());
app.use(helmet());
// app.use(cors({ origin: "*" }));
// app.use(limiter);
app.use(bodyParser.json());
const siteUrl = process.env.SITE_URL || "http://localhost:3000";
const samlEntryPoint = process.env.SAML_ENTRY_POINT || "";
const idpCert = process.env.SAML_CERT || "";
const samlStrat = new SamlStrategy(
  {
    entryPoint: samlEntryPoint,
    issuer: `${siteUrl}/auth/saml/callback`,
    callbackUrl: `${siteUrl}/auth/saml/callback`,
    authnContext: [
      "http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/password",
    ],
    racComparison: "exact",
    signatureAlgorithm: "sha256",
    idpCert,
    wantAuthnResponseSigned: true,
    wantAssertionsSigned: true,
    identifierFormat: null,
  },
  (profile, done) => {
    console.log(profile);
    const user = {
      id: profile.nameID,
      email: profile.nameID,
      displayName: profile.displayName,
      issuer: profile.issuer,
      loginTime: new Date(),
    };
    const token = jsonwebtoken.sign(user, process.env.JWT_SECRET);
    done(null, token);
  }
);

passport.use(samlStrat);
app.set("trust proxy", 1);
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
