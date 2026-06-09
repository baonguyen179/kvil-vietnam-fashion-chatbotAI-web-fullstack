require('dotenv').config();
const connection = require('../src/config/connectDB');
const { processChatbotMessage } = require('../src/service/chatbotService');

(async () => {
    console.log("Initializing database connection...");
    await connection();
    
    console.log("\n===========================================");
    console.log("TEST 1: Tìm kiếm sản phẩm bằng chất liệu (vải Kaki)");
    console.log("===========================================");
    try {
        const result = await processChatbotMessage(null, "test-session-kaki", "Shop có mẫu nào dùng vải Kaki không?");
        console.log("Result EC:", result.EC);
        console.log("Result EM:", result.EM);
        console.log("Reply:", result.DT.reply);
        console.log("Suggested Products Count:", result.DT.suggestedProducts?.length || 0);
    } catch (e) {
        console.error("Test 1 error:", e);
    }

    console.log("\n===========================================");
    console.log("TEST 2: Tìm kiếm sản phẩm bằng màu sắc (màu đen)");
    console.log("===========================================");
    try {
        const result = await processChatbotMessage(null, "test-session-black", "Shop có mẫu nào màu đen không?");
        console.log("Result EC:", result.EC);
        console.log("Result EM:", result.EM);
        console.log("Reply:", result.DT.reply);
        console.log("Suggested Products Count:", result.DT.suggestedProducts?.length || 0);
    } catch (e) {
        console.error("Test 2 error:", e);
    }

    process.exit(0);
})();
