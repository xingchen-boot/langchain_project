import { BaseChatMessageHistory } from "@langchain/core/chat_history";
import { getUserHistory, writeUserHistory } from "./utils/index.js";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { mapChatMessagesToStoredMessages, mapStoredMessageToChatMessage } from "@langchain/core/messages";
import fs from "fs"
function formatHistory(list) {
    return list.map((item) => {
        return mapStoredMessageToChatMessage(item)
    })
}
export class MyHistory extends BaseChatMessageHistory {
    constructor(userId, sessionId) {
        const origin_history = getUserHistory(userId, sessionId)
        super();
        this.messages = formatHistory(origin_history);
        this.userId = userId;
        this.sessionId = sessionId
    }
    messages = [];
    addMessages(meg) {
        this.messages.push(...meg);
        writeUserHistory(this.userId, this.sessionId, mapChatMessagesToStoredMessages(this.messages))
    }
    getMessages() {
        return this.messages;
    }
}