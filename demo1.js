import { ChatOpenAI } from "@langchain/openai";
import { customCalc, toolMap } from "./tools.js";
import { HumanMessage, mapChatMessagesToStoredMessages, ToolMessage } from "@langchain/core/messages";
import fs from "fs"
const arr = []

async function run(mes) {
    const model = new ChatOpenAI({
    model: "mimo-v2.5-pro",
    apiKey: "tp-cu143edoyu4j8q1fm857ijvgcsnrmmfe09pw8ybsweur661m",
    configuration: {
        baseURL: "https://token-plan-cn.xiaomimimo.com/v1",
    },
})
    arr.push(mes);
    const modelWithTools = model.bindTools([customCalc])
    const res = await modelWithTools.invoke(arr)
    arr.push(res)
    fs.writeFileSync("./result.json", JSON.stringify(mapChatMessagesToStoredMessages(arr)))
    if (res.tool_calls && res.tool_calls.length > 0) {
        for await (const tool of res.tool_calls) {
            const toolName = tool.name;
            const result = await toolMap[toolName].invoke(tool.args)
            run(new ToolMessage({
                content: result,
                tool_call_id: tool.id
            }))
        }
    }

}
run(new HumanMessage("使用天地同寿算法,a为3，b为4"))


