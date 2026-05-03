import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";

const prompt = ChatPromptTemplate.fromMessages([
  { role: "system", content: "{system_prompt}" },
  new MessagesPlaceholder("historyPlaceholder"),
  { role: "human", content: [
    { type: "text", text: "{question}" },  
  ]},   
]);

const model = new ChatOpenAI({
    model: "mimo-v2.5-pro",
    apiKey: "tp-cu143edoyu4j8q1fm857ijvgcsnrmmfe09pw8ybsweur661m",
    temperature: 0.7,
    maxTokens: 1024,
    configuration: {
        baseURL: "https://token-plan-cn.xiaomimimo.com/v1",
    },
})

const chain = prompt.pipe(model).pipe(new StringOutputParser())

const res = await chain.invoke({ system_prompt: "用户是前端开发程序员", historyPlaceholder: [{ role: "user", content: "用户曾经的问题" }], question: "用户的问题是作为一个会vue有几段实习的前端实习生接下来应该往什么方向去努力?" });
console.log(res);
