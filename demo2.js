import express from "express";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { getUserChatChain } from "./utils/chain.js";
import { getUserHistory } from "./utils/index.js";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import fs from "fs"
import { get } from "http";
import { writeUserHistory } from "./utils/index.js";

const app = express();

let history = new ChatMessageHistory()
app.get('/llm', async (req, res) => {
    //获取用户的问题
    const { question, userId, sessionId } = req.query;
    const _historyArr = getUserHistory(userId, sessionId)
    history = new ChatMessageHistory(_historyArr)
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
        configurable:{sessionId:'default'}
    })
    //在本次问答结束后打印一下history的记录
    writeUserHistory(userId, sessionId, history.messages)
    res.send(result);
})

app.listen(3000)