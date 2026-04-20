import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import productService from '@/services/productService';
import ProductCard from '@/components/user/product.card';
import { 
    ChevronLeft, 
    ChevronRight, 
    LayoutGrid, 
    ListFilter, 
    Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ProductList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({
        totalItems: 0,
        totalPages: 0,
        currentPage: 1
    });
    const [isLoading, setIsLoading] = useState(true);

    const currentPage = parseInt(searchParams.get('page') || '1');
    const limit = 12;

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const sort = searchParams.get('sort') || 'newest';
                const categoryId = searchParams.get('categoryId');
                const color = searchParams.get('color');
                const size = searchParams.get('size');
                const minPrice = searchParams.get('minPrice');
                const maxPrice = searchParams.get('maxPrice');

                // Xây dựng Query String thủ công để kiểm soát tuyệt đối định dạng gửi lên Backend
                let queryParts = [];
                queryParts.push(`page=${currentPage}`);
                queryParts.push(`limit=${limit}`);
                queryParts.push(`sort=${sort}`);
                
                if (categoryId) queryParts.push(`categoryId=${categoryId}`);
                if (color) queryParts.push(`color=${color}`);
                if (size) queryParts.push(`size=${size}`);
                
                // Sử dụng định dạng basePrice>= và basePrice<= theo chuẩn AQP manual hướng dẫn
                if (minPrice) queryParts.push(`basePrice>=${minPrice}`);
                if (maxPrice) queryParts.push(`basePrice<=${maxPrice}`);

                const queryString = queryParts.join('&');
                
                // Gọi thẳng API với query string đã nối
                const response = await productService.getAllProducts(queryString);
                
                // console.log("Gửi request với Query String: ", queryString);
                // console.log("Kết quả API nhận được: ", response);

                if (response && response.EC === 0) {
                    setProducts(response.DT.products || []);
                    setPagination({
                        totalItems: response.DT.totalItems || 0,
                        totalPages: response.DT.totalPages || 0,
                        currentPage: response.DT.currentPage || 1
                    });
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách sản phẩm:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [searchParams, currentPage]);

    const handleSortChange = (value) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('sort', value);
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const handlePageChange = (newPage) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', newPage.toString());
        setSearchParams(newParams);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const totalPages = pagination.totalPages;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-light text-[#1c1c19] mb-1" style={{ fontFamily: "'Lora', serif" }}>
                        {searchParams.get('categoryName') || 'TẤT CẢ SẢN PHẨM'}
                    </h1>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">
                        Hiển thị {products.length} trên {pagination.totalItems} sản phẩm
                    </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#1c1c19] uppercase tracking-wider">
                        <span>Sắp xếp:</span>
                        <select 
                            className="bg-transparent border-none focus:ring-0 cursor-pointer pr-8"
                            value={searchParams.get('sort') || 'newest'}
                            onChange={(e) => handleSortChange(e.target.value)}
                        >
                            <option value="newest">Mới nhất</option>
                            <option value="price_asc">Giá: Thấp đến Cao</option>
                            <option value="price_desc">Giá: Cao đến Thấp</option>
                            <option value="name_asc">Tên: A-Z</option>
                        </select>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="animate-spin text-gray-400" size={40} />
                    <p className="text-sm text-gray-500 font-medium">Đang tải sản phẩm...</p>
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="py-32 text-center flex flex-col items-center gap-4 border border-dashed rounded-lg">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                        <LayoutGrid className="text-gray-300" size={32} />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Không tìm thấy sản phẩm</h3>
                        <p className="text-sm text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn</p>
                    </div>
                </div>
            )}

            {totalPages > 1 && (
                <div className="mt-16 flex justify-center items-center gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="w-10 h-10 flex items-center justify-center border border-[#eeeeee] rounded-sm disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#1c1c19] transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-2">
                        {[...Array(totalPages)].map((_, i) => {
                            const pageNum = i + 1;
                            if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={cn(
                                            "w-10 h-10 text-sm font-medium border rounded-sm transition-all",
                                            currentPage === pageNum 
                                                ? "bg-[#1c1c19] border-[#1c1c19] text-white" 
                                                : "border-[#eeeeee] text-[#1c1c19] hover:border-[#1c1c19]"
                                        )}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            }
                            if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                return <span key={pageNum} className="px-1 text-gray-400">...</span>;
                            }
                            return null;
                        })}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="w-10 h-10 flex items-center justify-center border border-[#eeeeee] rounded-sm disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#1c1c19] transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductList;
