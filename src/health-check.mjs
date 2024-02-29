import { checkOpenai } from "./stream.mjs";

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
  const s3Status = await checkS3();
  const databaseStatus = await checkDatabase();
  return {
    openai: openaiStatus,
    s3: s3Status,
    database: databaseStatus,
  };
};

export { healthCheck };
