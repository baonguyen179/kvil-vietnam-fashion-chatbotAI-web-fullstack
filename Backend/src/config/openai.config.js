const OpenAI = require("openai");
require('dotenv').config();

const openAiClient = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "kvil-chatbot"
    }
});

module.exports = openAiClient;