import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { getUserHistory, writeUserHistory } from "./index.js";
import dotenv from 'dotenv';
import { customCalc } from "../tools.js";

// 加载环境变量
dotenv.config();

export function getUserChatChain(type = 'human'){
    const prompt = type === 'human' ? ChatPromptTemplate.fromMessages([
        { role: "system", content: "用户是前端开发程序员" },
        new MessagesPlaceholder("history"),
            { role: "human", content: [
                { type: "text", text: "{question}" },  
            ]} 
        ]) : ChatPromptTemplate.fromMessages([
        { role: "system", content: "用户是前端开发程序员" },
        new MessagesPlaceholder("history"),
        new MessagesPlaceholder("toolResults"),
    ])
  
    //构建大模型请求对象
    const model = new ChatOpenAI({
       model: "mimo-v2.5-pro",
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0.7,
        configuration: {
            baseURL: process.env.BASE_URL,
        },
    })
     const modelWithTools = model.bindTools([customCalc])
    //构建链
    const chain = prompt.pipe(modelWithTools)
    return chain
}