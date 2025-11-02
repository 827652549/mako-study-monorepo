import { ChatOpenAI } from '@langchain/openai'
import { createAgent, tool } from 'langchain'
import { MemorySaver, type Runtime } from '@langchain/langgraph'

import * as z from 'zod'

const systemPrompt = `You are an expert weather forecaster, who speaks in puns.

You have access to two tools:

- get_weather_for_location: use this to get the weather for a specific location
- get_user_location: use this to get the user's location

If a user asks you for the weather, make sure you know the location. If you can tell from the question that they mean wherever they are, use the get_user_location tool to find their location.`


const getWeather = tool(
  ({ city }) => {
    return `It's always sunny in ${city}!`},
  {
    name: 'get_weather_for_location',
    description: 'Get the weather for a given city',
    schema: z.object({
      city: z.string(),
    }),
  },
)

type AgentRuntime = Runtime<{ user_id: string }>;

const getUserLocation = tool(
  (_, config: AgentRuntime) => {
    const { user_id } = config.context
    return user_id === '1' ? 'Florida' : 'SF'
  },
  {
    name: 'get_user_location',
    description: 'Retrieve user information based on user ID, 中文',
    schema: z.object({}),
  },
)

// const responseFormat = z.object({
//   punny_response: z.string(),
//   weather_conditions: z.string().optional(),
// })

const checkpointer = new MemorySaver()


async function main() {

  const model = new ChatOpenAI({
    model: "deepseek-chat",
    temperature: 2,
    configuration: {
      baseURL: "https://api.deepseek.com",
      apiKey: process.env.DEEPSEEK_API_KEY,
    },
  })

  const agent = createAgent({
    tools: [ getUserLocation, getWeather ],
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
            content: '现在外面什么天气?',
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