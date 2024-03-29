import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { pictures } from "./models/Pictures.mjs";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
const openai = new OpenAI();
const anthropic = new Anthropic(process.env.ANTHROPIC_API_KEY);
const checkOpenai = async () => {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [{ role: "system", content: "say test123" }],
      max_tokens: 5,
    });
    return {
      status: true,
      reason: res.choices[0].finish_reason,
      result: res.choices[0].message,
    };
  } catch (error) {
    console.error("Error checking OpenAI API:", error);
    return { status: false, error: "Internal Server Error" };
  }
};

const checkAnthropic = async () => {
  try {
    const res = await anthropic.messages.create({
      max_tokens: 5,
      messages: [{ role: "user", content: "say test123" }],
      model: "claude-3-haiku-20240307",
      stream: false,
    });
    return {
      status: true,
      reason: res,
    };
  } catch (error) {
    console.error("Error checking OpenAI API:", error);
    return { status: false, error: "Internal Server Error" };
  }
};

const checkS3 = async () => {
  // Check S3 health
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
  });
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  try {
    const response = await s3Client.send(
      new ListObjectsV2Command({ Bucket: bucketName })
    );
    return { status: true };
  } catch (error) {
    console.error("Error checking S3 health:", error);
    return { status: false, error: "S3 health check failed" };
  }
};

const checkDatabase = async () => {
  // Check database health
  try {
    await pictures.findAll({ limit: 1 });
    return { status: true };
  } catch (error) {
    console.error("Error checking database health:", error);
    return { status: false, error: "Database health check failed" };
  }
};

const healthCheck = async (req, res) => {
  const openaiStatus = await checkOpenai();
  const anthropicStatus = await checkAnthropic();
  const s3Status = await checkS3();
  const databaseStatus = await checkDatabase();
  const status = {
    openai: openaiStatus.status,
    anthropic: anthropicStatus.status,
    s3: s3Status.status,
    database: databaseStatus.status,
  };
  return status;
};

export { healthCheck };
