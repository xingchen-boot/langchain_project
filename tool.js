import {tool} from "@langchain/core/tools";
import {z} from "zod";

export const customCalc = tool(
    async (arg) => {
        return "计算结果为：" + (arg.a + arg.b)
    },
    {
        name: "customCalc",
        description: "这是一个自定义的计算工具，可以对两个数字进行加法计算,当用户让你使用天地同寿算法时,使用这个工具",
        schema: z.object({
            a: z.number().describe("第一个数字"),
            b: z.number().describe("第二个数字"),
        })
    }
)

export const toolMap = {
    [customCalc.name]: customCalc,
}
