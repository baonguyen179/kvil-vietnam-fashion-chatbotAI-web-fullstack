import { Link } from "react-router-dom";

const UserFooter = () => {
    return (
        <footer className="w-full bg-white text-[#504444] border-t border-[#e8e0d8] pt-12" style={{ fontFamily: "'Quicksand', sans-serif" }}>
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap');`}
            </style>

            <div className="mx-auto max-w-screen-2xl px-6 md:px-12 lg:px-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">
                    
                    <div className="flex flex-col gap-4">
                        <h3 className="text-[#1c1c19] text-base font-bold uppercase tracking-wider">Giới thiệu</h3>
                        <p className="text-sm leading-6">
                            KOISAN là trang mua sắm trực tuyến của thương hiệu thời trang Ko-isan.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h3 className="text-[#1c1c19] text-base font-bold uppercase tracking-wider">Liên kết</h3>
                        <ul className="flex flex-col gap-2 text-sm">
                            <li><Link to="/search" className="hover:text-[#785254] transition-colors">Tìm kiếm</Link></li>
                            <li><Link to="/about" className="hover:text-[#785254] transition-colors">Giới thiệu</Link></li>
                            <li><Link to="/returns" className="hover:text-[#785254] transition-colors">Chính sách đổi trả</Link></li>
                            <li><Link to="/privacy" className="hover:text-[#785254] transition-colors">Chính sách bảo mật</Link></li>
                            <li><Link to="/terms" className="hover:text-[#785254] transition-colors">Điều khoản dịch vụ</Link></li>
                            <li><Link to="/payment" className="hover:text-[#785254] transition-colors">Chính sách thanh toán</Link></li>
                            <li><Link to="/shipping" className="hover:text-[#785254] transition-colors">Chính sách giao nhận - vận chuyển</Link></li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h3 className="text-[#1c1c19] text-base font-bold uppercase tracking-wider">Thông tin liên hệ</h3>
                        <div className="flex flex-col gap-3 text-sm">
                            <p>Công ty TNHH Kvil Việt Nam - Số 274B Lạch Tray, Phường Lạch Tray, Quận Ngô Quyền, Thành phố Hải Phòng, Việt Nam</p>
                            
                            <div>
                                <p className="font-bold">Số hotline:</p>
                                <p>0225.3846.118</p>
                                <p>0888.509.638</p>
                            </div>

                            <div>
                                <p className="font-bold">Số trực:</p>
                                <p>0888.209.638</p>
                                <p>0936.514.788</p>
                                <p>0936.519.388</p>
                                <p>0936.982.766</p>
                            </div>

                            <div>
                                <p className="font-bold">Website:</p>
                                <a href="https://koisanclothes.com/" className="hover:text-[#785254] transition-colors">https://koisanclothes.com/</a>
                                <p>Kvilfashion@gmail.com</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h3 className="text-[#1c1c19] text-base font-bold uppercase tracking-wider">Fanpage</h3>
                        
                    </div>
                </div>

                <div className="border-t-[0.5px] border-[#e8e0d8] py-8 text-center">
                    <p className="text-[11px] tracking-widest uppercase text-[#9e8e8e]">
                        © {new Date().getFullYear()} KOISAN — All rights reserved
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default UserFooter;
