import { expressjwt as jwt } from "express-jwt";
import passport from "passport";
import { sendMp3, deleteMp3, sendMp3List } from "./audio.mjs";
import {
  deleteJpg,
  generatePicture,
  sendJpg,
  sendJpgList,
} from "./picturegen.mjs";
import { textToSpeech } from "./tts.mjs";
import { loginUser, registerUser } from "./users.mjs";
import "dotenv/config";
import { chat } from "./chat.mjs";
import { stream } from "./stream.mjs";
import { reviewPullRequest } from "./github.mjs";
import { healthCheck } from "./health-check.mjs";

const setupRoutes = (app) => {
  app.use(
    "/api",
    jwt({ secret: process.env.JWT_SECRET, algorithms: ["HS256"] })
  );

  app.get("/", (req, res) => {
    res.send("Hello World");
  });
  app.get("/health", async (req, res) => {
    const result = await healthCheck();
    res.send(result);
  });

  app.get("/api/mp3", async (req, res) => {
    try {
      let result = await sendMp3List(req.auth.email);
      res.send(result);
    } catch (error) {
      console.error("Error fetching mp3 list:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  });

  app.get("/api/jpg", async (req, res) => {
    try {
      let result = await sendJpgList(req.auth.email);
      res.send(result);
    } catch (error) {
      console.error("Error fetching jpg list:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  });

  app.delete("/api/mp3/:fname", async (req, res) => {
    try {
      let result = await deleteMp3(res, req.params.fname);
      res.send(result);
    } catch (error) {
      console.error("Error deleting mp3:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  });

  app.get("/mp3/:fname", (req, res) => {
    try {
      sendMp3(res, req.params.fname);
    } catch (error) {
      console.error("Error sending mp3:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  });

  app.get("/jpg/:fname", (req, res) => {
    try {
      sendJpg(res, req.params.fname);
    } catch (error) {
      console.error("Error sending jpg:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  });
  app.delete("/api/jpg/:fname", async (req, res) => {
    try {
      let result = await deleteJpg(res, req.params.fname);
      res.send(result);
    } catch (error) {
      console.error("Error deleting jpg:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  });

  app.post("/api/tts", async (req, res) => {
    try {
      let result = await textToSpeech(
        req.auth.email,
        req.body.voice,
        req.body.message
      );
      res.send(result);
    } catch (error) {
      console.error("Error processing TTS request:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  });

  app.post("/api/image", async (req, res) => {
    try {
      let result = await generatePicture(req.auth.email, req.body.prompt);
      res.send(result);
    } catch (error) {
      console.error("Error generating picture:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { model, messages } = req.body;
      let result = await chat(model, messages);
      res.send(result);
    } catch (error) {
      console.error("Error processing chat request:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  });

  app.post("/api/stream", async (req, res) => {
    try {
      const { model, messages } = req.body;
      console.log(req.body);
      stream(res, model, messages);
      // res.send(result);
    } catch (error) {
      console.error("Error processing chat request:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  });

  app.post("/api/pullrequest", async (req, res) => {
    try {
      console.log(req.body);
      const result = await reviewPullRequest(res, req.body);
      res.send(result);
    } catch (error) {
      console.error("Error processing pull request:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  });

  // SAML authentication route
  app.get("/auth/saml", passport.authenticate("saml"));
  // SAML callback route
  app.post(
    "/auth/saml/callback",
    passport.authenticate("saml", {
      failureRedirect: "/login",
      failureFlash: true,
      session: false,
      validateInResponseTo: false,
    }),
    (req, res) => {
      res.redirect(`${process.env.SITE_URL}/post-auth/${req.user}`);
    }
  );
};

export { setupRoutes };
