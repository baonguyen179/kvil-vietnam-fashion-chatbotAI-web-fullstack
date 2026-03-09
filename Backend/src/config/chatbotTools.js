
const aiFunctionDeclarations = [
    {
        name: "searchProducts",
        description: "Tìm kiếm sản phẩm cụ thể bằng từ khóa (ví dụ: áo sơ mi, quần jean, váy).",
        parameters: {
            type: "OBJECT",
            properties: {
                keyword: { type: "STRING", description: "Từ khóa cần tìm" },
                replyMessage: {
                    type: "STRING",
                    description: "Câu trả lời khéo léo của bạn gửi cho khách. Nếu thông tin chưa rõ, hãy GỢI Ý MỘT VÀI SẢN PHẨM và HỎI THÊM khách về giới tính, màu sắc, size, hoặc sở thích để tư vấn chuẩn xác hơn."
                }
            },
            required: ["keyword"]
        }
    },
    {
        name: "getAllProducts",
        description: "Xem các sản phẩm theo tiêu chí chung (mới nhất, giá rẻ, đắt nhất).",
        parameters: {
            type: "OBJECT",
            properties: {
                sort: {
                    type: "STRING",
                    description: "BẮT BUỘC chọn 1 trong 4 giá trị: 'newest', 'price_asc', 'price_desc', 'oldest'"
                },
                replyMessage: {
                    type: "STRING",
                    description: "Câu nói thân thiện gửi kèm danh sách sản phẩm."
                }
            }
        }
    },
    {
        name: "suggestCollections",
        description: "Dùng để giới thiệu cho khách hàng các BỘ SƯU TẬP (Collection) hoặc CHỦ ĐỀ theo mùa đang có của shop. Gọi hàm này khi khách muốn mua đồ theo sự kiện, đi du lịch, đồ theo mùa (xuân, hạ, thu, đông), hoặc khi khách không biết mặc gì.",
        parameters: {
            type: "OBJECT",
            properties: {
                replyMessage: {
                    type: "STRING",
                    description: "Câu giới thiệu các bộ sưu tập một cách hấp dẫn. Kèm theo câu hỏi xem khách muốn xem chi tiết bộ sưu tập nào."
                }
            },
            required: ["replyMessage"]
        }
    }

];

module.exports = {
    aiFunctionDeclarations
};