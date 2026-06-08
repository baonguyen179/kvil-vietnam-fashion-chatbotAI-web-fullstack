notation crows-foot
colorMode pastel
typeface rough

Roles [icon: shield, color: red] {
id int pk
name string unique // 'SUPER_ADMIN', 'SALES', 'ACCOUNTANT', 'CUSTOMER'
description string // VD: "Nhân viên phòng kinh doanh"
createdAt datetime
updatedAt datetime
}
Permissions [icon: key, color: red] {
id int pk
name string unique // Ví dụ: 'products.update', 'orders.read', 'users.manage'
module string // Để gom nhóm: 'Products', 'Orders', 'Chatbot'
description string
createdAt datetime
}

// 2. Bảng trung gian nối Role và Permission (N-N)
RolePermissions [icon: link, color: red] {
roleId int [ref: > Roles.id]
permissionId int [ref: > Permissions.id]
primary key (roleId, permissionId)
}
// Bảng trung gian nối User và Permission cấp riêng (N-N)
UserPermissions [icon: link, color: blue] {
userId int [ref: > Users.id]
permissionId int [ref: > Permissions.id]
createdAt datetime
updatedAt datetime
primary key (userId, permissionId)
}
// CẬP NHẬT: Bảng trung gian nối User và Role (N-N)
UserRoles [icon: link, color: blue] {
userId int [ref: > Users.id]
roleId int [ref: > Roles.id]
createdAt datetime
updatedAt datetime
primary key (userId, roleId)
}
Users [icon: user, color: blue] {
id int pk
email string unique
phone string unique
password string
fullName string
birthday date
gender boolean
refresh_token text
createdAt datetime
updatedAt datetime
}

UserAddresses [icon: map-pin, color: blue] {
id int pk
userId int [ref: > Users.id]
receiverName string
phoneNumber string
province string
ward string
detailAddress string
isDefault boolean
createdAt datetime
updatedAt datetime
}

Products [icon: package, color: green] {
id int pk
categoryId int [ref: > Categories.id]
name string
description text
basePrice decimal
discountPercent int
ratingAvg decimal
reviewCount int
createdAt datetime
updatedAt datetime
}

ProductImages [icon: image, color: orange] {
id int pk
productId int [ref: > Products.id]
imageUrl string // Link ảnh trả về từ Cloudinary
publicId string // Dùng để xóa ảnh trên Cloudinary khi cần
isMain boolean // Ảnh đại diện
createdAt datetime
updatedAt datetime
}

ProductVariants [icon: layers, color: green] {
id int pk
productId int [ref: > Products.id]
sizeId int [ref: > Sizes.id]  
 colorId int [ref: > Colors.id]  
 stock int // Chú ý: Cột này giờ sẽ được tự động cộng/trừ dựa vào bảng InventoryLogs bên dưới
price decimal // Giá riêng (nếu size to hơn thì đắt hơn)
sku string
}

Colors [icon: palette, color: green] {
id int pk
name string unique // Tên màu (VD: "Đỏ", "Xanh dương")
hexCode string // Mã màu hiển thị UI (VD: "#FF0000", "#0000FF")
createdAt datetime
}

Sizes [icon: maximize, color: green] {
id int pk
name string unique // VD: 'S', 'M', 'L', 'XL', 'Freesize'
description text// VD: 'Dưới 50kg' (Rất hữu ích cho đồ thời trang nữ)
createdAt datetime
}

Categories [icon: list, color: orange] {
id int pk
name string
slug string // "ao-thun-nam"
}

Collections [icon: star, color: purple] {
id int pk
name string
description text
bannerUrl string
slug string
isActive boolean
createdAt datetime
updatedAt datetime
}

Coupons [icon: ticket, color: red]{
id int pk
code string unique // Ví dụ: KM_HE_2024
discountType string // fixed or percent
discountValue decimal
minOrderValue decimal // Giá trị đơn hàng tối thiểu để áp dụng
maxDiscountAmount decimal // Số tiền giảm tối đa nếu phần trăm
startDate datetime
endDate datetime
usageLimit int
usedCount int
isActive boolean
}

