import express from "express";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { getUserChatChain } from "./utils/chain.js";
import { getUserHistory } from "./utils/index.js";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import fs from "fs";
import { get } from "http";
import { writeUserHistory } from "./utils/index.js";
import { MyHistory } from "./MyHistory.js";
import dotenv from "dotenv";
import {
  AIMessage,
  HumanMessage,
  mapChatMessagesToStoredMessages,
  ToolMessage,
} from "@langchain/core/messages";
import { toolMap } from "./tools.js";

// 加载环境变量
dotenv.config();

const app = express();
async function chatTo(
  question,
  currentUserId,
  currentSessionId,
  type = "human",
) {
  let history = new MyHistory(currentUserId, currentSessionId);
  const query =
    type === "human" ? new HumanMessage(question) : new ToolMessage(question);
  const chain = getUserChatChain(type);
  const runnableChat = new RunnableWithMessageHistory({
    runnable: chain,
    getMessageHistory: () => {
      return history;
    },
    inputMessagesKey: type === "human" ? "question" : "toolResults",
    historyMessagesKey: "history",
  });
  const invokeParams = {
    role: "聊天机器人",
    question,
  };
  if (type === "human") {
    invokeParams.question = query.content;
  } else {
    invokeParams.toolResults = [query];
  }
  const result = await runnableChat.stream(invokeParams, {
    configurable: { sessionId: currentSessionId },
  });
  //push数组只是为了方便查看chunk， 对于功能实现没有任何影响
  let arr = [];
  let answer = new AIMessage("");
  let toolCallObj = null;
  for await (const chunk of result) {
    if (chunk.content) {
      answer.content += chunk.content;
      arr.push(chunk);
      res.write(
        `data: ${JSON.stringify(mapChatMessagesToStoredMessages([answer]))}\n\n`,
      );
    }


    if(chunk.tool_call_chunks[0]){
        if(!toolCallObj){
            toolCallObj = chunk.tool_call_chunks[0];
        }else {
            const _chunk = chunk.tool_call_chunks[0]
            toolCallObj.id += _chunk.id ? _chunk.id : ""
            toolCallObj.args += _chunk.args ? _chunk.args : ''
            toolCallObj.name += _chunk.name ? _chunk.name : ''
        }
    }

  }
  //判断toolCallObj是否存在，如果存在，说明有工具调用
  if(toolCallObj && toolCallObj.id){
    const toolName = toolCallObj.name;
    const toolResult = await toolMap[toolName].invoke(JSON.parse(toolCallObj.args));
    result = await chatTo({
        content: toolResult,
        tool_call_id: toolCallObj.id,
    }, userId, sessionId, "tool");
  } 
  if (result.tool_calls && result.tool_calls.length > 0) {
    for await (const tool of result.tool_calls) {
      const toolName = tool.name;
      const toolResult = await toolMap[toolName].invoke(tool.args);
      result = await chatTo(
        {
          content: toolResult,
          tool_call_id: tool.id,
        },
        userId,
        sessionId,
        res,
        "tool",
      );
    }
    
  }
  // 设置默认值，避免 undefined
  const currentUserId = userId || "default_user";
  const currentSessionId = sessionId || "default_session";

  res.send(result.content);
  return result;
}

app.get("/llm", async (req, res) => {
  //sse响应头
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  //获取用户的问题
  const { question, userId,res, sessionId } = req.query;
  await chatTo(question, userId, sessionId, res);
  
});

app.listen(3002);
