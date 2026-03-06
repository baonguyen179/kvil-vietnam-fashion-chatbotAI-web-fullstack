Mẫu Prompt Tối Ưu Cho Backend API 
Mục tiêu: Hãy viết cho tôi API [Tên/Chức năng API, VD: Thêm danh sách Sản phẩm vào Bộ sưu tập]

1. Thông tin Database & Quan hệ:

Tương tác với bảng: [Tên bảng, VD: Collections, Products, CollectionProducts]

Mối quan hệ: [VD: Nhiều-Nhiều thông qua CollectionProducts]

2. Cấu trúc Request (Đầu vào):

Method & Endpoint dự kiến: [VD: POST /api/v1/admin/collections/:id/products]

Input từ User: [VD: req.params.id (collectionId), req.body: { productIds: [1, 2, 3] }]

Yêu cầu quyền: [VD: CheckAdmin / CheckUserJWT / Public]

3. Logic Nghiệp vụ (Business Logic):

Bước 1: [VD: Kiểm tra collectionId có tồn tại không]

Bước 2: [VD: Xóa hết các sản phẩm cũ của BST này trong bảng trung gian]

Bước 3: [VD: Insert danh sách productIds mới vào bảng trung gian]

4. Yêu cầu BẮT BUỘC tuân thủ (Checklist):

Validation: BẮT BUỘC phải viết Joi schema ở thư mục validations/ để kiểm tra input chặt chẽ.

Kiến trúc: Phân tách rõ ràng code ở 3 file: Validation -> Controller -> Service. Cung cấp đoạn code gắn vào Routes.

Bảo mật: Check chống IDOR (nếu có), không bao giờ Hard-delete (nếu là API xóa).

Format Output: Luôn trả về cấu trúc { EM, EC, DT } và sử dụng errorCode chuẩn của dự án.

Testing: BẮT BUỘC cung cấp hướng dẫn test Postman chi tiết bao gồm Set up, Happy Path, và Unhappy Path.

Hãy đưa cho tôi code từng phần để tôi copy paste, không giải thích quá rườm rà.