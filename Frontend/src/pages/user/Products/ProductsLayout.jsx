import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import categoryService from '@/services/categoryService';
import { ChevronDown, Filter, X } from 'lucide-react';

const ProductsLayout = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [categories, setCategories] = useState([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Lấy danh mục từ API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getAllCategories();
                if (response && response.EC === 0) {
                    setCategories(response.DT);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh mục:", error);
            }
        };
        fetchCategories();
    }, []);

    // Các tùy chọn Filter cố định
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const colors = [
        { name: 'Đen', hex: '#000000', value: 'Black' },
        { name: 'Trắng', hex: '#FFFFFF', value: 'White' },
        { name: 'Đỏ', hex: '#FF0000', value: 'Red' },
        { name: 'Xanh', hex: '#0000FF', value: 'Blue' },
        { name: 'Vàng', hex: '#FFFF00', value: 'Yellow' },
        { name: 'Xám', hex: '#808080', value: 'Grey' }
    ];

    // Helper: Cập nhật URL Search Params
    const updateFilter = (key, value) => {
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
        const current = searchParams.get(key);
        updateFilter(key, current === value ? null : value);
    };

    const isSelected = (key, value) => searchParams.get(key) === value;

    return (
        <div className="w-full bg-[#ffffff] min-h-screen">
            <div className="md:hidden sticky top-[64px] z-30 bg-white border-b px-4 py-3 flex justify-between items-center">
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="flex items-center gap-2 text-sm font-medium"
                >
                    <Filter size={16} />
                    BỘ LỌC
                </button>
                <div className="text-xs text-gray-500 uppercase tracking-widest">
                    Thời trang KOISAN
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
                    
                    {/* Sidebar (Desktop) / Drawer (Mobile) */}
                    <aside className={cn(
                        "md:col-span-3 lg:col-span-2 space-y-10 transition-all duration-300",
                        "fixed inset-0 z-50 bg-white p-6 overflow-y-auto md:relative md:p-0 md:z-10 md:bg-transparent",
                        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
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
                                    onClick={() => updateFilter('categoryId', null)}
                                    className={cn(
                                        "text-sm text-left transition-colors",
                                        !searchParams.get('categoryId') ? "font-bold text-[#1c1c19]" : "text-[#888888] hover:text-[#1c1c19]"
                                    )}
                                >
                                    Tất cả sản phẩm
                                </button>
                                {categories.map(cat => (
                                    <button 
                                        key={cat.id}
                                        onClick={() => updateFilter('categoryId', cat.id.toString())}
                                        className={cn(
                                            "text-sm text-left transition-colors",
                                            isSelected('categoryId', cat.id.toString()) ? "font-bold text-[#1c1c19]" : "text-[#888888] hover:text-[#1c1c19]"
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
                                        key={size}
                                        onClick={() => toggleFilter('size', size)}
                                        className={cn(
                                            "aspect-square flex items-center justify-center text-[11px] border rounded-sm transition-all",
                                            isSelected('size', size)
                                                ? "border-[#1c1c19] bg-[#1c1c19] text-white"
                                                : "border-[#eeeeee] text-[#1c1c19] hover:border-[#1c1c19]"
                                        )}
                                    >
                                        {size}
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
                                        key={color.value}
                                        onClick={() => toggleFilter('color', color.value)}
                                        title={color.name}
                                        className={cn(
                                            "w-6 h-6 rounded-full border border-[#eeeeee] relative transition-transform hover:scale-110",
                                            isSelected('color', color.value) && "ring-2 ring-offset-2 ring-[#1c1c19]"
                                        )}
                                        style={{ backgroundColor: color.hex }}
                                    >
                                        {color.value === 'White' && <div className="absolute inset-0 rounded-full border border-gray-200 pointer-events-none" />}
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
                                        value={searchParams.get('maxPrice') || 5000000}
                                        onChange={(e) => updateFilter('maxPrice', e.target.value)}
                                        className="w-full h-1 bg-[#eeeeee] rounded-lg appearance-none cursor-pointer accent-[#1c1c19]"
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
                                onClick={() => setSearchParams({})}
                                className="w-full py-3 text-[10px] font-bold uppercase tracking-widest border border-[#1c1c19] hover:bg-[#1c1c19] hover:text-white transition-colors"
                            >
                                Xóa tất cả bộ lọc
                            </button>
                        )}
                    </aside>

                    {/* Lớp phủ cho Mobile Sidebar */}
                    {isMobileMenuOpen && (
                        <div 
                            className="fixed inset-0 bg-black/40 z-40 md:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                    )}

                    {/* Vùng nội dung chính */}
                    <main className="md:col-span-9 lg:col-span-10">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ProductsLayout;
