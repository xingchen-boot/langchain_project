import fs from "fs"
export function getUserHistory(userId, sessionId) {
    const userPath = `./chat/${userId}.json`
    const isExist = fs.existsSync(userPath)
    if(isExist){
        const userHistory = JSON.parse(fs.readFileSync(userPath).toString())
        const seesionHistory = userHistory[sessionId] || []
        return seesionHistory
    }else{
        fs.writeFileSync(userPath, JSON.stringify({ sessionId, history: [] }))
        return []
    }
}

export function writeUserHistory(userId, sessionId, history) {
    const userPath = `./chat/${userId}.json`
    const userHistory = JSON.parse(fs.readFileSync(userPath).toString())
    userHistory[sessionId] = history
    fs.writeFileSync(userPath, JSON.stringify(userHistory, null, 2))
}