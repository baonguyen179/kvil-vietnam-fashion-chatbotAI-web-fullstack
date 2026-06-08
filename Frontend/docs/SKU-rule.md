# Trả lời câu hỏi về SKU trong doanh nghiệp thời trang tự sản xuất

## Câu trả lời ngắn gọn

Trong doanh nghiệp thời trang tự sản xuất, SKU là mã quản lý nội bộ do doanh nghiệp quy định. Bộ phận sản xuất sẽ tạo và gán SKU cho từng biến thể sản phẩm (màu sắc, kích thước) trước khi hàng hóa được nhập kho.

Sau khi hoàn thành sản xuất:

1. Bộ phận sản xuất gắn SKU cho sản phẩm.
2. Hàng hóa được bàn giao cho kho.
3. Thủ kho nhập hàng vào hệ thống bằng SKU, số lượng và giá vốn.
4. Nếu SKU đã tồn tại, hệ thống cập nhật tồn kho.
5. Nếu là SKU mới, nhân viên tạo thông tin sản phẩm và biến thể tương ứng trước khi nhập kho.

---

## Giải thích nghiệp vụ

SKU là mã quản lý nội bộ của doanh nghiệp, được sử dụng để định danh từng biến thể sản phẩm theo màu sắc và kích thước.

Tại doanh nghiệp được khảo sát, SKU được tạo theo quy tắc quản lý mã hàng của công ty trước khi sản phẩm được nhập kho. Mỗi biến thể sản phẩm tương ứng với một SKU duy nhất nhằm phục vụ cho việc quản lý tồn kho, bán hàng và thống kê báo cáo.

Ví dụ:

- 33500341-4-S-W
  - 33500341-4: Mã sản phẩm
  - S: Size S
  - W: Màu trắng
- 33500341-4-S-R
  - 33500341-4: Mã sản phẩm
  - S: Size S
  - R: Màu đỏ
- 3330650-3-M-W:
  - 3330650-3: Mã sản phẩm
  - M: Size M
  - W: Màu trắng

Nhờ đó doanh nghiệp có thể quản lý tồn kho, bán hàng và báo cáo theo từng biến thể sản phẩm.

---

## Vì sao hệ thống không tự sinh SKU?

Hệ thống được xây dựng dựa trên quy trình vận hành hiện có của doanh nghiệp. SKU là mã hàng do doanh nghiệp quản lý và sử dụng xuyên suốt giữa các bộ phận sản xuất, kho, kinh doanh và kế toán.

Vì vậy, hệ thống cho phép nhập SKU thủ công để đảm bảo dữ liệu trên hệ thống đồng nhất với mã hàng thực tế đang được doanh nghiệp sử dụng.

Để đảm bảo tính chính xác dữ liệu, hệ thống thực hiện kiểm tra tính duy nhất của SKU, cảnh báo trùng lặp và hỗ trợ nhập dữ liệu hàng loạt thông qua tệp Excel.

---

## Câu trả lời khi bảo vệ đồ án

"SKU trong hệ thống của em không được sinh tự động. SKU là mã quản lý nội bộ do doanh nghiệp quy định và được bộ phận sản xuất gán cho từng biến thể sản phẩm trước khi nhập kho. Khi hàng được bàn giao cho kho, thủ kho sử dụng SKU đó để nhập số lượng và giá vốn vào hệ thống. Hệ thống được thiết kế theo đúng quy trình vận hành của doanh nghiệp nên cho phép nhập SKU thủ công, đồng thời kiểm tra tính duy nhất của SKU để đảm bảo dữ liệu không bị trùng lặp."
