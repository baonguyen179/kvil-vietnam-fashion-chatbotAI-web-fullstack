import { useState } from 'react';

const Hero = () => {
    const [isFirstImage, setIsFirstImage] = useState(true);

    return (
        <section 
            className="relative flex w-full aspect-3000/1110 items-center px-6 md:px-20 overflow-hidden cursor-pointer group"
            onClick={() => setIsFirstImage(!isFirstImage)}
        >
            <div 
                className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${isFirstImage ? "opacity-100" : "opacity-0"}`}
                style={{ backgroundImage: `url(https://res.cloudinary.com/dnj77wstm/image/upload/v1776768822/banner_koisan_wzmv3r.png)` }}
            />
            <div 
                className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${!isFirstImage ? "opacity-100" : "opacity-0"}`}
                style={{ backgroundImage: `url(https://res.cloudinary.com/dnj77wstm/image/upload/v1776768926/banner_koisan_2_ink3ii.jpg)` }}
            />

            <div className="absolute inset-0 bg-black/10 pointer-events-none group-hover:bg-black/5 transition-colors duration-500" />

            {/* Dòng text hướng dẫn (Giữ nguyên ở góc phải) */}
            <div className="absolute bottom-10 right-10 z-20 text-white/50 text-[10px] tracking-widest uppercase pointer-events-none">
                Click background to toggle — {isFirstImage ? "01" : "02"} / 02
            </div>

            {/* Cụm 2 dấu chấm điều hướng (Nằm giữa ở dưới cùng) */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
                {/* Chấm 1 */}
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Ngăn không cho sự kiện click lan ra ngoài thẻ section
                        setIsFirstImage(true);
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        isFirstImage 
                            ? "bg-white" // Chấm đặc khi đang ở ảnh 1
                            : "bg-transparent border-[1.5px] border-white/80 hover:border-white" // Chấm rỗng khi ở ảnh 2
                    }`}
                    aria-label="Xem ảnh 1"
                />
                {/* Chấm 2 */}
                <button
                    onClick={(e) => {
                        e.stopPropagation(); 
                        setIsFirstImage(false);
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        !isFirstImage 
                            ? "bg-white" // Chấm đặc khi đang ở ảnh 2
                            : "bg-transparent border-[1.5px] border-white/80 hover:border-white" // Chấm rỗng khi ở ảnh 1
                    }`}
                    aria-label="Xem ảnh 2"
                />
            </div>
        </section>
    );
};

export default Hero;