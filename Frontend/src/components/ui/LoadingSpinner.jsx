import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

/**
 * LoadingSpinner - Một component hiển thị hiệu ứng loading chuyên nghiệp.
 * Tích hợp "Smart Delay" (200ms) để tránh hiện tượng nhấp nháy trên kết nối nhanh.
 */
const LoadingSpinner = ({ className, fullScreen = true }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Chỉ hiển thị loading sau 200ms để tránh "flicker" cho người dùng mạng nhanh
    const timer = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center animate-in fade-in duration-500",
        fullScreen ? "fixed inset-0 z-9999 bg-white/80 backdrop-blur-sm" : "w-full py-12",
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        {/* Vòng xoay lớn - Lớp ngoài */}
        <div className="h-16 w-16 rounded-full border-2 border-[#f3ede6]" />
        
        {/* Vòng xoay chính - Accent color */}
        <div 
          className="absolute h-16 w-16 rounded-full border-t-2 border-[#785254] animate-spin" 
          style={{ animationDuration: '0.8s' }}
        />
        
        {/* Chữ hoặc Icon ở giữa (Tùy chọn) */}
        <div className="absolute text-[8px] tracking-[0.3em] font-bold text-[#504444] uppercase pointer-events-none">
          Ksn
        </div>
      </div>
      
      {/* Text thông báo nhỏ */}
      <p className="mt-6 text-[10px] tracking-[0.3em] text-[#504444] font-medium uppercase opacity-60">
        Vui lòng đợi trong giây lát...
      </p>
    </div>
  );
};

export default LoadingSpinner;
