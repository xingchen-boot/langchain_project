import { BaseChatMessageHistory } from "@langchain/core/chat_history";
import { getUserHistory, writeUserHistory } from "./utils/index.js";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
function formatHistory(list){
    return list.map((item) => {
        const type = item.id[2]
        if(type === 'HumanMessage'){
            return new HumanMessage(item.kwargs.content)
        }else if(type === 'AIMessage'){
            return new AIMessage(item.kwargs.content)
        }
    })
}
export class MyHistory extends BaseChatMessageHistory {
    constructor(userId, sessionId) {
        const orgin_history = getUserHistory(userId, sessionId)
        super()
        this.messages = formatHistory(orgin_history)
        this.userId = userId
        this.sessionId = sessionId
    }
    messages = []
    addMessages(msg){
        this.messages.push(...msg)
        writeUserHistory(this.userId, this.sessionId, this.messages)
    }
    getMessages(){
        return this.messages
    }
    
}
