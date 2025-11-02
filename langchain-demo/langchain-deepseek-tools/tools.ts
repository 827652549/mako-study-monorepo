import { ChatOpenAI } from '@langchain/openai'
import { createAgent, tool } from 'langchain'
import { MemorySaver, type Runtime } from '@langchain/langgraph'

import * as z from 'zod'
import axios from 'axios'

const systemPrompt = `你是一个专业的严肃的天气预报员, 但是懂得一定的人文关怀.

你拥有两个tools:

- get_weather_for_location: use this to get the weather for a specific location
- get_user_location: use this to get the user's location

If a user asks you for the weather, make sure you know the location. If you can tell from the question that they mean wherever they are, use the get_user_location tool to find their location.`


const getWeather = tool(
  async ({ city }: { city: string }) => {
    // 构建查询字符串，使用中文查询以获得更准确的结果
    const searchQuery = `${city}今天天气`;

    // 准备请求数据，按照官方示例格式
    const data = JSON.stringify({
      q: searchQuery,
      location: "China",
      gl: "cn", // 国家代码：中国
      hl: "zh-cn" // 语言：简体中文
    });

    // 配置请求参数
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://google.serper.dev/search',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY, // 从环境变量获取
        'Content-Type': 'application/json'
      },
      data: data
    };

    try {
      const response = await axios.request(config);
      const result = response.data;

      // 解析返回的数据，优先从answerBox获取天气信息
      if (result.answerBox && result.answerBox.answer) {
        return `${city}的天气：${result.answerBox.answer}`;
      }

      // 如果answerBox没有答案，尝试从knowledgeGraph获取
      if (result.knowledgeGraph && result.knowledgeGraph.description) {
        return `${city}的天气信息：${result.knowledgeGraph.description}`;
      }

      // 最后尝试从organic结果中获取
      if (result.organic && result.organic.length > 0) {
        const firstResult = result.organic[0];
        if (firstResult.snippet) {
          // 清理snippet中的HTML标签（如果有）
          const cleanSnippet = firstResult.snippet.replace(/<[^>]*>/g, '');
          return `根据搜索结果，${city}的天气情况：${cleanSnippet}`;
        }
      }

      // 如果都没有找到相关信息
      return `抱歉，没有找到${city}的天气信息。请尝试使用更具体的城市名称。`;

    } catch (error) {
      console.error("调用 Serper API 时出错:", error);
      return `查询${city}天气时出现错误，请稍后重试。`;
    }
  },
  {
    name: "get_weather_for_location",
    description: "通过搜索引擎获取指定城市的实时天气信息，包括温度、天气状况等,其中温度是必须要包含的.",
    schema: z.object({
      city: z.string().describe("要查询天气的城市名称，例如：北京、上海、广州, 也可以具体到区, 上海市黄浦区"),
    }),
  },
);


const checkpointer = new MemorySaver()


async function main() {

  const model = new ChatOpenAI({
    model: "deepseek-chat",
    temperature: 0.1,
    logprobs: true,
    configuration: {
      baseURL: "https://api.deepseek.com",
      apiKey: process.env.DEEPSEEK_API_KEY,
    },
  })

  const agent = createAgent({
    tools: [ getWeather ],
    model,
    systemPrompt,
    checkpointer,
  })


  try {
    const config = {
      configurable: { thread_id: '1' },
      context: { user_id: '1' },
    }
    const response = await agent.invoke(
      {
        messages: [
          {
            role: 'user',
            content: '上海普陀区什么天气?',
          },
        ],
      },
      config,
    )
    console.log('---第 1 次回答----')
    console.log(response.structuredResponse || response.messages[response.messages.length - 1].content)

    // 第二次调用也使用 agent，这样可以通过 checkpointer 恢复对话历史
    const thankYouResponse = await agent.invoke(
      {
        messages: [
          {
            role: 'user',
            content: '请精简你刚刚的回答',
          },
        ],
      },
      config,
    )
    console.log('---第 2 次回答----')
    console.log(thankYouResponse.structuredResponse || thankYouResponse.messages[thankYouResponse.messages.length - 1].content)
  } catch (e) {
    console.error('invoke失败', e)
  }
}


// @ts-ignore
await main()