const OpenAI = require("openai");
require('dotenv').config();

const geminiClient = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

module.exports = geminiClient;
