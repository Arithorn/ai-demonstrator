import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import "dotenv/config";
import { tts } from "./models/TTS.mjs";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});
const bucketName = process.env.AWS_S3_BUCKET_NAME;

const sendMp3List = async (email) => {
  try {
    let result = await tts.findAll({ where: { email } });
    return { list: result };
  } catch (error) {
    console.error("Error fetching mp3 list:", error);
    return { error: error.message };
  }
};

const sendMp3 = async (res, name) => {
  const params = {
    Bucket: bucketName,
    Key: `mp3/${name}`,
  };
  try {
    const { Body } = await s3Client.send(new GetObjectCommand(params));

    const responseStream = await Body.transformToByteArray();
    res.header({ "Content-Type": "image/mp3" });
    res.end(responseStream, "binary");
  } catch (error) {
    console.error(`Error fetching file ${name} from S3:`, error);
    res.status(500).json({ error: "Failed to fetch file from S3" });
  }
};

const deleteMp3 = async (res, name) => {
  const params = {
    Bucket: bucketName,
    Key: `mp3/${name}`,
  };
  try {
    await s3Client.send(new DeleteObjectCommand(params));
    await tts.destroy({ where: { fname: name } });
    return { status: true };
  } catch (error) {
    console.error(`Error deleting file ${name} from S3:`, error);
    return { status: false, error: "Failed to delete file from S3" };
  }
};

export { sendMp3, sendMp3List, deleteMp3 };
