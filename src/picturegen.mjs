import OpenAI from "openai";
import fs from "fs";
import { v4 as uuid } from "uuid";

import { pictures } from "./models/Pictures.mjs";

const openai = new OpenAI();
const model = "dall-e-2";
const imageSize = "512x512";
const imageQuality = "standard";
const imageCount = 1;

const generatePicture = async (email, prompt) => {
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
    const fullfname = `./assets/jpg/${fname}`;
    console.log(jpg.data[0]);
    fs.writeFile(fullfname, atob(jpg.data[0].b64_json));

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

const sendJpg = (res, name) => {
  const fname = `./assets/jpg/${name}`;
  const stat = fs.statSync(fname);
  var readStream;
  res.header({
    "Content-Type": "image/jpg",
    "Content-Length": stat.size,
  });
  readStream = fs.createReadStream(fname);
  readStream.pipe(res);
};

export { generatePicture, sendJpg, sendJpgList };
