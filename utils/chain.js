import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { getUserHistory, writeUserHistory } from "./index.js";
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

export function getUserChatChain(){
    const prompt = ChatPromptTemplate.fromMessages([
        { role: "system", content: "用户是前端开发程序员" },
        new MessagesPlaceholder("history"),
        { role: "human", content: [
            { type: "text", text: "{question}" },  
        ]},   
    ]);
    //构建大模型请求对象
    const model = new ChatOpenAI({
       model: "mimo-v2.5-pro",
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0.7,
        configuration: {
            baseURL: process.env.BASE_URL,
        },
    })
    //构建链
    const chain = prompt.pipe(model).pipe(new StringOutputParser())
    return chain
}