import { expressjwt as jwt } from "express-jwt";
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

const setupRoutes = (app) => {
  app.use(
    "/api",
    jwt({ secret: process.env.JWT_SECRET, algorithms: ["HS256"] })
  );

  app.get("/", (req, res) => {
    res.send("Hello World");
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

  app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      let data = await loginUser(email, password);
      res.send(data);
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  });

  app.post("/register", async (req, res) => {
    const { email, password } = req.body;
    try {
      let data = await registerUser(email, password);
      res.send(data);
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  });
};

export { setupRoutes };
