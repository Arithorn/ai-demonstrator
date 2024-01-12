import fs from "fs";
import { tts } from "./models/TTS.mjs";

const sendMp3List = async (email) => {
  console.log(email);
  try {
    let result = await tts.findAll({ where: { email } });
    return { list: result };
  } catch (error) {
    console.error("Error fetching mp3 list:", error);
    return { error: error.message };
  }
};

const sendMp3 = (res, name) => {
  const fname = `./assets/mp3/${name}`;
  const stat = fs.statSync(fname);
  var readStream;
  res.header({
    "Content-Type": "audio/mpeg",
    "Content-Length": stat.size,
  });
  readStream = fs.createReadStream(fname);
  readStream.pipe(res);
};

const deleteMp3 = async (res, name) => {
  const fname = `./assets/mp3/${name}`;
  try {
    await tts.destroy({ where: { fname: name } });
    await fs.promises.rm(fname);
    return { status: true };
  } catch (err) {
    console.error(`Error deleting file ${fname}:`, err);
    return { status: false, error: err.message };
  }
};

export { sendMp3, sendMp3List, deleteMp3 };
