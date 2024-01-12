import OpenAI from "openai";
import fs from "fs/promises";
import { v4 as uuid } from "uuid";

import { tts } from "./models/TTS.mjs";

const openai = new OpenAI();
const ttsModel = "tts-1";
const ttsVoice = "alloy";

const textToSpeech = async (email, message) => {
  try {
    const mp3 = await openai.audio.speech.create({
      model: ttsModel,
      voice: ttsVoice,
      input: message,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const fname = `${uuid()}.mp3`;
    const fullfname = `./assets/mp3/${fname}`;

    // Uncomment the next line to save the MP3 file locally
    await fs.writeFile(fullfname, buffer);

    // Update database with new file name and user email
    await tts.create({ email, message, fname });

    return { status: true, message: "File Created" };
  } catch (error) {
    console.error("Error converting text to speech:", error);
    return { status: false, message: "Text to speech failed" };
  }
};

export { textToSpeech };
