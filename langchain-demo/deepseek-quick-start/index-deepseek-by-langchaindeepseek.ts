import { ChatDeepSeek } from '@langchain/deepseek'

const model = new ChatDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY, // Default value.
  model: "deepseek-chat",
  temperature: 0,
});

// @ts-ignore
console.log(await model.invoke("你好"))