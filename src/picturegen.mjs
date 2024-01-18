import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";

import { pictures } from "./models/Pictures.mjs";

const openai = new OpenAI();
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
    const fullfname = `./assets/jpg/${fname}`;
    var buf = Buffer.from(jpg.data[0].b64_json, "base64");
    fs.writeFile(fullfname, buf);

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
  const fname = `./assets/jpg/${name}`;
  console.log(fname);
  const __dirname = process.cwd();
  res.sendFile(path.join(__dirname, "./assets/jpg/", name));
};

export { generatePicture, sendJpg, sendJpgList };
