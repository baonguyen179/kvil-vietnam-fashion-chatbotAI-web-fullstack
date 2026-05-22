import React from 'react';
import { useLocation } from 'react-router-dom';

const PolicyContent = () => {
    const { pathname } = useLocation();
    const path = pathname.split('/').pop();

    const renderReturnPolicy = () => (
        <div className="flex flex-col gap-10">
            {/* Mục 1 */}
            <section className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-[#1c1c19] uppercase tracking-wide">
                    1. ĐIỀU KIỆN ĐỔI TRẢ
                </h3>
                <div className="flex flex-col gap-3 text-base text-[#555555] leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                    <p>KO-ISAN Hỗ Trợ đổi trả sản phẩm trong vòng 3 ngày kể từ ngày nhận hàng với các điều kiện như sau:</p>
                    <ul className="list-disc pl-5 flex flex-col gap-2">
                        <li>Sản phẩm chưa qua sử dụng vẫn còn nguyên tem mác, không bị bẩn, bạc màu, rách, v.v...</li>
                        <li>Nếu sản phẩm có giá cao hơn sản phẩm đã mua thì khách hàng phải thanh toán tiền chênh lệch.</li>
                        <li>Không hoàn trả tiền thừa dưới bất kỳ hình thức nào.</li>
                        <li>Không đổi sản phẩm bằng phiếu quà tặng.</li>
                    </ul>
                </div>
            </section>

            {/* Mục 2 */}
            <section className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-[#1c1c19] uppercase tracking-wide">
                    2. QUY TRÌNH TRẢ HÀNG
                </h3>
                <div className="flex flex-col gap-6" style={{ fontFamily: "'Inter', sans-serif" }}>
                    <div className="flex flex-col gap-2">
                        <span className="font-bold text-[#1c1c19]">Bước 1:</span>
                        <ul className="list-disc pl-5 text-[#555555] flex flex-col gap-1">
                            <li>Liên hệ nhân viên CSKH của KO-ISAN qua hotline: <span className="font-semibold text-[#1c1c19]">0904.869.384 / 0936.982.766</span></li>
                            <li>Nhắn tin qua Fanpage KO-ISAN, Email: <span className="font-semibold text-[#1c1c19]">chko.isan@gmail.com</span></li>
                            <li>Gửi thông tin yêu cầu đổi hàng: Họ và tên; Số điện thoại; Mã đơn hàng.</li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-2">
                        <p><span className="font-bold text-[#1c1c19]">Bước 2:</span> Đóng gói sản phẩm.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <p>
                            <span className="font-bold text-[#1c1c19]">Bước 3:</span> Gửi hàng đến địa chỉ do CSKH cung cấp. 
                            Khách hàng vui lòng thanh toán chi phí vận chuyển khi đổi hàng.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <p>
                            <span className="font-bold text-[#1c1c19]">Bước 4:</span> Sau khi nhận được hàng, KO-ISAN sẽ phản hồi thông tin tới quý khách qua email hoặc điện thoại.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );

    const renderPrivacyPolicy = () => (
        <div className="flex flex-col gap-6 text-base text-[#555555] leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
            <p>
                Chính sách bảo mật này nhằm giúp Quý khách hiểu về cách website thu thập và sử dụng thông tin cá nhân của mình thông qua việc sử dụng trang web, bao gồm mọi thông tin có thể cung cấp thông qua trang web khi Quý khách đăng ký tài khoản, đăng ký nhận thông tin liên lạc từ chúng tôi, hoặc khi Quý khách mua sản phẩm, dịch vụ, yêu cầu thêm thông tin dịch vụ từ chúng tôi.
            </p>
            <p>
                Chúng tôi sử dụng thông tin cá nhân của Quý khách để liên lạc khi cần thiết liên quan đến việc Quý khách sử dụng website của chúng tôi, để trả lời các câu hỏi hoặc gửi tài liệu và thông tin Quý khách yêu cầu.
            </p>
            <p>
                Trang web của chúng tôi coi trọng việc bảo mật thông tin và sử dụng các biện pháp tốt nhất để bảo vệ thông tin cũng như việc thanh toán của khách hàng. 
            </p>
            <p>
                Khi bạn sử dụng Dịch vụ của chúng tôi và đặt hàng thông qua chúng, bạn đồng ý cung cấp cho chúng tôi địa chỉ email, địa chỉ bưu điện và / hoặc các chi tiết liên hệ khác một cách trung thực và chính xác. Bạn cũng đồng ý rằng chúng tôi có thể sử dụng thông tin này để liên hệ với bạn trong bối cảnh đơn đặt hàng của bạn nếu cần.
            </p>
            <p>
                Chúng tôi tôn trọng quyền riêng tư của bạn. Để xem cách chúng tôi thu thập và sử dụng thông tin cá nhân của bạn, bao gồm cách hủy đăng ký nhận thông tin phi giao dịch từ chúng tôi, vui lòng xem Chính sách Bảo mật của chúng tôi.
            </p>
            <p className="font-medium text-[#1c1c19]">
                Mọi thông tin giao dịch sẽ được bảo mật ngoại trừ trong trường hợp cơ quan pháp luật yêu cầu.
            </p>
        </div>
    );

    const renderTermsOfService = () => (
        <div className="flex flex-col gap-8 text-base text-[#555555] leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
            <section className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-[#1c1c19] uppercase tracking-wide">
                    1. CHUNG
                </h3>
                <div className="flex flex-col gap-3">
                    <p>
                        <span className="font-bold text-[#1c1c19]">1.1 Phạm vi.</span> Chào mừng đến với Ko-isan.com. Điều khoản & Điều kiện này (“Thỏa thuận” hoặc “Điều khoản”) là hợp đồng giữa bạn thuộc Công ty TNHH Kvil Viet Nam có địa chỉ đăng ký tại 274B Lạch Tray, Quận Ngô Quyền, Thành phố Hải Phòng, Việt Nam, quản lý việc bạn sử dụng trang web của chúng tôi tại Ko-isan.com (“Trang web”).
                    </p>
                    <p>
                        Bằng cách truy cập hoặc sử dụng Dịch vụ, bạn rõ rệt hiểu, thừa nhận và đồng ý bị ràng buộc bởi Điều khoản sử dụng. Bạn chỉ được phép sử dụng Dịch vụ nếu bạn đồng ý tuân theo tất cả các luật hiện hành và các Điều khoản này.
                    </p>
                    <p>
                        Ngoài ra, bạn có thể đọc Chính sách Bảo mật & Cookie của chúng tôi bất kỳ lúc nào để biết thêm thông tin về cách KO-ISAN thu thập, lưu trữ và bảo vệ thông tin của bạn khi bạn sử dụng Dịch vụ.
                    </p>
                    <p>
                        <span className="font-bold text-[#1c1c19]">1.2 Cập nhật các Điều khoản.</span> Chúng tôi có quyền sửa đổi các Điều khoản Sử dụng vào bất kỳ lúc nào. Việc bạn tiếp tục sử dụng Dịch vụ sau khi nhận được thông báo về việc sửa đổi sẽ cấu thành việc bạn chấp nhận các điều khoản đã sửa đổi.
                    </p>
                    <p>
                        <span className="font-bold text-[#1c1c19]">1.3 Chấp nhận các Điều khoản.</span> Để mua với chúng tôi, bạn phải từ 16 tuổi trở lên. Mọi truy cập, duyệt hoặc sử dụng Dịch vụ cho thấy bạn đồng ý với tất cả các điều khoản và điều kiện trong Thỏa thuận này.
                    </p>
                </div>
            </section>

            <section className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-[#1c1c19] uppercase tracking-wide">
                    2. CHÍNH SÁCH BẢO MẬT & COOKIE
                </h3>
                <div className="flex flex-col gap-3">
                    <p>
                        Khi bạn sử dụng Dịch vụ của chúng tôi và đặt hàng thông qua chúng, bạn đồng ý cung cấp cho chúng tôi địa chỉ email, địa chỉ bưu điện và / hoặc các chi tiết liên hệ khác một cách trung thực và chính xác.
                    </p>
                    <p>
                        Chúng tôi tôn trọng quyền riêng tư của bạn. Để xem cách chúng tôi thu thập và sử dụng thông tin cá nhân của bạn, vui lòng xem Chính sách Bảo mật & cookie của chúng tôi.
                    </p>
                </div>
            </section>

            <section className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-[#1c1c19] uppercase tracking-wide">
                    3. LỖI
                </h3>
                <div className="flex flex-col gap-3">
                    <p>
                        Trong trường hợp bạn phát hiện thấy lỗi xảy ra khi nhập dữ liệu cá nhân của mình, bạn có thể sửa đổi chúng trong phần "Tài khoản của tôi". Bạn cũng có thể liên hệ với chúng tôi để thực hiện quyền sửa chữa được quy định trong Chính sách Bảo mật & Cookie.
                    </p>
                    <p>
                        KO-ISAN không thể xác nhận giá của một mặt hàng cho đến khi bạn đặt hàng. Trong trường hợp một mặt hàng bị định giá sai, chúng tôi sẽ liên hệ với bạn để được hướng dẫn hoặc hủy đơn đặt hàng.
                    </p>
                </div>
            </section>

            <section className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-[#1c1c19] uppercase tracking-wide">
                    4. QUY TẮC THƯƠNG MẠI
                </h3>
                <div className="flex flex-col gap-4">
                    <p>
                        <span className="font-bold text-[#1c1c19]">4.1 Giá cả và Thanh toán.</span> Tất cả giá đều đã bao gồm VAT (nếu có). Tổng chi phí của đơn hàng là giá của các sản phẩm đã đặt cộng với phí giao hàng. Giá có thể thay đổi bất cứ lúc nào, nhưng sẽ không ảnh hưởng đến các đơn hàng đã nhận Xác nhận.
                    </p>
                    <p>
                        <span className="font-bold text-[#1c1c19]">4.2 Màu sắc.</span> Chúng tôi cố gắng hiển thị chính xác nhất màu sắc sản phẩm, tuy nhiên màu sắc thực tế phụ thuộc vào màn hình của bạn.
                    </p>
                    <p>
                        <span className="font-bold text-[#1c1c19]">4.3 Đóng gói.</span> KO-ISAN tuân thủ các tiêu chuẩn đóng gói tối thiểu cho phương thức vận chuyển đã chọn.
                    </p>
                    <p>
                        <span className="font-bold text-[#1c1c19]">4.4 Vận chuyển & Giao hàng.</span> Chúng tôi vận chuyển với nhiều đối tác giao vận khác nhau và nỗ lực giao hàng nhanh nhất có thể.
                    </p>
                    <p>
                        <span className="font-bold text-[#1c1c19]">4.5 Nguy cơ mất hàng.</span> Rủi ro mất mát hoặc hư hỏng sẽ chuyển cho Người mua ngay khi hàng được giao cho bên vận chuyển.
                    </p>
                    <p>
                        <span className="font-bold text-[#1c1c19]">4.6 Trả lại hàng hóa.</span> Hàng hóa có thể được trả lại theo quy định tại Chính sách đổi trả. Khách hàng trả hàng chịu phí vận chuyển.
                    </p>
                    <p>
                        <span className="font-bold text-[#1c1c19]">4.7 Đánh giá và nhận xét.</span> Mọi nội dung bạn gửi hoặc đăng lên Dịch vụ sẽ được coi là không bảo mật và KO-ISAN có quyền sử dụng, sao chép, phân phối và hiển thị các nội dung đó.
                    </p>
                </div>
            </section>

            <section className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-[#1c1c19] uppercase tracking-wide">
                    5. SỞ HỮU TRÍ TUỆ VÀ QUYỀN SỞ HỮU
                </h3>
                <div className="flex flex-col gap-3">
                    <p>
                        Mọi nội dung trên Trang web và Ứng dụng, bao gồm văn bản, phần mềm, đồ họa, ảnh, âm thanh, video thuộc về KO-ISAN hoặc bên cấp phép. Bạn chỉ có thể sử dụng Nội dung trong phạm vi được cho phép rõ ràng.
                    </p>
                </div>
            </section>

            <section className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-[#1c1c19] uppercase tracking-wide">
                    6. LIÊN KẾT VÀ NGUỒN LỰC CỦA BÊN THỨ BA
                </h3>
                <div className="flex flex-col gap-3">
                    <p>
                        Trang web của chúng tôi có thể chứa liên kết đến các trang web bên thứ ba. Chúng tôi không kiểm soát và không chịu trách nhiệm về nội dung hoặc chính sách bảo mật của họ.
                    </p>
                </div>
            </section>

            <section className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-[#1c1c19] uppercase tracking-wide">
                    7. SỰ KIỆN VƯỢT QUÁ SỰ KIỂM SOÁT CỦA CHÚNG TÔI
                </h3>
                <div className="flex flex-col gap-3">
                    <p>
                        Chúng tôi sẽ không chịu trách nhiệm về bất kỳ sự không tuân thủ hoặc chậm trễ nào do các sự kiện nằm ngoài tầm kiểm soát hợp lý của chúng tôi ("Trường hợp bất khả kháng"), bao gồm đình công, thiên tai, dịch bệnh, hoặc sự cố hạ tầng viễn thông. Các nghĩa vụ của chúng tôi sẽ được tạm dừng trong thời gian xảy ra Trường hợp bất khả kháng.
                    </p>
                </div>
            </section>

            <section className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-[#1c1c19] uppercase tracking-wide">
                    8. TRÁCH NHIỆM MUA SẢN PHẨM, TỪ BỎ, VÀ QUYỀN NGƯỜI TIÊU DÙNG
                </h3>
                <div className="flex flex-col gap-4">
                    <p>
                        <span className="font-bold text-[#1c1c19]">8.1 Trách nhiệm KO-ISAN.</span> Trách nhiệm của chúng tôi đối với bất kỳ sản phẩm nào sẽ được giới hạn nghiêm ngặt trong phạm vi giá mua sản phẩm đó.
                    </p>
                    <p>
                        <span className="font-bold text-[#1c1c19]">8.2 Miễn trừ trách nhiệm.</span> Chúng tôi không chịu trách nhiệm đối với các tổn thất gián tiếp như mất thu nhập, doanh số, lợi nhuận hoặc dữ liệu kinh doanh.
                    </p>
                    <p>
                        <span className="font-bold text-[#1c1c19]">8.3 Bảo hành.</span> Tất cả mô tả sản phẩm được cung cấp "nguyên trạng". Chúng tôi cam kết cung cấp hàng hóa phù hợp với mô tả và đáp ứng các tiêu chuẩn chất lượng thông thường.
                    </p>
                </div>
            </section>

            <section className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-[#1c1c19] uppercase tracking-wide">
                    9. LUẬT PHÁP VÀ QUYỀN TÀI PHÁN ÁP DỤNG
                </h3>
                <div className="flex flex-col gap-3">
                    <p>
                        Việc sử dụng trang web và các hợp đồng mua bán sản phẩm sẽ chịu sự điều chỉnh của luật pháp Việt Nam. Bất kỳ tranh cử nào sẽ thuộc thẩm quyền xét xử độc quyền của Tòa án Việt Nam.
                    </p>
                </div>
            </section>

            <section className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-[#1c1c19] uppercase tracking-wide">
                    10. LIÊN HỆ CHÚNG TÔI
                </h3>
                <div className="flex flex-col gap-3">
                    <p>
                        Chúng tôi hoan nghênh các câu hỏi và nhận xét của bạn. Bạn có thể liên hệ với chúng tôi theo địa chỉ: <span className="font-semibold text-[#1c1c19]">cskh.koisan@gmail.com</span> hoặc thông qua Nền tảng Dịch vụ Khách hàng.
                    </p>
                </div>
            </section>
        </div>
    );

    const renderPaymentPolicy = () => (
        <div className="flex flex-col gap-10 text-base text-[#555555] leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
            <section className="flex flex-col gap-4">
                <p>Có 02 hình thức thanh toán khi mua hàng online tại KO-ISAN:</p>
                <div className="flex flex-col gap-6 pl-4 border-l-2 border-[#eeeeee]">
                    <div>
                        <p className="font-bold text-[#1c1c19] mb-1 underline">1. Hình thức thu tiền tận nơi (COD):</p>
                        <p>Khách hàng sẽ thanh toán tiền khi nhận hàng bao gồm tiền hàng và cước phí vận chuyển cho nhân viên chuyển phát.</p>
                    </div>
                    <div>
                        <p className="font-bold text-[#1c1c19] mb-1 underline">2. Thanh toán chuyển khoản:</p>
                        <div className="bg-[#f9f9f9] p-6 rounded-sm flex flex-col gap-2">
                            <p><span className="font-semibold text-[#1c1c19]">STK:</span> 2100201341270</p>
                            <p><span className="font-semibold text-[#1c1c19]">CHỦ TÀI KHOẢN:</span> CÔNG TY TNHH KVIL VIỆT NAM</p>
                            <p><span className="font-semibold text-[#1c1c19]">NGÂN HÀNG:</span> AGRIBANK CN HẢI PHÒNG</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-[#1c1c19] uppercase tracking-wider border-b pb-2">
                    Q&A
                </h3>
                <div className="flex flex-col gap-6">
                    <div>
                        <p className="font-bold text-[#1c1c19] mb-2">1. Tôi có thể đưa thông tin chi tiết của công ty mình vào hóa đơn không?</p>
                        <p>Có. Chỉ cần nhấp vào tùy chọn doanh nghiệp trong thông tin chi tiết cá nhân rồi điền thông tin thuế mà chúng tôi yêu cầu.</p>
                    </div>
                    <div>
                        <p className="font-bold text-[#1c1c19] mb-2">2. Phí Ship như thế nào?</p>
                        <p>Các đơn hàng trong nước sẽ được nhân viên tư vấn về phí ship trước khi giao.</p>
                    </div>
                </div>
            </section>

            <section className="pt-6 border-t border-dashed">
                <p className="italic text-center text-[#1c1c19] font-medium">
                    Cảm ơn bạn đã yêu thích sản phẩm và đồng hành cùng Ko-isan! <br/>
                    Mọi thắc mắc liên quan đến chính sách thanh toán, vui lòng liên hệ <span className="font-bold underline text-rose-800">0936.982.766</span>
                </p>
            </section>
        </div>
    );

    const renderShippingPolicy = () => (
        <div className="flex flex-col gap-10 text-base text-[#555555] leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
            <section className="flex flex-col gap-4">
                <p>Các đơn hàng trong nước sẽ được nhân viên tư vấn về phí ship trước khi giao hàng, phí ship áp dụng toàn quốc theo đơn hàng:</p>
                <div className="bg-[#f9f9f9] p-6 rounded-sm border-l-4 border-[#1c1c19] flex flex-col gap-2">
                    <p>• Đơn dưới <span className="font-bold text-[#1c1c19]">500k</span>: Phí ship <span className="font-bold text-[#1c1c19]">30k</span>.</p>
                    <p>• Đơn hàng trên <span className="font-bold text-[#1c1c19]">500k</span>: <span className="font-bold text-[#1c1c19] uppercase">Miễn phí giao hàng</span>.</p>
                </div>
            </section>

            <section className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-[#1c1c19] uppercase tracking-wide">
                    PHƯƠNG THỨC THANH TOÁN VẬN CHUYỂN
                </h3>
                <div className="flex flex-col gap-4">
                    <p>Quý khách hàng vui lòng thanh toán mọi chi phí liên quan tới tiền vận chuyển theo các cách thức sau:</p>
                    <ul className="list-disc pl-5 flex flex-col gap-2">
                        <li>Thanh toán trực tiếp chi phí vận chuyển cho nhân viên vận chuyển hàng hóa.</li>
                        <li>Thanh toán chuyển khoản khi đặt hàng:</li>
                    </ul>
                    <div className="bg-[#f9f9f9] p-6 rounded-sm flex flex-col gap-2 ml-4">
                        <p><span className="font-semibold text-[#1c1c19]">STK:</span> 2100201341270</p>
                        <p><span className="font-semibold text-[#1c1c19]">CHỦ TÀI KHOẢN:</span> CÔNG TY TNHH KVIL VIỆT NAM</p>
                        <p><span className="font-semibold text-[#1c1c19]">NGÂN HÀNG:</span> AGRIBANK CN HẢI PHÒNG</p>
                    </div>
                </div>
            </section>

            <section className="flex flex-col gap-4 bg-amber-50/50 p-6 rounded-sm border border-amber-100">
                <h3 className="text-lg font-bold text-[#b45309] uppercase tracking-wide flex items-center gap-2">
                    LƯU Ý KHI NHẬN HÀNG
                </h3>
                <ul className="list-disc pl-5 flex flex-col gap-3 text-[#78350f]">
                    <li>Quý khách vui lòng kiểm tra sản phẩm ngay tại chỗ trước khi thanh toán cho nhân viên giao hàng.</li>
                    <li>Khách hàng có trách nhiệm kiểm tra hàng hoá khi nhận hàng. Nếu phát hiện hàng hoá bị lỗi lem màu, rách, hoặc sai hàng hoá, sai kích thước, sai màu sắc thì ký nhận tình trạng hàng hoá với Nhân viên giao nhận và thông báo ngay cho Bộ phận Chăm sóc khách hàng của KOISAN để xử lý.</li>
                    <li>Sau khi nhận hàng đã ký nhận mà không ghi chú hoặc có ý kiến, KOISAN không chịu trách nhiệm với những yêu cầu đổi trả vì các lỗi trên từ khách hàng sau này.</li>
                </ul>
            </section>

            <section className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-[#1c1c19] uppercase tracking-wider border-b pb-2">
                    Q&A VẬN CHUYỂN
                </h3>
                <div className="flex flex-col gap-6">
                    <div>
                        <p className="font-bold text-[#1c1c19] mb-2">Tôi có thể nhận được đơn hàng ở đâu?</p>
                        <p>Đơn hàng có thể được gửi tới địa chỉ do quý khách chọn (nhà riêng, cơ quan).</p>
                    </div>
                    <div>
                        <p className="font-bold text-[#1c1c19] mb-2">Quốc gia giao hàng có được khác với quốc gia mua hàng không?</p>
                        <p>Không. Quốc gia giao hàng phải luôn giống với quốc gia mua hàng.</p>
                    </div>
                    <div>
                        <p className="font-bold text-[#1c1c19] mb-2">Mất bao lâu thì đơn hàng của tôi sẽ đến?</p>
                        <p>Thời gian giao hàng tiêu chuẩn là từ <span className="font-semibold text-[#1c1c19]">3 đến 7 ngày làm việc</span>.</p>
                    </div>
                </div>
            </section>

            <section className="pt-6 border-t border-dashed">
                <p className="italic text-center text-[#1c1c19] font-medium">
                    Cảm ơn bạn đã yêu thích sản phẩm và đồng hành cùng Ko-isan! <br/>
                    Mọi thắc mắc liên quan đến chính sách giao nhận, vui lòng liên hệ <span className="font-bold underline text-rose-800">0936.982.766</span>
                </p>
            </section>
        </div>
    );

    const getPolicyData = () => {
        switch (path) {
            case 'chinh-sach-doi-tra':
                return {
                    title: 'CHÍNH SÁCH ĐỔI TRẢ',
                    component: renderReturnPolicy()
                };
            case 'chinh-sach-bao-mat':
                return {
                    title: 'CHÍNH SÁCH BẢO MẬT',
                    component: renderPrivacyPolicy()
                };
            case 'dieu-khoan-dich-vu':
                return {
                    title: 'ĐIỀU KHOẢN DỊCH VỤ',
                    component: renderTermsOfService()
                };
            case 'chinh-sach-thanh-toan':
                return {
                    title: 'CHÍNH SÁCH THANH TOÁN',
                    component: renderPaymentPolicy()
                };
            case 'chinh-sach-giao-nhan-van-chuyen':
                return {
                    title: 'CHÍNH SÁCH GIAO NHẬN - VẬN CHUYỂN',
                    component: renderShippingPolicy()
                };
            default:
                return {
                    title: 'THÔNG TIN',
                    content: 'Vui lòng chọn một mục từ danh mục bên trái.'
                };
        }
    };

    const { title, content, component } = getPolicyData();

    return (
        <section className="flex flex-col gap-8 pb-10">
            <h1 
                className="text-3xl md:text-4xl lg:text-5xl font-light text-[#1c1c19] leading-tight uppercase"
                style={{ fontFamily: "'Lora', serif" }}
            >
                {title}
            </h1>
            
            <div className="max-w-5xl">
                {component ? (
                    component
                ) : (
                    <p className="text-base text-[#555555] leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {content}
                    </p>
                )}
            </div>
        </section>
    );
};

export default PolicyContent;
