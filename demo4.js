import express from "express";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { getUserChatChain } from "./utils/chain.js";
import { getUserHistory } from "./utils/index.js";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import fs from "fs"
import { get } from "http";
import { writeUserHistory } from "./utils/index.js";
import { MyHistory } from "./MyHistory2.js";
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const app = express();

let history = new MyHistory()
app.get('/llm', async (req, res) => {
    //获取用户的问题
    const { question, userId, sessionId } = req.query;
    
    // 设置默认值，避免 undefined
    const currentUserId = userId || 'default_user';
    const currentSessionId = sessionId || 'default_session';
    
    history = new MyHistory(currentUserId, currentSessionId)
    const chain = getUserChatChain()
    const runnableChat = new RunnableWithMessageHistory({
        runnable: chain,
        getMessageHistory: () => {
            return history
        },
        inputMessagesKey: 'question',
        historyMessagesKey: 'history',
    })
    const result = await runnableChat.invoke({ question },{
        configurable:{sessionId: currentSessionId}
    })
    res.send(result);
})

app.listen(3000)