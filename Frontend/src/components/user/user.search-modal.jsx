import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, X, Loader2, PackageSearch, ArrowRight } from "lucide-react";
import productService from '@/services/productService';
import { cn } from "@/lib/utils";

const UserSearchModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    
    // Use ref to prevent updating state if component unmounts
    const isMounted = useRef(true);
    // Use ref for debounce timer to clear it on unmount
    const debounceTimerRef = useRef(null);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setKeyword('');
            setResults([]);
            setHasSearched(false);
            setError(null);
        } else {
            // Focus input might be needed but Shadcn Dialog handles autoFocus
        }
    }, [isOpen]);

    const performSearch = useCallback(async (searchQuery) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setHasSearched(false);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const res = await productService.searchProducts(searchQuery, 1, 10);
            
            if (!isMounted.current) return; // Prevent state update if unmounted

            if (res && res.EC === 0) {
                // Assuming backend returns { DT: { products: [...] } } or { DT: [...] }
                const products = res.DT?.products || res.DT || [];
                setResults(products);
            } else {
                setError(res?.EM || "Lỗi khi tìm kiếm sản phẩm");
                setResults([]);
            }
        } catch (err) {
            if (!isMounted.current) return;
            setError("Lỗi kết nối máy chủ, vui lòng thử lại sau.");
            setResults([]);
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, []);

    // Handle input change with Debounce
    const handleInputChange = (e) => {
        const val = e.target.value;
        setKeyword(val);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            performSearch(val);
        }, 500); // 500ms throttle/debounce
    };

    const handleProductClick = (productId) => {
        onClose();
        navigate(`/products/${productId}`);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl rounded-sm top-[10%] translate-y-0" style={{ fontFamily: "'Lora', serif" }}>
                
                {/* Search Header */}
                <div className="flex items-center border-b border-[#eeeeee] px-4 py-3 bg-white">
                    <Search className="h-5 w-5 text-[#888888] mr-3" />
                    <input 
                        type="text"
                        autoFocus
                        placeholder="Tìm kiếm sản phẩm, danh mục..."
                        className="flex-1 bg-transparent border-none outline-none text-base text-[#1c1c19] placeholder:text-[#cccccc] font-sans"
                        value={keyword}
                        onChange={handleInputChange}
                    />
                    {keyword && (
                        <button 
                            onClick={() => {
                                setKeyword('');
                                setResults([]);
                                setHasSearched(false);
                                if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
                            }}
                            className="p-1 hover:bg-[#f9f9f9] rounded-full transition-colors mr-2 text-[#888888]"
                        >
                            
                        </button>
                    )}
                  
                </div>

                {/* Search Results Area */}
                <div className="bg-[#fcfaf7] max-h-[60vh] overflow-y-auto">
                    
                    {/* LOADING STATE */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 text-[#888888]">
                            <Loader2 className="h-8 w-8 animate-spin text-[#785254]" />
                            <p className="text-sm">Đang tìm kiếm...</p>
                        </div>
                    )}

                    {/* ERROR STATE */}
                    {!loading && error && (
                        <div className="flex flex-col items-center justify-center py-12 text-red-500">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* EMPTY STATE */}
                    {!loading && !error && hasSearched && results.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <div className="w-16 h-16 rounded-full bg-[#f3ede6] flex items-center justify-center text-[#785254]">
                                <PackageSearch className="h-8 w-8" />
                            </div>
                            <p className="text-[#504444] text-sm">Không tìm thấy sản phẩm nào phù hợp với "{keyword}"</p>
                        </div>
                    )}

                    {/* INITIAL STATE */}
                    {!loading && !hasSearched && !error && (
                        <div className="py-12 px-6">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#888888] mb-4">Gợi ý tìm kiếm</p>
                            <div className="flex flex-wrap gap-2 font-sans">
                                {['Áo thun', 'Quần Jean', 'Váy', 'Áo khoác'].map(term => (
                                    <button 
                                        key={term}
                                        onClick={() => {
                                            setKeyword(term);
                                            performSearch(term);
                                        }}
                                        className="px-4 py-2 bg-white border border-[#eeeeee] rounded-sm text-sm text-[#504444] hover:border-[#785254] hover:text-[#785254] transition-colors"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SUCCESS STATE */}
                    {!loading && !error && results.length > 0 && (
                        <div className="p-2">
                            <p className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#888888]">
                                Kết quả tìm kiếm ({results.length})
                            </p>
                            <div className="flex flex-col font-sans">
                                {results.map((product) => {
                                    const mainImage = product.images?.find(img => img.isMain)?.imageUrl 
                                                      || product.images?.[0]?.imageUrl 
                                                      || "https://via.placeholder.com/100";
                                    
                                    const actualPrice = product.basePrice * (1 - (product.discountPercent || 0) / 100);

                                    return (
                                        <div 
                                            key={product.id}
                                            onClick={() => handleProductClick(product.id)}
                                            className="flex items-center gap-4 p-3 hover:bg-white rounded-sm cursor-pointer transition-colors group border border-transparent hover:border-[#eeeeee]"
                                        >
                                            <div className="w-16 h-16 rounded-sm overflow-hidden bg-[#eeeeee] shrink-0">
                                                <img 
                                                    src={mainImage} 
                                                    alt={product.name} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-[#1c1c19] truncate group-hover:text-[#785254] transition-colors">
                                                    {product.name}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-sm font-bold text-[#785254]">
                                                        {formatCurrency(actualPrice)}
                                                    </span>
                                                    {product.discountPercent > 0 && (
                                                        <span className="text-xs text-[#888888] line-through">
                                                            {formatCurrency(product.basePrice)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-[#cccccc] group-hover:text-[#785254] group-hover:translate-x-1 transition-all mr-2" />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UserSearchModal;
