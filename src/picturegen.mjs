import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { fromBase64, toBase64 } from "@aws-sdk/util-base64-node";
import { v4 as uuid } from "uuid";
import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";

import { pictures } from "./models/Pictures.mjs";

const openai = new OpenAI();
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const bucketName = process.env.AWS_S3_BUCKET_NAME;
const model = "dall-e-3";
const imageSize = "1024x1024";
const imageQuality = "standard";
const imageCount = 1;

const generatePicture = async (email, prompt) => {
  console.log(prompt);
  try {
    const jpg = await openai.images.generate({
      model,
      prompt,
      size: imageSize,
      quality: imageQuality,
      n: imageCount,
      response_format: "b64_json",
    });

    const fname = `${uuid()}.jpg`;
    const params = {
      Bucket: bucketName,
      Key: fname,
      Body: fromBase64(jpg.data[0].b64_json),
    };
    await s3Client.send(new PutObjectCommand(params));

    // Update database with new file name and user email
    await pictures.create({ email, prompt, fname });

    return { status: true, url: fname };
  } catch (error) {
    console.error("Error generating picture:", error);
    return { status: false, error: "Picture generation failed" };
  }
};

const sendJpgList = async (email) => {
  console.log(email);
  try {
    let result = await pictures.findAll({ where: { email } });
    return { list: result };
  } catch (error) {
    console.error("Error fetching jpg list:", error);
    return { error: error.message };
  }
};

const sendJpg = async (res, name) => {
  const params = {
    Bucket: bucketName,
    Key: name,
  };
  try {
    const { Body } = await s3Client.send(new GetObjectCommand(params));
    const responseStream = await Body.transformToByteArray();
    res.header({ "Content-Type": "image/jpeg" });
    res.end(responseStream, "binary");
  } catch (error) {
    console.error(`Error fetching file ${name} from S3:`, error);
    res.status(500).json({ error: "Failed to fetch file from S3" });
  }
};

const deleteJpg = async (res, name) => {
  const params = {
    Bucket: bucketName,
    Key: name,
  };
  try {
    await s3Client.send(new DeleteObjectCommand(params));
    await pictures.destroy({ where: { fname: name } });
    return { status: true };
  } catch (error) {
    console.error(`Error deleting file ${name} from S3:`, error);
    return { status: false, error: "Failed to delete file from S3" };
  }
};

export { generatePicture, sendJpg, sendJpgList, deleteJpg };
