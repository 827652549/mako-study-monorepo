import { ChatOpenAI } from "@langchain/openai";

const llmWithCustomURL = new ChatOpenAI({
  model: "deepseek-chat",
  temperature: 0,
  configuration: {
    baseURL: "https://api.deepseek.com",
    apiKey: process.env.DEEPSEEK_API_KEY,
  },
});

// @ts-ignore
const res = await llmWithCustomURL.invoke("你好!");
console.log(res)