import OpenAI from "openai";

// Ensure you have configured the OpenAI API key securely
const openai = new OpenAI();

const stream = async (res, model, messages) => {
  try {
    const responseStream = await openai.chat.completions.create({
      model,
      messages,
      stream: true,
    });

    for await (const part of responseStream) {
      res.write(part.choices[0]?.delta.content || "");
    }
    res.end();
  } catch (error) {
    console.error("Error processing chat request:", error);
    return { status: false, error: "Internal Server Error" };
  }
};

export { stream };
