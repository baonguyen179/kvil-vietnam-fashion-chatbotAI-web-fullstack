const productService = require('./productService');
const collectionService = require('./collectionService');

const executeAiAction = async (functionName, functionArgs) => {
    let finalReply = "";
    let finalProducts = [];

    switch (functionName) {
        case "searchProducts":
            const searchRes = await productService.searchProducts(functionArgs.keyword, 1, 5);
            finalProducts = searchRes.DT?.products || [];

            if (finalProducts.length > 0) {
                finalReply = functionArgs.replyMessage || `Dạ, mình tìm thấy một số mẫu '${functionArgs.keyword}' phù hợp với bạn đây ạ!`;
            } else {
                finalReply = `Dạ tiếc quá, hiện tại bên mình đang tạm hết hoặc chưa có mẫu '${functionArgs.keyword}' rồi ạ. Bạn có muốn tham khảo đồ khác không?`;
            }
            break;

        case "getAllProducts":
            const sort = functionArgs.sort || "newest";
            const sortRes = await productService.getAllProducts({ sort: sort, limit: 5 });
            finalProducts = sortRes.DT?.products || [];

            if (finalProducts.length > 0) {
                finalReply = functionArgs.replyMessage || "Dạ, gửi bạn danh sách các sản phẩm đang hot bên mình nhé!";
            } else {
                finalReply = "Dạ, hiện tại cửa hàng chưa có sản phẩm nào để hiển thị ạ.";
            }
            break;

        case "suggestCollections":
            const collectionRes = await collectionService.getPublicCollections();
            const collections = collectionRes.DT || [];

            if (collections.length > 0) {
                const collectionNames = collections.map(c => `- ${c.name}`).join('\n');

                finalReply = `${functionArgs.replyMessage || "Dạ, hiện shop đang có các bộ sưu tập rất đẹp đây ạ:"}\n\n${collectionNames}\n\nBạn ưng bộ nào để mình gửi chi tiết sản phẩm nhé?`;
            } else {
                finalReply = "Dạ, hiện tại các bộ sưu tập mới đang được shop cập nhật, bạn tham khảo tạm các sản phẩm lẻ giúp mình nhé!";
            }
            break;

        // BẠN CÓ THỂ THÊM CÁC CASE KHÁC Ở ĐÂY SAU NÀY
        // case "checkOrder": ...

        default:
            finalReply = "Dạ, hệ thống chưa hỗ trợ yêu cầu này của bạn ạ.";
            break;
    }

    return { finalReply, finalProducts };
};

module.exports = {
    executeAiAction
};