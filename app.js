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
import { Strategy as SamlStrategy } from "passport-saml";
// import generateJwtToken from "./src/utils/generateJwtToken.mjs";
import jsonwebtoken from "jsonwebtoken";
// import session from "express-session";

const port = 3000;
const app = express();
let sequelize;
const limiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 20 });
// app.use(cookieParser());
// app.use(session);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(compression());
// app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: "*" }));
// app.use(limiter);
app.use(bodyParser.json());

const cert = `MIIC8DCCAdigAwIBAgIQX4yCFn/lwpRM3/R2GvzBWjANBgkqhkiG9w0BAQsFADA0MTIwMAYDVQQDEylNaWNyb3NvZnQgQXp1cmUgRmVkZXJhdGVkIFNTTyBDZXJ0aWZpY2F0ZTAeFw0yNDA0MDkxMjA1MDZaFw0yNzA0MDkxMjA1MDZaMDQxMjAwBgNVBAMTKU1pY3Jvc29mdCBBenVyZSBGZWRlcmF0ZWQgU1NPIENlcnRpZmljYXRlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwJQPxKxBybHiWCrdPx/CxPLAtjcTFKJCdzcxajXmlX+6bO9xeTL2XYN7qq6DegTpkOdaeSC4LpGldHg5EGayrstBsV8vDpp2GNN559f95VPg+LjfYgdYKXChLVbAWZDJRjyRQLW07fPQfAmTB47Uk2eSDJq9VHNLOXLGX+5joFhYsYx4Dz1Mlxir3u4FCtvb/Ij9fGsSTGXG8UsO2nrkr/oKkr5dV60121lqp5ROCS3aTNmp4PUFlAMFp7qCIR0odMTvNJUdQyiNjL6TLG2yYCBDn1t9aB45Yw7vaXCQ1GF9aDbfu6vni3CwkX7xUbyetBKcr834j59zZNq5YPUBIQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQC+QZr2Tw5aKffLTMt1slAV7NWwYm1UN4iFEjzMs1RTRNMA06lNIOkpW19l+Cszc8ZnZ8gal5Vo+ZuupjUNnPwskx/cIFmDxpMZN0vm7fF9MSqm0elR7+QaOPj6g7D4aqfTxKylv2rF2n7tf22dagQMSZYyBtYztWamgkRFmpWlLlrgcR8Sc7uhZX/hjF8XEs3A8kU/fYlcF67eYkiZF3/t14qlN2UG5GYsCshHBpdb+QlEZ69lz6c9eGHswtQd9qRd6k7ZDTf65LZbG/iyxBcjvJeqa8laknhaJij8dkIiOVq9MDsb6HnQSjyRJ0vkCCo7ghHfbeRbNx7V5Xes0IDC`;
passport.use(
  new SamlStrategy(
    {
      entryPoint:
        "https://login.microsoftonline.com/585e8d5e-ea4d-4c9e-9ad0-ceaf54dfe454/saml2",
      issuer: "http://mc.manbatcave.com:3000/auth/saml/callback",
      callbackUrl: "http://mc.manbatcave.com:3000/auth/saml/callback",
      cert,
      // Other configuration options
    },
    (profile, done) => {
      console.log(profile);
      // Handle the authenticated user
      // Generate a JWT token and return it
      // const token = generateJwtToken(profile);
      const token = jsonwebtoken.sign(profile, process.env.JWT_SECRET);
      done(null, token);
    }
  )
);
app.use(passport.initialize({}));
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
