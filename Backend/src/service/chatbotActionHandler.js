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
        case "getBestDiscountProducts":

            const limit = functionArgs.limit || 5;

            const discountRes = await productService.getBestDiscountProducts(
                functionArgs.keyword,
                limit
            );

            finalProducts = discountRes.DT?.products || [];

            if (finalProducts.length > 0) {

                finalReply =
                    functionArgs.replyMessage ||
                    "Dạ, đây là những sản phẩm đang có ưu đãi cao nhất bên shop ạ!";

            } else {

                finalReply = "Dạ hiện tại chưa có sản phẩm ưu đãi phù hợp ạ.";

            }

            break;
        case "getBestSellerProducts":

            const limitBest = functionArgs.limit || 5;

            const bestSellerRes = await productService.getBestSellerProducts(
                functionArgs.keyword,
                limitBest
            );

            finalProducts = bestSellerRes.DT?.products || [];

            if (finalProducts.length > 0) {
                finalReply =
                    functionArgs.replyMessage ||
                    " Đây là các sản phẩm bán chạy nhất bên shop ạ!";
            } else {
                finalReply = "Dạ hiện chưa có dữ liệu bán chạy ạ.";
            }

            break;
        case "checkProductAvailability":

            const { keyword, size, color } = functionArgs;

            const stockRes = await productService.checkProductAvailability(
                keyword,
                size,
                color
            );

            const isAvailable = stockRes.DT?.available;

            if (isAvailable) {
                finalReply = `Dạ còn hàng${size ? ` size ${size}` : ""}${color ? ` màu ${color}` : ""} ạ!`;
            } else {
                finalReply = `Dạ hiện tại sản phẩm này đang hết hàng rồi ạ.`;
            }

            break;
        case "filterProductsAdvanced": {

            const { keyword, minPrice, maxPrice } = functionArgs;

            const res = await productService.filterProductsAdvanced(
                keyword,
                minPrice,
                maxPrice,
                5
            );

            finalProducts = res.DT?.products || [];

            if (finalProducts.length > 0) {

                if (keyword && maxPrice) {
                    finalReply = `Dạ, đây là các sản phẩm '${keyword}' dưới ${maxPrice.toLocaleString()}đ ạ!`;
                } else if (keyword) {
                    finalReply = `Dạ, đây là các sản phẩm '${keyword}' phù hợp với bạn ạ!`;
                } else {
                    finalReply = "Dạ, đây là các sản phẩm phù hợp ạ!";
                }

            } else {
                finalReply = "Dạ chưa có sản phẩm phù hợp ạ.";
            }

            break;
        }
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