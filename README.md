# LangChain.js Learning Project

A hands-on learning project for exploring LangChain.js concepts, from basic model invocation to building conversational chat APIs with message history management.

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js v5
- **LLM Orchestration**: LangChain.js (`@langchain/core`, `@langchain/openai`, `@langchain/anthropic`)
- **LLM Provider**: Xiaomi MiMo (`mimo-v2.5-pro`) via OpenAI-compatible API proxy
- **Schema Validation**: Zod
- **Config**: dotenv

## Project Structure

```
code/
├── openaidemo.js        # Direct OpenAI SDK usage (baseline)
├── langchaindemo.js     # Basic LangChain ChatOpenAI invocation with request/response logging
├── modelrequest.js      # ChatPromptTemplate + StringOutputParser chain
├── runnabletest.js      # RunnableLambda demo for intercepting chain inputs
├── demo.js              # Express server with /llm endpoint, JSON-file chat history
├── demo2.js             # RunnableWithMessageHistory for automatic history management
├── demo3.js             # Custom MyHistory class for message history
├── MyHistory.js         # Custom BaseChatMessageHistory (persists to JSON files)
├── tool.js              # Custom LangChain tool with Zod schema
├── utils/
│   ├── chain.js         # Reusable prompt + model + parser chain
│   └── ...              # Chat history read/write helpers
├── chat/                # Stored conversation history (JSON files)
├── package.json
└── .env                 # Environment variables (not committed)
```

## Getting Started

### Prerequisites

- Node.js >= 18
- An OpenAI-compatible API endpoint

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file in the project root:

```env
BASE_URL=your_api_base_url
API_KEY=your_api_key
MODEL=your_model_name
```

### Run

```bash
# Run a specific demo
node openaidemo.js
node langchaindemo.js
node modelrequest.js

# Start the Express chat server
node demo.js
```

## Learning Progress

| Demo | Concept |
|------|---------|
| `openaidemo.js` | Direct SDK usage |
| `langchaindemo.js` | LangChain basics, fetch interceptor for debugging |
| `modelrequest.js` | Prompt templates, output parsers, chain composition |
| `runnabletest.js` | RunnableLambda for input inspection |
| `demo.js` | Express API + persistent chat history |
| `demo2.js` / `demo3.js` | RunnableWithMessageHistory, custom history class |
| `tool.js` | Custom tools with Zod schemas |
