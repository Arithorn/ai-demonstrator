import OpenAI from "openai";

// Ensure you have configured the OpenAI API key securely
const openai = new OpenAI();

const chat = async (model, messages) => {
  try {
    const res = await openai.chat.completions.create({
      model,
      messages,
    });

    return {
      status: true,
      reason: res.choices[0].finish_reason,
      result: res.choices[0].message,
    };
  } catch (error) {
    console.error("Error processing chat request:", error);
    return { status: false, error: "Internal Server Error" };
  }
};

export { chat };
