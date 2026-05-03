import express from "express";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { getUserHistory, writeUserHistory } from "./utils/index.js";
import fs from "fs"
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const app = express();

let arr = []
app.get('/llm', async (req, res) => {
    //获取用户的问题
    const { question, userId, sessionId } = req.query;
    //根据用户id和会话id获取用户的历史记录
    arr = getUserHistory(userId, sessionId)
    //构建消息的模板
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
        maxTokens: 1024,
        configuration: {
            baseURL: process.env.BASE_URL,
        },
    })
    //构建链
    const chain = prompt.pipe(model).pipe(new StringOutputParser())
    //执行链
    const result = await chain.invoke({ 
        question,
        history: arr,
    });
    //请求完成后，将用户的问题和大模型的回答添加到历史记录中
    arr.push(new HumanMessage({ content: question }))
    arr.push(new AIMessage({ content: res }))
    writeUserHistory(userId, sessionId, arr)
    res.send(result);
})

app.listen(3000)