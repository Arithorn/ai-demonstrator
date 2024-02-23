import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "stream";
import OpenAI from "openai";
import { v4 as uuid } from "uuid";
import "dotenv/config";
import { tts } from "./models/TTS.mjs";

const openai = new OpenAI();
const ttsModel = "tts-1";
// const ttsVoice = "alloy";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const bucketName = process.env.AWS_S3_BUCKET_NAME;

const textToSpeech = async (email, voice, message) => {
  try {
    const mp3 = await openai.audio.speech.create({
      model: ttsModel,
      voice: voice,
      input: message,
    });
    const stream = Readable.from(await mp3.body);
    const fname = `${uuid()}.mp3`;
    const params = {
      Bucket: bucketName,
      Key: `mp3/${fname}`,
      Body: stream,
    };
    const upload = new Upload({ client: s3Client, params });
    await upload.done();

    // Update database with new file name and user email
    await tts.create({ email, message, fname });

    return { status: true, message: "File Created" };
  } catch (error) {
    console.error("Error converting text to speech:", error);
    return { status: false, message: "Text to speech failed" };
  }
};

export { textToSpeech };
