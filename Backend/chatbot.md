# Tài liệu Kvil chatbot AI Assistant 🤖✨

Chào mừng bạn đến với tài liệu chi tiết về Trợ lý ảo thời trang của **Kvil Fashion**. Đây là một hệ thống Chatbot thông minh được xây dựng trên nền tảng AI hiện đại, thiết kế để mang lại trải nghiệm mua sắm cá nhân hóa và chuyên nghiệp nhất.

---

## 1. Tổng quan về Nhân vật (Persona)
- **Tên:** Kvil Fashion Assistant.
- **Vai trò:** Chuyên gia tư vấn thời trang, hỗ trợ bán hàng và chăm sóc khách hàng.
- **Tính cách:** Thân thiện, lịch sự, chuyên nghiệp và luôn sẵn sàng hỗ trợ.
- **Ngôn ngữ:** Tiếng Việt (có hỗ trợ Emoji nhẹ nhàng).

---

## 2. Các nhóm Chức năng chính

### A. Tư vấn & Tìm kiếm Sản phẩm 👗
Chatbot có khả năng hiểu các câu hỏi tự nhiên về sản phẩm:
- **Tìm kiếm thông minh:** Hiểu các yêu cầu như "váy lụa mới nhất", "áo thun giá rẻ", "quần jean cao cấp".
- **Gợi ý theo xu hướng:** Tự động lấy danh sách sản phẩm **Bán chạy (Best Seller)** hoặc **Giảm giá mạnh (Best Discount)** khi khách yêu cầu.
- **Bộ sưu tập:** Giới thiệu các bộ sưu tập thời trang mới nhất của shop.

### B. Kiểm tra Tồn kho (Availability) 🔍
Khách hàng có thể kiểm tra trực tiếp một sản phẩm cụ thể:
- **Check theo biến thể:** Kiểm tra xem một mẫu áo còn **Size M** hay **Màu đen** không.
- **Phản hồi thời gian thực:** Dữ liệu được lấy trực tiếp từ Database kho hàng.

### C. Lọc giá Nâng cao (Advanced Filtering) 💰
AI có khả năng bóc tách con số từ ngôn ngữ tự nhiên:
- **Xử lý khoảng giá:** "Tìm cho mình váy dưới 500k", "Quần từ 200k đến 400k".
- **Thông minh:** Tự động nhân hệ số 'k' (ví dụ: 700k -> 700,000đ).

### D. Tra cứu Đơn hàng (Order Tracking) 📦 [NEW]
Đây là tính năng mạnh mẽ nhất giúp giảm tải cho nhân viên CSKH:
- **Tự động nhận diện:** Nếu khách đã đăng nhập, AI tự động liệt kê 3 đơn hàng gần nhất kèm trạng thái.
- **Xác thực Guest:** Đối với khách vãng lai, AI yêu cầu cung cấp **Mã đơn hàng + Số điện thoại** để bảo mật thông tin.
- **Chi tiết sản phẩm:** Phản hồi chi tiết từng món đồ trong đơn (Tên, Size, Màu) cùng trạng thái vận chuyển và ngày đặt.

---

## 3. Kiến trúc Công nghệ & Tối ưu (Senior Level)

### 🚀 Tốc độ phản hồi cực nhanh
- **Redis Context Cache:** Lưu giữ 10 tin nhắn gần nhất vào bộ nhớ đệm Redis. Tốc độ lấy ngữ cảnh hội thoại nhanh gấp **10 lần** so với truy vấn Database truyền thống.
- **Parallel Logging:** Quá trình lưu nhật ký chat được thực hiện song song (Async), giúp AI có thể bắt đầu suy nghĩ ngay khi bạn vừa nhấn Enter.

### 🧠 Trí tuệ AI (OpenAI GPT-4o-mini)
- **Function Calling:** AI không chỉ "nói suông" mà thực sự có quyền thực thi các hàm (Functions) để lấy dữ liệu thực từ hệ thống.
- **Kiến thức thực tế:** AI nắm rõ địa chỉ các chi nhánh của shop, Hotline hỗ trợ và các chính sách đổi trả/vận chuyển.

### 🔗 Trải nghiệm liền mạch (Seamless UX)
- **Merge History:** Khi khách hàng từ vãng lai thực hiện Đăng nhập, toàn bộ lịch sử tư vấn trước đó sẽ được "gộp" vào tài khoản cá nhân. AI sẽ không bao giờ quên những gì bạn đã hỏi.
- **Frontend Safe:** Cấu trúc dữ liệu trả về được thiết kế để tương thích 100% với các Widget Chatbot hiện đại trên thị trường.

---

## 4. Danh sách các Tools (Hàm) AI đang sử dụng

| Tên Hàm | Mô tả |
|:---|:---|
| `searchProducts` | Tìm sản phẩm theo tên/loại (Sort: mới, rẻ, đắt). |
| `getAllProducts` | Xem toàn bộ danh mục của shop. |
| `suggestCollections`| Hiển thị danh sách các Bộ sưu tập thời trang. |
| `getBestDiscount` | Lấy các sản phẩm đang Sale mạnh. |
| `getBestSeller` | Lấy các sản phẩm Hot Trend/Bán chạy. |
| `checkAvailability` | Kiểm tra tồn kho theo Size/Màu cụ thể. |
| `filterAdvanced` | Lọc chính xác theo khoảng giá tiền khách yêu cầu. |
| `trackOrder` | Truy vấn trạng thái và chi tiết món đồ trong đơn hàng. |

---

**KVIL Fashion - Nâng tầm trải nghiệm mua sắm bằng Trí tuệ nhân tạo.**
