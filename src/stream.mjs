import OpenAI from "openai"; // Ensure you have configured the OpenAI API key securely
import Anthropic from "@anthropic-ai/sdk";

const openai = new OpenAI();
// const claude = new Anthropic();
const anthropic = new Anthropic();

const stream = async (res, model, messages) => {
  try {
    if (model.startsWith("claude")) {
      const system = messages.splice(0, 1).content;
      const stream = await anthropic.messages.create({
        max_tokens: 1024,
        messages,
        system,
        model: model,
        stream: true,
      });
      for await (const messageStreamEvent of stream) {
        // console.log(messageStreamEvent);
        if (messageStreamEvent.type === "content_block_delta")
          res.write(messageStreamEvent.delta.text || "");
      }
      res.end();
    } else {
      // Handle OpenAI API
      const responseStream = await openai.chat.completions.create({
        model,
        messages,
        stream: true,
      });

      for await (const part of responseStream) {
        res.write(part.choices[0]?.delta.content || "");
      }
      res.end();
    }
  } catch (error) {
    console.error("Error processing chat request:", error);
    return { status: false, error: "Internal Server Error" };
  }
};

export { stream };
