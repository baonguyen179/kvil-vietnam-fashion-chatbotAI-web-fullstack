const orderService = require('../serviceForChatBot/orderService');
const productService = require('../serviceForChatBot/productService');
const collectionService = require('../serviceForChatBot/collectionService');
const reviewService = require('../serviceForChatBot/reviewService');

const executeAiAction = async (functionName, functionArgs = {}, userId = null) => {
    let finalReply = "";
    let finalProducts = [];
    let rawResult = null;

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
                rawResult = {
                    found: ordersInfo.length > 0,
                    orders: ordersInfo.map(o => ({
                        orderId: o.orderId,
                        status: o.status,
                        date: o.date,
                        total: o.total,
                        items: o.items ? o.items.map(i => ({ name: i.name, color: i.color, size: i.size, quantity: i.quantity })) : []
                    }))
                };
                break;
            }

            case "searchProducts": {
                const keyword = functionArgs.keyword || "";

                // Gọi service với các tham số mặc định page=1, limit=5
                const searchRes = await productService.searchProducts(keyword, 1, 5);

                // Lấy đúng mảng products từ cấu trúc DT mới của bạn
                finalProducts = searchRes.DT?.products || [];

                if (finalProducts.length > 0) {
                    // Trả lời linh hoạt nếu là BST
                    const isCollection = ["summer", "lady", "dạ hội", "áo dài"].some(c => keyword.toLowerCase().includes(c));

                    finalReply = functionArgs.replyMessage ||
                        (isCollection
                            ? `Dạ, shop mời bạn xem các mẫu trong bộ sưu tập '${keyword}' mới nhất đây ạ! ✨`
                            : `Dạ, mình tìm thấy một số mẫu '${keyword}' phù hợp với bạn đây ạ!`);
                } else {
                    finalReply = `Dạ tiếc quá, hiện tại shop chưa có mẫu nào khớp với '${keyword}' rồi ạ. Bạn thử tìm từ khóa khác nhé!`;
                }
                rawResult = {
                    keyword,
                    count: finalProducts.length,
                    products: finalProducts.map(p => ({
                        id: p.id,
                        name: p.name,
                        price: p.basePrice,
                        discountPercent: p.discountPercent
                    }))
                };
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

                rawResult = {
                    sort,
                    count: finalProducts.length,
                    products: finalProducts.map(p => ({
                        id: p.id,
                        name: p.name,
                        price: p.basePrice,
                        discountPercent: p.discountPercent
                    }))
                };
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
                rawResult = {
                    count: collections.length,
                    collections: collections.map(c => ({
                        id: c.id,
                        name: c.name,
                        description: c.description
                    }))
                };
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

                rawResult = {
                    limit,
                    count: finalProducts.length,
                    products: finalProducts.map(p => ({
                        id: p.id,
                        name: p.name,
                        price: p.basePrice,
                        discountPercent: p.discountPercent
                    }))
                };
                break;
            }

            case "getBestSellerProducts": {
                // Gán mặc định là chuỗi rỗng nếu AI không bóc tách được keyword
                const keyword = functionArgs.keyword || "";
                const limit = functionArgs.limit || 5;

                const res = await productService.getBestSellerProducts(keyword, limit);
                finalProducts = res.DT?.products || [];

                if (finalProducts.length > 0) {
                    finalReply = keyword
                        ? `Dạ, đây là các mẫu ${keyword} bán chạy nhất tại shop mình ạ!`
                        : "Dạ, đây là danh sách những sản phẩm đang dẫn đầu xu hướng và bán chạy nhất tại Kvil ạ! ✨";
                } else {
                    finalReply = "Dạ hiện tại các mẫu này đang cháy hàng mất rồi, bạn xem thử các bộ sưu tập mới nhé!";
                }
                rawResult = {
                    keyword,
                    limit,
                    count: finalProducts.length,
                    products: finalProducts.map(p => ({
                        id: p.id,
                        name: p.name,
                        price: p.basePrice,
                        discountPercent: p.discountPercent
                    }))
                };
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

                rawResult = {
                    keyword,
                    size,
                    color,
                    available: isAvailable,
                    variants: (stockRes.DT?.variants || []).map(v => ({
                        sku: v.sku,
                        stock: v.stock,
                        price: v.price,
                        color: v.color?.name,
                        size: v.size?.name
                    }))
                };
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
                    rawResult = {
                        keyword,
                        count: finalProducts.length,
                        products: finalProducts.map(p => ({
                            id: p.id,
                            name: p.name,
                            price: p.basePrice
                        }))
                    };
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

                rawResult = {
                    keyword,
                    minPrice,
                    maxPrice,
                    count: finalProducts.length,
                    products: finalProducts.map(p => ({
                        id: p.id,
                        name: p.name,
                        price: p.basePrice
                    }))
                };
                break;
            }

            case "getTopRatedProducts": {
                const keyword = functionArgs.keyword || "";
                const minRating = functionArgs.minRating || 4.0;
                const limit = functionArgs.limit || 5;

                const res = await reviewService.getTopRatedProducts(keyword, minRating, limit);
                finalProducts = res.DT?.products || [];

                if (finalProducts.length > 0) {
                    const ratingLabel = minRating >= 5 ? "5 sao hoàn hảo" : `từ ${minRating} sao trở lên`;
                    finalReply = keyword
                        ? `Dạ, đây là những mẫu '${keyword}' được khách hàng đánh giá ${ratingLabel} tại Kvil ạ! ⭐`
                        : `Dạ, đây là những sản phẩm được khách hàng đánh giá ${ratingLabel} tại shop mình ạ! ⭐`;
                } else {
                    finalReply = keyword
                        ? `Dạ, hiện tại chưa có mẫu '${keyword}' nào đạt đủ ${minRating} sao với nhiều lượt đánh giá ạ. Bạn thử xem các sản phẩm khác nhé!`
                        : `Dạ, hệ thống chưa có sản phẩm nào đạt đủ ${minRating} sao với nhiều lượt đánh giá ạ.`;
                }
                rawResult = {
                    keyword,
                    minRating,
                    limit,
                    count: finalProducts.length,
                    products: finalProducts.map(p => ({
                        id: p.id,
                        name: p.name,
                        price: p.basePrice,
                        ratingAvg: p.ratingAvg
                    }))
                };
                break;
            }

            case "getProductReviewSummary": {
                const productName = functionArgs.productName || "";
                const sampleLimit = functionArgs.sampleLimit || 3;

                if (!productName) {
                    finalReply = "Dạ, bạn muốn xem đánh giá của sản phẩm nào ạ? Cho mình biết tên sản phẩm với nhé!";
                    rawResult = { error: "Missing productName" };
                    break;
                }

                const summaryRes = await reviewService.getProductReviewSummary(productName, sampleLimit);
                const { product, reviewSummary } = summaryRes.DT || {};

                rawResult = {
                    productName,
                    found: !!product,
                    product: product ? { id: product.id, name: product.name } : null,
                    reviewSummary: reviewSummary ? {
                        ratingAvg: reviewSummary.ratingAvg,
                        reviewCount: reviewSummary.reviewCount,
                        sampleComments: reviewSummary.sampleComments || []
                    } : null
                };

                if (!product) {
                    finalReply = `Dạ, mình không tìm thấy sản phẩm nào có tên '${productName}' trong hệ thống ạ. Bạn thử tìm kiếm lại với từ khóa khác nhé!`;
                    break;
                }

                // Đặt product vào finalProducts để FE có thể render card
                finalProducts = [product];

                if (!reviewSummary || reviewSummary.reviewCount === 0) {
                    finalReply = `Dạ, sản phẩm '${product.name}' hiện chưa có đánh giá nào ạ. Bạn có thể là người đầu tiên trải nghiệm và chia sẻ cảm nhận đó! 😊`;
                    break;
                }

                // Tổng hợp câu trả lời từ data thực
                const starEmoji = reviewSummary.ratingAvg >= 4.5 ? "⭐⭐⭐⭐⭐" : reviewSummary.ratingAvg >= 4 ? "⭐⭐⭐⭐" : "⭐⭐⭐";
                let replyText = `Dạ, sản phẩm **${product.name}** được đánh giá ${reviewSummary.ratingAvg}/5 ${starEmoji} với ${reviewSummary.reviewCount} lượt nhận xét ạ!`;

                if (reviewSummary.sampleComments && reviewSummary.sampleComments.length > 0) {
                    const commentsText = reviewSummary.sampleComments
                        .map(c => `- "${c.comment}" (${c.reviewer} - ${c.rating}⭐)`)
                        .join('\n');
                    replyText += `\n\nMột số nhận xét gần đây:\n${commentsText}`;
                }

                replyText += "\n\nBạn muốn xem thêm thông tin về sản phẩm này không ạ?";
                finalReply = replyText;
                break;
            }

            default:
                finalReply = "Dạ, hệ thống chưa hỗ trợ yêu cầu này ạ.";
                rawResult = { error: "Unsupported tool name" };
                break;
        }

    } catch (error) {
        console.error(">>> Lỗi executeAiAction:", error);
        finalReply = "Dạ hệ thống đang gặp lỗi, bạn thử lại giúp mình nhé!";
        rawResult = { error: error.message || "Internal execution error" };
    }

    return { finalReply, finalProducts, rawResult };
};

module.exports = {
    executeAiAction
};
