import { checkOpenai } from "./stream.mjs";

const healthCheck = async (req, res) => {
  const openaiStatus = await checkOpenai();
  if (openaiStatus.status) {
    res.status(200).send("OK");
  } else {
    res.status(500).send("Internal Server Error");
  }
};

export { healthCheck };
