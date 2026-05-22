import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useSearchParams, useParams } from 'react-router-dom';

import { cn } from '@/lib/utils';
import categoryService from '@/services/categoryService';
import colorService from '@/services/colorService';
import sizeService from '@/services/sizeService';
import { ChevronDown, Filter, X, Loader2 } from 'lucide-react';

const ProductsLayout = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [categories, setCategories] = useState([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isChildLoading, setIsChildLoading] = useState(false); // [NEW] Sync loading state
    const { slug } = useParams();

    const [sizes, setSizes] = useState([]);
    const [colors, setColors] = useState([]);

    // Lấy dữ liệu từ API
    useEffect(() => {
        const fetchFiltersData = async () => {
            try {
                const [catRes, colorRes, sizeRes] = await Promise.all([
                    categoryService.getAllCategories(),
                    colorService.getAllColors(),
                    sizeService.getAllSizes()
                ]);
                if (catRes?.EC === 0) setCategories(catRes.DT);
                if (colorRes?.EC === 0) setColors(colorRes.DT);
                if (sizeRes?.EC === 0) setSizes(sizeRes.DT);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu bộ lọc:", error);
            }
        };
        fetchFiltersData();
    }, []);

    // Helper: Cập nhật URL Search Params
    const updateFilter = (key, value) => {
        if (isChildLoading) return; // Prevent interaction during loading
        const newParams = new URLSearchParams(searchParams);
        if (value === null || value === undefined || value === '') {
            newParams.delete(key);
        } else {
            newParams.set(key, value);
        }
        newParams.set('page', '1'); // Reset về trang 1 khi lọc
        setSearchParams(newParams);
    };

    const toggleFilter = (key, value) => {
        if (isChildLoading) return;
        const current = searchParams.get(key);
        updateFilter(key, current === value ? null : value);
    };

    const isSelected = (key, value) => searchParams.get(key) === value;

    return (
        <div className="w-full bg-[#ffffff] min-h-screen">
            {!slug && (
                <div className={cn(
                    "md:hidden sticky top-[64px] z-30 bg-white border-b px-4 py-3 flex justify-between items-center transition-opacity",
                    isChildLoading && "opacity-70 pointer-events-none"
                )}>
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="flex items-center gap-2 text-sm font-medium"
                    >
                        <Filter size={16} />
                        BỘ LỌC
                    </button>
                    <div className="text-xs text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        {isChildLoading && <Loader2 size={12} className="animate-spin" />}
                        Thời trang KOISAN
                    </div>
                </div>
            )}


            <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
                    
                    {/* Sidebar (Desktop) / Drawer (Mobile) */}
                    {!slug && (
                        <aside className={cn(
                            "md:col-span-3 lg:col-span-2 space-y-10 transition-all duration-300",
                            "fixed inset-0 z-50 bg-white p-6 overflow-y-auto md:relative md:p-0 md:z-10 md:bg-transparent",
                            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                            isChildLoading && "md:opacity-40 md:pointer-events-none cursor-wait"
                        )}>
                            <div className="flex items-center justify-between md:hidden mb-8">
                                <h2 className="text-xl font-bold tracking-tight">BỘ LỌC</h2>
                                <button onClick={() => setIsMobileMenuOpen(false)}>
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Nhóm lọc: Danh mục */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-[#1c1c19]" style={{ fontFamily: "'Lora', serif" }}>
                                    Danh mục
                                </h3>
                                <div className="flex flex-col gap-3">
                                    <button 
                                        disabled={isChildLoading}
                                        onClick={() => updateFilter('categoryId', null)}
                                        className={cn(
                                            "text-sm text-left transition-colors",
                                            !searchParams.get('categoryId') ? "font-bold text-[#1c1c19]" : "text-[#888888] hover:text-[#1c1c19]",
                                            isChildLoading && "cursor-wait"
                                        )}
                                    >
                                        Tất cả sản phẩm
                                    </button>
                                    {categories.map(cat => (
                                        <button 
                                            key={cat.id}
                                            disabled={isChildLoading}
                                            onClick={() => updateFilter('categoryId', cat.id.toString())}
                                            className={cn(
                                                "text-sm text-left transition-colors",
                                                isSelected('categoryId', cat.id.toString()) ? "font-bold text-[#1c1c19]" : "text-[#888888] hover:text-[#1c1c19]",
                                                isChildLoading && "cursor-wait"
                                            )}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Nhóm lọc: Kích thước */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-[#1c1c19]" style={{ fontFamily: "'Lora', serif" }}>
                                    Kích thước
                                </h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {sizes.map(size => (
                                        <button
                                            key={size.id}
                                            disabled={isChildLoading}
                                            onClick={() => toggleFilter('sizeId', size.id.toString())}
                                            className={cn(
                                                "aspect-square flex items-center justify-center text-[11px] border rounded-sm transition-all",
                                                isSelected('sizeId', size.id.toString())
                                                    ? "border-[#1c1c19] bg-[#1c1c19] text-white"
                                                    : "border-[#eeeeee] text-[#1c1c19] hover:border-[#1c1c19]",
                                                isChildLoading && "opacity-50 cursor-wait"
                                            )}
                                            title={size.description}
                                        >
                                            {size.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-[#1c1c19]" style={{ fontFamily: "'Lora', serif" }}>
                                    Màu sắc
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {colors.map(color => (
                                        <button
                                            key={color.id}
                                            disabled={isChildLoading}
                                            onClick={() => toggleFilter('colorId', color.id.toString())}
                                            title={color.name}
                                            className={cn(
                                                "w-6 h-6 rounded-full border border-[#eeeeee] relative transition-transform hover:scale-110",
                                                isSelected('colorId', color.id.toString()) && "ring-2 ring-offset-2 ring-[#1c1c19]",
                                                isChildLoading && "opacity-50 cursor-wait"
                                            )}
                                            style={{ background: color.hexCode }}
                                        >
                                            {color.hexCode?.toLowerCase() === '#ffffff' && <div className="absolute inset-0 rounded-full border border-gray-200 pointer-events-none" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-[#1c1c19]" style={{ fontFamily: "'Lora', serif" }}>
                                    Mức giá
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between text-[11px] text-[#888888] uppercase tracking-wider">
                                            <span>100.000 đ</span>
                                            <span>5.000.000 đ</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="100000" 
                                            max="5000000" 
                                            step="100000"
                                            disabled={isChildLoading}
                                            value={searchParams.get('maxPrice') || 5000000}
                                            onChange={(e) => updateFilter('maxPrice', e.target.value)}
                                            className={cn(
                                                "w-full h-1 bg-[#eeeeee] rounded-lg appearance-none cursor-pointer accent-[#1c1c19]",
                                                isChildLoading && "opacity-50 cursor-wait"
                                            )}
                                        />
                                    </div>
                                    {searchParams.get('maxPrice') && (
                                        <p className="text-xs text-[#1c1c19]">
                                            Dưới: <span className="font-bold">{parseInt(searchParams.get('maxPrice')).toLocaleString()} đ</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {searchParams.toString() !== '' && (
                                <button 
                                    disabled={isChildLoading}
                                    onClick={() => setSearchParams({})}
                                    className={cn(
                                        "w-full py-3 text-[10px] font-bold uppercase tracking-widest border border-[#1c1c19] hover:bg-[#1c1c19] hover:text-white transition-colors",
                                        isChildLoading && "opacity-50 cursor-wait"
                                    )}
                                >
                                    Xóa tất cả bộ lọc
                                </button>
                            )}
                        </aside>
                    )}


                    {/* Lớp phủ cho Mobile Sidebar */}
                    {isMobileMenuOpen && (
                        <div 
                            className="fixed inset-0 bg-black/40 z-40 md:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                    )}

                    {/* Vùng nội dung chính */}
                    <main className={cn(
                        slug ? "md:col-span-12" : "md:col-span-9 lg:col-span-10"
                    )}>
                        <Outlet context={{ setIsChildLoading }} />
                    </main>

                </div>
            </div>
        </div>
    );
};

export default ProductsLayout;
