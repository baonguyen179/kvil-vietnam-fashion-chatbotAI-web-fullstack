const orderService = require('../service/orderService');
const productService = require('../service/productService');
const collectionService = require('../service/collectionService');

const executeAiAction = async (functionName, functionArgs = {}, userId = null) => {
    let finalReply = "";
    let finalProducts = [];

    try {
        switch (functionName) {

            // [NEW] Tra cứu đơn hàng
            case "trackOrder": {
                const { orderId, phone } = functionArgs;
                let ordersInfo = [];

                if (userId) {
                    // Ưu tiên tra cứu đơn hàng của User đang login
                    const userOrders = await orderService.getUserOrdersShort(userId);
                    if (userOrders && userOrders.length > 0) {
                        ordersInfo = userOrders;
                    }
                }

                if (ordersInfo.length === 0 && orderId && phone) {
                    // Nếu không phải user hoặc user chưa có đơn, tra cứu theo ID + Phone (Guest flow)
                    const guestOrderRes = await orderService.getGuestOrderDetail(orderId, phone);
                    if (guestOrderRes.EC === 0 && guestOrderRes.DT) {
                        // Vì getGuestOrderDetail trả về 1 đơn, ta convert sang array để dùng chung logic
                        ordersInfo = [{
                            orderId: guestOrderRes.DT.orderId,
                            status: guestOrderRes.DT.status,
                            date: guestOrderRes.DT.orderDate,
                            total: guestOrderRes.DT.finalAmount,
                            // Note: getGuestOrderDetail hiện chưa trả về items chi tiết, 
                            // ta có thể bổ sung nếu khách yêu cầu "chi tiết hơn" thực sự cho Guest.
                        }];
                    }
                }

                if (ordersInfo.length > 0) {
                    const orderStrings = ordersInfo.map(o => {
                        const dateStr = new Date(o.date).toLocaleDateString('vi-VN');
                        let itemsStr = "";
                        if (o.items && o.items.length > 0) {
                            itemsStr = "\n   Sản phẩm: " + o.items.map(i => `${i.name} (${i.color}, ${i.size}) x${i.quantity}`).join(', ');
                        }
                        return `- Đơn #${o.orderId} [${o.status}] đặt ngày ${dateStr}.${itemsStr}`;
                    }).join('\n\n');

                    finalReply = `Dạ, mình tìm thấy thông tin đơn hàng của bạn đây ạ:\n\n${orderStrings}\n\nBạn cần hỗ trợ thêm gì về đơn hàng này không ạ?`;
                } else {
                    finalReply = "Dạ, mình vẫn chưa tìm thấy đơn hàng nào khớp với thông tin bạn cung cấp. Bạn kiểm tra lại mã đơn hoặc số điện thoại giúp mình nhé!";
                }
                break;
            }

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