Orders [icon: shopping-cart, color: yellow] {
id int pk
userId int [ref: > Users.id]
couponId int [ref: > Coupons.id, null]
totalBeforeDiscount decimal
discountAmount decimal
finalAmount decimal
paymentMethod string // 'COD', 'VNPAY'
paymentStatus boolean // true: đã thanh toán, false: chưa
shippingAddress text
deliveryMethod text //store_pickup,home_delivery
status string // 'pending', 'confirmed', 'shipping', 'delivered', 'cancelled', 'returning' (đang yêu cầu trả), 'returned' (đã hoàn trả)
shippingFee decimal
createdAt datetime
updatedAt datetime // Đã bổ sung
}

OrderItems [icon: list, color: yellow] {
id int pk
orderId int [ref: > Orders.id]
variantId int [ref: > ProductVariants.id] // Biết chính xác khách mua size gì, màu gì
quantity int
costPrice DECIMAL(15,2),
price decimal // GIÁ TẠI THỜI ĐIỂM MUA
}

CollectionProducts [icon: link, color: purple] {
collectionId int [ref: > Collections.id]
productId int [ref: > Products.id]
}

Carts [icon: shopping-bag, color: blue] {
id int pk
userId int [ref: > Users.id]
createdAt datetime
updatedAt datetime
}

CartItems [icon: list, color: blue] {
id int pk
cartId int [ref: > Carts.id]
variantId int [ref: > ProductVariants.id]
quantity int
createdAt datetime
updatedAt datetime
}
ChatLogs [icon: message-square, color: pink] {
id int pk
userId int [ref: > Users.id, null] // null nếu là khách vãng lai (chưa đăng nhập)
sessionId string // ID phiên chat (để gom nhóm các tin nhắn của cùng 1 lần chat)
sender string // 'USER' hoặc 'BOT'
message text // Nội dung tin nhắn
metadata text // (Tùy chọn) Lưu mảng JSON chứa các ID sản phẩm bot đã gợi ý
createdAt datetime
updatedAt datetime
}
InventoryLogs [icon: archive, color: green] {
id int pk
variantId int [ref: > ProductVariants.id]
userId int [ref: > Users.id] // Người thực hiện (Nhân viên Kinh doanh)
type string // 'IN' (Nhập mới), 'OUT' (Xuất thực), 'RETURN' (Hoàn trả), 'HOLD' (Tạm giữ), 'UNHOLD' (Hủy giữ), 'ADJUST' (Điều chỉnh kho)
quantity int // Số lượng thay đổi
costPrice DECIMAL(15,2),
note text // Ghi chú (VD: "Nhập lô hàng Hè", "Khách trả hàng đơn #123")
createdAt datetime // Thời gian thực hiện
}
PaymentTransactions [icon: credit-card, color: yellow] {
id int pk
orderId int [ref: > Orders.id]
provider string // 'VNPAY'
transactionId string // Mã giao dịch trả về từ ngân hàng (Ví dụ: vnp_TransactionNo)
amount decimal // Số tiền thực tế đã chuyển
status string // 'SUCCESS', 'FAILED', 'PENDING'
createdAt datetime
}
ReturnRequests [icon: repeat, color: red] {
id int pk
orderId int [ref: > Orders.id]
userId int [ref: > Users.id] // Khách hàng yêu cầu
reason text // Lý do đổi trả
status string // 'PENDING' (Chờ duyệt), 'APPROVED' (Kinh doanh duyệt), 'REFUNDED' (Kế toán đã hoàn tiền), 'REJECTED'
images text // JSON mảng link ảnh khách chụp lỗi
createdAt datetime
updatedAt datetime
}
Reviews [icon: star, color: yellow] {
id int pk
productId int [ref: > Products.id] // Biết đánh giá cho sản phẩm gốc nào
orderItemId int [ref: > OrderItems.id] // Móc nối vào item đã mua để chống spam
userId int [ref: > Users.id, null] // null nếu khách đánh giá qua link email
rating int // Số sao: 1, 2, 3, 4, 5
comment text // Lời bình luận
status string // 'PENDING' (Chờ duyệt), 'APPROVED' (Hiển thị), 'HIDDEN' (Bị ẩn)
createdAt datetime
updatedAt datetime
}
ReviewImages [icon: image, color: orange] {
id int pk
reviewId int [ref: > Reviews.id]
imageUrl string
publicId string
}
