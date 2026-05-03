import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableLambda} from "@langchain/core/runnables";
import fs from "fs";


const prompt = ChatPromptTemplate.fromMessages([
  { role: "system", content: "{system_prompt}" },
  new MessagesPlaceholder("historyPlaceholder"),
  { role: "human", content: [
    { type: "text", text: "{question}" },  
  ]},   
]);

const chain = prompt.pipe(new RunnableLambda({
    func: (inputs) => {
        fs.writeFileSync("./A.json", JSON.stringify(inputs, null, 2), "utf-8")
        return inputs;
    }
}))

chain.invoke({
    system_prompt: "用户是前端开发程序员",
    historyPlaceholder: [{ role: "user", content: "用户曾经的问题" }],
    question: "用户的问题是作为一个会vue有几段实习的前端实习生接下来应该往什么方向去努力?"
})