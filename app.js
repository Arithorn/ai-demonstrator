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
import session from "express-session";

const port = 3000;
const app = express();
let sequelize;
const limiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 20 });

// app.use(
//   session({
//     secret: "keyboard cat",
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: true },
//   })
// );
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(compression());
// app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: "*" }));
// app.use(limiter);
app.use(bodyParser.json());

const mockCert = `MIIC4jCCAcoCCQC33wnybT5QZDANBgkqhkiG9w0BAQsFADAyMQswCQYDVQQGEwJVSzEPMA0GA1UECgwGQm94eUhRMRIwEAYDVQQDDAlNb2NrIFNBTUwwIBcNMjIwMjI4MjE0NjM4WhgPMzAyMTA3MDEyMTQ2MzhaMDIxCzAJBgNVBAYTAlVLMQ8wDQYDVQQKDAZCb3h5SFExEjAQBgNVBAMMCU1vY2sgU0FNTDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALGfYettMsct1T6tVUwTudNJH5Pnb9GGnkXi9Zw/e6x45DD0RuRONbFlJ2T4RjAE/uG+AjXxXQ8o2SZfb9+GgmCHuTJFNgHoZ1nFVXCmb/Hg8Hpd4vOAGXndixaReOiq3EH5XvpMjMkJ3+8+9VYMzMZOjkgQtAqO36eAFFfNKX7dTj3VpwLkvz6/KFCq8OAwY+AUi4eZm5J57D31GzjHwfjH9WTeX0MyndmnNB1qV75qQR3b2/W5sGHRv+9AarggJkF+ptUkXoLtVA51wcfYm6hILptpde5FQC8RWY1YrswBWAEZNfyrR4JeSweElNHg4NVOs4TwGjOPwWGqzTfgTlECAwEAATANBgkqhkiG9w0BAQsFAAOCAQEAAYRlYflSXAWoZpFfwNiCQVE5d9zZ0DPzNdWhAybXcTyMf0z5mDf6FWBW5Gyoi9u3EMEDnzLcJNkwJAAc39Apa4I2/tml+Jy29dk8bTyX6m93ngmCgdLh5Za4khuU3AM3L63g7VexCuO7kwkjh/+LqdcIXsVGO6XDfu2QOs1Xpe9zIzLpwm/RNYeXUjbSj5ce/jekpAw7qyVVL4xOyh8AtUW1ek3wIw1MJvEgEPt0d16oshWJpoS1OT8Lr/22SvYEo3EmSGdTVGgk3x3s+A0qWAqTcyjr7Q4s/GKYRFfomGwz0TZ4Iw1ZN99Mm0eo2USlSRTVl7QHRTuiuSThHpLKQQ==`;
const idpCert = `MIIC8DCCAdigAwIBAgIQX4yCFn/lwpRM3/R2GvzBWjANBgkqhkiG9w0BAQsFADA0MTIwMAYDVQQDEylNaWNyb3NvZnQgQXp1cmUgRmVkZXJhdGVkIFNTTyBDZXJ0aWZpY2F0ZTAeFw0yNDA0MDkxMjA1MDZaFw0yNzA0MDkxMjA1MDZaMDQxMjAwBgNVBAMTKU1pY3Jvc29mdCBBenVyZSBGZWRlcmF0ZWQgU1NPIENlcnRpZmljYXRlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwJQPxKxBybHiWCrdPx/CxPLAtjcTFKJCdzcxajXmlX+6bO9xeTL2XYN7qq6DegTpkOdaeSC4LpGldHg5EGayrstBsV8vDpp2GNN559f95VPg+LjfYgdYKXChLVbAWZDJRjyRQLW07fPQfAmTB47Uk2eSDJq9VHNLOXLGX+5joFhYsYx4Dz1Mlxir3u4FCtvb/Ij9fGsSTGXG8UsO2nrkr/oKkr5dV60121lqp5ROCS3aTNmp4PUFlAMFp7qCIR0odMTvNJUdQyiNjL6TLG2yYCBDn1t9aB45Yw7vaXCQ1GF9aDbfu6vni3CwkX7xUbyetBKcr834j59zZNq5YPUBIQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQC+QZr2Tw5aKffLTMt1slAV7NWwYm1UN4iFEjzMs1RTRNMA06lNIOkpW19l+Cszc8ZnZ8gal5Vo+ZuupjUNnPwskx/cIFmDxpMZN0vm7fF9MSqm0elR7+QaOPj6g7D4aqfTxKylv2rF2n7tf22dagQMSZYyBtYztWamgkRFmpWlLlrgcR8Sc7uhZX/hjF8XEs3A8kU/fYlcF67eYkiZF3/t14qlN2UG5GYsCshHBpdb+QlEZ69lz6c9eGHswtQd9qRd6k7ZDTf65LZbG/iyxBcjvJeqa8laknhaJij8dkIiOVq9MDsb6HnQSjyRJ0vkCCo7ghHfbeRbNx7V5Xes0IDC`;
const adfsSamlStrategy = new SamlStrategy(
  {
    entryPoint:
      "https://login.microsoftonline.com/585e8d5e-ea4d-4c9e-9ad0-ceaf54dfe454/saml2",
    issuer: "https://mc.manbatcave.com:5173/auth/saml/callback",
    callbackUrl: "https://mc.manbatcave.com:5173/auth/saml/callback",
    authnContext: [
      "http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/password",
    ],
    racComparison: "exact",
    signatureAlgorithm: "sha256",
    idpCert,
    wantAuthnResponseSigned: false,
    wantAssertionsSigned: false,
    identifierFormat: null,
  },
  (profile, done) => {
    const user = {
      id: profile.nameID,
      email: profile.nameID,
      displayName: profile.displayName,
      issuer: profile.issuer,
      loginTime: new Date(),
    };
    console.log(user);
    const token = jsonwebtoken.sign(user, process.env.JWT_SECRET);
    done(null, token);
  }
);

const mockSamlStrategy = new SamlStrategy(
  {
    entryPoint: "https://mocksaml.com/api/saml/sso",
    issuer: "https://mc.manbatcave.com:5173/auth/saml/callback",
    callbackUrl: "https://mc.manbatcave.com:5173/auth/saml/callback",
    signatureAlgorithm: "sha256",
    idpCert: mockCert,
    identifierFormat: null,
  },
  (profile, done) => {
    const user = {
      id: profile.nameID,
      email: profile.nameID,
      displayName: profile.displayName,
      issuer: profile.issuer,
      loginTime: new Date(),
    };
    console.log(user);
    const token = jsonwebtoken.sign(user, process.env.JWT_SECRET);
    done(null, token);
  }
);
passport.use(adfsSamlStrategy);
// passport.use(mockSamlStrategy);
// passport.initialize();
// app.use(
//   passport.session({
//     Secret: "keyboard cat",
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: true },
//   })
// );
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
