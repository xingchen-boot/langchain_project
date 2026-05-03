import express from "express";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { getUserChatChain } from "./utils/chain.js";
import { getUserHistory } from "./utils/index.js";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import fs from "fs"
import { get } from "http";
import { writeUserHistory } from "./utils/index.js";
import { MyHistory } from "./MyHistory.js";
import dotenv from 'dotenv';
import {HumanMessage, ToolMessage} from "@langchain/core/messages";
import {toolMap} from "./tools.js";

// 加载环境变量
dotenv.config();

const app = express();
async function chatTo(question, currentUserId, currentSessionId, type = 'human') {
    let history = new MyHistory(currentUserId, currentSessionId)
    const query = type === 'human' ? new HumanMessage(question) : new ToolMessage(question)
    const chain = getUserChatChain(type)
    const runnableChat = new RunnableWithMessageHistory({
        runnable: chain,
        getMessageHistory: () => {
            return history
        },
        inputMessagesKey: type === 'human' ? 'question' : 'toolResults',
        historyMessagesKey: 'history',
    })
    const invokeParams = {
        role: "聊天机器人",
        question,
    }
    if(type === 'human'){
        invokeParams.question = query.content
    }
    else{
        invokeParams.toolResults = [query]
    }
       const result = await runnableChat.invoke(invokeParams,{
        configurable:{sessionId: currentSessionId}
    })
    return result
}

app.get('/llm', async (req, res) => {
    //获取用户的问题
    const { question, userId, sessionId } = req.query;
    let result = await chatTo(question, userId, sessionId)
     if (result.tool_calls && result.tool_calls.length > 0) {
            for await (const tool of result.tool_calls) {
                const toolName = tool.name;
                const toolResult = await toolMap[toolName].invoke(tool.args)
                result = await chatTo({
                    content: toolResult,
                    tool_call_id: tool.id
                }, userId, sessionId, "tool")
            }
        }
    // 设置默认值，避免 undefined
    const currentUserId = userId || 'default_user';
    const currentSessionId = sessionId || 'default_session';
    
    
 
    res.send(result.content);
})

app.listen(3002)