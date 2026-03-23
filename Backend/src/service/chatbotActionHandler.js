const productService = require('./productService');
const collectionService = require('./collectionService');

const executeAiAction = async (functionName, functionArgs = {}) => {
    let finalReply = "";
    let finalProducts = [];

    try {
        switch (functionName) {

            case "searchProducts": {
                const keyword = functionArgs.keyword || "";

                const searchRes = await productService.searchProducts(keyword, 1, 5);
                finalProducts = searchRes.DT?.products || [];

                if (finalProducts.length > 0) {
                    finalReply =
                        functionArgs.replyMessage ||
                        `Dạ, mình tìm thấy một số mẫu '${keyword}' phù hợp với bạn đây ạ!`;
                } else {
                    finalReply =
                        `Dạ tiếc quá, hiện tại bên mình chưa có mẫu '${keyword}' rồi ạ. Bạn muốn mình gợi ý mẫu khác không?`;
                }
                break;
            }

            case "getAllProducts": {
                const sort = functionArgs.sort || "newest";

                const sortRes = await productService.getAllProducts({
                    sort: sort,
                    limit: 5
                });

                finalProducts = sortRes.DT?.products || [];

                finalReply =
                    finalProducts.length > 0
                        ? (functionArgs.replyMessage || "Dạ, gửi bạn danh sách sản phẩm bên mình nhé!")
                        : "Dạ, hiện tại chưa có sản phẩm nào ạ.";

                break;
            }

            case "suggestCollections": {
                const collectionRes = await collectionService.getPublicCollections();
                const collections = collectionRes.DT || [];

                if (collections.length > 0) {
                    const collectionNames = collections.map(c => `- ${c.name}`).join('\n');

                    finalReply =
                        `${functionArgs.replyMessage || "Dạ, shop đang có các bộ sưu tập sau:"}\n\n${collectionNames}\n\nBạn thích bộ nào để mình gửi chi tiết nhé ạ!`;
                } else {
                    finalReply = "Dạ hiện chưa có bộ sưu tập nào ạ.";
                }
                break;
            }

            case "getBestDiscountProducts": {
                const limit = functionArgs.limit || 5;

                const discountRes = await productService.getBestDiscountProducts(
                    functionArgs.keyword,
                    limit
                );

                finalProducts = discountRes.DT?.products || [];

                finalReply =
                    finalProducts.length > 0
                        ? (functionArgs.replyMessage || "Dạ, đây là các sản phẩm đang giảm giá mạnh ạ!")
                        : "Dạ hiện chưa có sản phẩm ưu đãi phù hợp ạ.";

                break;
            }

            case "getBestSellerProducts": {
                const limitBest = functionArgs.limit || 5;

                const bestSellerRes = await productService.getBestSellerProducts(
                    functionArgs.keyword,
                    limitBest
                );

                finalProducts = bestSellerRes.DT?.products || [];

                finalReply =
                    finalProducts.length > 0
                        ? (functionArgs.replyMessage || "Dạ, đây là các sản phẩm bán chạy nhất ạ!")
                        : "Dạ hiện chưa có dữ liệu bán chạy ạ.";

                break;
            }

            case "checkProductAvailability": {
                const { keyword, size, color } = functionArgs;

                const stockRes = await productService.checkProductAvailability(
                    keyword,
                    size,
                    color
                );

                const isAvailable = stockRes.DT?.available;

                finalReply = isAvailable
                    ? `Dạ còn hàng${size ? ` size ${size}` : ""}${color ? ` màu ${color}` : ""} ạ!`
                    : `Dạ hiện tại sản phẩm này đang hết hàng rồi ạ.`;

                break;
            }

            case "filterProductsAdvanced": {
                let { keyword, minPrice, maxPrice } = functionArgs;

                // 1. Xử lý an toàn: Nếu AI điền min == max, coi như là tìm "dưới mức đó"
                if (minPrice && maxPrice && minPrice === maxPrice) {
                    minPrice = undefined;
                }
                if (!minPrice && !maxPrice) {
                    console.log("--- Chuyển hướng từ Advanced sang Search do thiếu khoảng giá ---");
                    // Gọi lại logic search với sort rẻ nhất
                    const res = await productService.searchProducts(keyword, 1, 5, "price_asc");
                    finalProducts = res.DT?.products || [];
                    finalReply = `Dạ, đây là những mẫu ${keyword} có giá cực kỳ tốt (rẻ nhất) tại shop mình ạ!`;
                    break;
                }
                const res = await productService.filterProductsAdvanced(
                    keyword,
                    minPrice,
                    maxPrice,
                    5
                );

                finalProducts = res.DT?.products || [];

                if (finalProducts.length > 0) {
                    // 2. Logic tạo câu trả lời linh hoạt dựa trên các khoảng giá
                    let priceContext = "";

                    if (minPrice && maxPrice) {
                        priceContext = `tầm giá từ ${minPrice.toLocaleString()}đ đến ${maxPrice.toLocaleString()}đ`;
                    } else if (maxPrice) {
                        priceContext = `giá dưới ${maxPrice.toLocaleString()}đ`;
                    } else if (minPrice) {
                        priceContext = `giá trên ${minPrice.toLocaleString()}đ`;
                    } else {
                        priceContext = "phù hợp";
                    }

                    const productKeyword = keyword ? `'${keyword}'` : "sản phẩm";
                    finalReply = `Dạ, đây là các ${productKeyword} ${priceContext} mà bạn đang tìm đây ạ! ✨`;

                } else {
                    finalReply = "Dạ hiện tại shop chưa có sản phẩm nào phù hợp với khoảng giá này rồi ạ. Bạn có muốn xem mẫu khác không?";
                }

                break;
            }

            default:
                finalReply = "Dạ, hệ thống chưa hỗ trợ yêu cầu này ạ.";
                break;
        }

    } catch (error) {
        console.error(">>> Lỗi executeAiAction:", error);
        finalReply = "Dạ hệ thống đang gặp lỗi, bạn thử lại giúp mình nhé!";
    }

    return { finalReply, finalProducts };
};

module.exports = {
    executeAiAction
};
