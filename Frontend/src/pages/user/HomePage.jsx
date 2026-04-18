import { Input } from "@/components/ui/input";
import Hero from "@/components/user/user.hero";
import BestSellers from "@/components/user/best.sellers";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import UserEditorial from "@/components/user/user.editorial";


const serif = { fontFamily: "'Noto Serif', Georgia, serif" };
const sans = { fontFamily: "'Manrope', Helvetica, sans-serif" };






const Newsletter = () => {
    const [email, setEmail] = useState("");

    return (
        <section className="w-full bg-[#f0ede9] flex flex-col items-center gap-6 px-6 md:px-20 py-24 md:py-32">
            <h2 className="text-[#1c1c19] text-3xl md:text-4xl text-center font-normal leading-snug" style={serif}>
                Hỗ trợ / Mua hàng
            </h2>
            <p className="text-[#504444] text-base text-center leading-6 max-w-lg" style={sans}>
                Đăng ký để nhận những thông tin mới nhất về các bộ sưu tập giới hạn và
                lời mời tham gia các sự kiện đặc quyền.
            </p>
            <div className="flex items-stretch gap-0 w-full max-w-2xl mt-4 border border-[#d4c2c2]/40">
                <Input
                    type="email"
                    placeholder="Địa chỉ email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-6 py-4 h-auto bg-[#f0ede9] border-none rounded-none shadow-none text-sm text-[#504444] placeholder:text-[#504444]/50 focus-visible:ring-0"
                    style={sans}
                />
                <Button
                    className="shrink-0 px-10 py-4 h-auto bg-[#1c1c19] hover:bg-[#2e2e2b] rounded-none text-[#fcf9f4] text-xs tracking-[1.2px]"
                    style={sans}
                    onClick={() => { }}
                >
                    ĐĂNG KÝ
                </Button>
            </div>
        </section>
    );
};

const HomePage = () => (
    <div className="relative w-full flex flex-col">
        <Hero />
        <BestSellers />
        <UserEditorial />
        <Newsletter />
    </div>
);

export default HomePage;
