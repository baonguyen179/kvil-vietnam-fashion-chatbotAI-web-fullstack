import React from 'react';
import { Separator } from "@/components/ui/separator";

// ============================================================================
// DATA CONSTANTS - Tách ra ngoài để dễ cập nhật sau này mà không cần sửa JSX
// ============================================================================
const CONTACT_INFO = {
    address: "Công ty TNHH Kvil Việt Nam Số 274B Lạch Tray, Phường Lạch Tray, Quận Ngô Quyền, Thành phố Hải Phòng, Việt Nam",
    email: "Kvilfashion@gmail.com",
    hotlines: ["0225.3846.118", "0888.509.638"],
    directLines: ["0888.209.638", "0936.514.788", "0936.519.388", "0936.982.766"],
    website: "https://kvilclothes.shop/",
    mapAddress: "274B Lạch Tray, Lê Chân, Hải Phòng",
};

const GOOGLE_MAP_EMBED_URL =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3726.7453543527756!2d106.6697!3d20.8568!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314a7a5f5f5f5f5f%3A0x5f5f5f5f5f5f5f5f!2s274B%20L%E1%BA%A1ch%20Tray%2C%20L%C3%AA%20Ch%C3%A2n%2C%20H%E1%BA%A3i%20Ph%C3%B2ng!5e0!3m2!1svi!2s!4v1714044600000!5m2!1svi!2s";

// ============================================================================
// SUB-COMPONENTS
// ============================================================================
/** Một hàng thông tin với nhãn và danh sách giá trị */
const InfoRow = ({ label, children }) => (
    <div className="grid grid-cols-4 gap-4 text-sm">
        <span className="text-gray-400 col-span-1 font-sans tracking-wide">{label}</span>
        <div className="col-span-3 flex flex-col gap-1">
            {children}
        </div>
    </div>
);

/** Khối địa chỉ + email xếp dọc */
const BlockInfo = ({ label, value }) => (
    <div className="flex flex-col gap-1">
        <span className="text-gray-400 text-sm font-sans tracking-wide">{label}</span>
        <span className="font-medium text-gray-900 text-sm leading-relaxed font-sans">{value}</span>
    </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const ContactPage = () => {
    return (
        <div className="min-h-screen bg-white py-12 px-6 md:px-16 lg:px-24">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-start">

                {/* ── CỘT TRÁI: BẢN ĐỒ ── */}
                <div className="w-full h-[400px] md:h-full min-h-[480px] rounded-sm overflow-hidden border border-gray-100 shadow-sm order-1 md:order-1">
                    <iframe
                        title="Bản đồ Kvil Việt Nam"
                        src={GOOGLE_MAP_EMBED_URL}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        aria-label={`Bản đồ địa chỉ ${CONTACT_INFO.mapAddress}`}
                    />
                </div>

                {/* ── CỘT PHẢI: THÔNG TIN ── */}
                <div className="order-2 md:order-2 flex flex-col gap-8">

                    {/* Tiêu đề */}
                    <div>
                        <h1
                            className="text-4xl font-bold tracking-widest text-gray-900 uppercase"
                            style={{ fontFamily: "'Lora', serif" }}
                        >
                            LIÊN HỆ
                        </h1>
                        <div className="mt-3 mb-0 w-12 border-t-4 border-gray-900" />
                    </div>

                    {/* Divider nhìn thấy rõ dưới đường kẻ heading */}
                    <Separator className="bg-gray-100" />

                    {/* Khối thông tin */}
                    <div className="flex flex-col gap-7">

                        {/* Khối 1: Địa chỉ */}
                        <BlockInfo
                            label="Địa chỉ chúng tôi"
                            value={CONTACT_INFO.address}
                        />

                        {/* Khối 2: Email */}
                        <BlockInfo
                            label="Email chúng tôi"
                            value={CONTACT_INFO.email}
                        />

                        {/* Khối 3: Hotline */}
                        <InfoRow label="Số hotline:">
                            {CONTACT_INFO.hotlines.map((phone) => (
                                <a
                                    key={phone}
                                    href={`tel:${phone.replace(/\./g, '')}`}
                                    className="text-gray-900 hover:text-[#785254] transition-colors font-medium"
                                >
                                    {phone}
                                </a>
                            ))}
                        </InfoRow>

                        {/* Khối 4: Số trực */}
                        <InfoRow label="Số trực:">
                            {CONTACT_INFO.directLines.map((phone) => (
                                <a
                                    key={phone}
                                    href={`tel:${phone.replace(/\./g, '')}`}
                                    className="text-gray-900 hover:text-[#785254] transition-colors font-medium"
                                >
                                    {phone}
                                </a>
                            ))}
                        </InfoRow>

                        {/* Khối 5: Website */}
                        <InfoRow label="Website:">
                            <a
                                href={CONTACT_INFO.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-900 underline underline-offset-2 hover:text-[#785254] transition-colors break-all"
                            >
                                {CONTACT_INFO.website}
                            </a>
                        </InfoRow>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
