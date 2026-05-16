const aiFunctionDeclarations = [
    {
        type: "function",
        function: {
            name: "searchProducts",
            description: "Tìm kiếm sản phẩm theo tên, loại hoặc tên BỘ SƯU TẬP (như 'Hello Summer', 'Sweet Lady'). Dùng khi khách muốn xem các mẫu trong một bộ sưu tập cụ thể.",
            parameters: {
                type: "object",
                properties: {
                    keyword: {
                        type: "string",
                        description: "Tên riêng của sản phẩm hoặc bộ sưu tập (Ví dụ: 'Dạ hội' thay vì 'Bộ sưu tập dạ hội', 'Áo dài' thay vì 'các mẫu áo dài')."
                    },
                    sort: {
                        type: "string",
                        enum: ["price_asc", "price_desc", "newest"],
                        description: "Dùng 'price_asc' cho từ 'rẻ', 'price_desc' cho 'đắt/cao cấp', 'newest' cho 'mới nhất'."
                    },
                    limit: {
                        type: "number",
                        default: 5
                    }
                },
                required: ["keyword"]
            }
        }
    },

    {
        type: "function",
        function: {
            name: "getAllProducts",
            description: "Xem toàn bộ sản phẩm của shop khi khách không nói rõ loại sản phẩm nào.",
            parameters: {
                type: "object",
                properties: {
                    sort: {
                        type: "string",
                        enum: ["newest", "price_asc", "price_desc", "oldest"],
                        description: "Tiêu chí sắp xếp"
                    },
                    limit: { type: "number", default: 5 }
                }
            }
        }
    },

    {
        type: "function",
        function: {
            name: "suggestCollections",
            description: "Hiển thị danh sách các bộ sưu tập thời trang của shop.",
            parameters: {
                type: "object",
                properties: {} // Không cần tham số
            }
        }
    },

    {
        type: "function",
        function: {
            name: "getBestDiscountProducts",
            description: "Tìm các sản phẩm đang có chương trình giảm giá, sale, ưu đãi.",
            parameters: {
                type: "object",
                properties: {
                    keyword: { type: "string", description: "Loại sản phẩm muốn tìm sale" },
                    limit: { type: "number", default: 5 }
                }
            }
        }
    },

    {
        type: "function",
        function: {
            name: "getBestSellerProducts",
            description: "Tìm các sản phẩm bán chạy, hot trend, được mua nhiều nhất.",
            parameters: {
                type: "object",
                properties: {
                    keyword: { type: "string", description: "Loại sản phẩm bán chạy" },
                    limit: { type: "number", default: 5 }
                }
            }
        }
    },

    {
        type: "function",
        function: {
            name: "checkProductAvailability",
            description: "Kiểm tra xem một mẫu cụ thể còn hàng, còn size hay màu đó không.",
            parameters: {
                type: "object",
                properties: {
                    keyword: { type: "string", description: "Tên sản phẩm cụ thể" },
                    size: { type: "string", description: "Ví dụ: S, M, L, XL hoặc 39, 40..." },
                    color: { type: "string", description: "Ví dụ: xanh, đen, trắng..." }
                },
                required: ["keyword"]
            }
        }
    },

    {
        type: "function",
        function: {
            name: "filterProductsAdvanced",
            description: "CHỈ dùng khi khách nhắc đến CON SỐ cụ thể (ví dụ: 'dưới 500k', 'từ 200k đến 300k').",
            parameters: {
                type: "object",
                properties: {
                    keyword: { type: "string", description: "Loại sản phẩm" },
                    minPrice: {
                        type: "number",
                        description: "Giá tối thiểu. Ví dụ: khách nói 'trên 200k' thì minPrice là 200000."
                    },
                    maxPrice: {
                        type: "number",
                        description: "Giá tối đa. Ví dụ: khách nói 'dưới 500k' thì maxPrice là 500000."
                    },
                    limit: { type: "number", default: 5 }
                },
                required: ["keyword"]
            }
        }
    },

    {
        type: "function",
        function: {
            name: "trackOrder",
            description: "Tra cứu trạng thái và thông tin chi tiết đơn hàng (ngày đặt, sản phẩm, trạng thái giao hàng).",
            parameters: {
                type: "object",
                properties: {
                    orderId: { type: "number", description: "Mã đơn hàng (ví dụ: 123)" },
                    phone: { type: "string", description: "Số điện thoại đặt đơn (bắt buộc nếu là khách vãng lai)" }
                }
            }
        }
    },

    {
        type: "function",
        function: {
            name: "getTopRatedProducts",
            description: "Tìm các sản phẩm được khách hàng đánh giá cao nhất (nhiều sao nhất, chất lượng tốt). Dùng khi khách hỏi: 'sản phẩm nào được review tốt', '5 sao', 'khách hàng thích nhất', 'chất lượng cao', 'đánh giá cao', 'được yêu thích'.",
            parameters: {
                type: "object",
                properties: {
                    keyword: {
                        type: "string",
                        description: "Loại sản phẩm muốn lọc (ví dụ: 'váy', 'áo', 'quần'). Bỏ trống nếu hỏi tổng quát."
                    },
                    minRating: {
                        type: "number",
                        description: "Ngưỡng rating tối thiểu từ 1-5. Mặc định là 4.0. Dùng 5 nếu khách nói '5 sao hoàn hảo'."
                    },
                    limit: {
                        type: "number",
                        default: 5,
                        description: "Số lượng sản phẩm trả về."
                    }
                }
            }
        }
    },

    {
        type: "function",
        function: {
            name: "getProductReviewSummary",
            description: "Xem tổng quan đánh giá (số sao trung bình, nhận xét mẫu) của một sản phẩm CỤ THỂ. Dùng khi khách hỏi: 'khách review [tên sp] thế nào', 'đánh giá của [tên sp]', 'mọi người nói gì về [tên sp]'.",
            parameters: {
                type: "object",
                properties: {
                    productName: {
                        type: "string",
                        description: "Tên sản phẩm khách muốn xem đánh giá (ví dụ: 'Áo sơ mi trắng', 'Váy hoa')."
                    },
                    sampleLimit: {
                        type: "number",
                        default: 3,
                        description: "Số lượng bình luận mẫu trả về (tối đa 5)."
                    }
                },
                required: ["productName"]
            }
        }
    }
];

module.exports = {
    aiFunctionDeclarations
};