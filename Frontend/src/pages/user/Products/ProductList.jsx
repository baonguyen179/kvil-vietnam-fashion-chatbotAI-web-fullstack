import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useOutletContext } from 'react-router-dom';
import productService from '@/services/productService';
import collectionService from '@/services/collectionService';


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
    const { setIsChildLoading } = useOutletContext() || {}; // [NEW] Get setter from Layout context
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({
        totalItems: 0,
        totalPages: 0,
        currentPage: 1
    });
    const { slug } = useParams();
    const [collectionInfo, setCollectionInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);


    const currentPage = parseInt(searchParams.get('page') || '1');
    const limit = 12;

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setIsChildLoading?.(true); // Sync with parent layout
            
            try {
                if (slug) {
                    // Fetch Collection Data
                    const res = await collectionService.getCollectionBySlug(slug);
                    if (res && res.EC === 0) {
                        setCollectionInfo(res.DT);
                        setProducts(res.DT.products || []);
                        setPagination({
                            totalItems: res.DT.products?.length || 0,
                            totalPages: 1, 
                            currentPage: 1
                        });
                    }
                } else {
                    setCollectionInfo(null);
                    const sort = searchParams.get('sort') || 'newest';
                    const categoryId = searchParams.get('categoryId');
                    const colorId = searchParams.get('colorId');
                    const sizeId = searchParams.get('sizeId');
                    const minPrice = searchParams.get('minPrice');
                    const maxPrice = searchParams.get('maxPrice');

                    let queryParts = [];
                    queryParts.push(`page=${currentPage}`);
                    queryParts.push(`limit=${limit}`);
                    queryParts.push(`sort=${sort}`);
                    
                    if (categoryId) queryParts.push(`categoryId=${categoryId}`);
                    if (colorId) queryParts.push(`colorId=${colorId}`);
                    if (sizeId) queryParts.push(`sizeId=${sizeId}`);
                    
                    if (minPrice) queryParts.push(`basePrice>=${minPrice}`);
                    if (maxPrice) queryParts.push(`basePrice<=${maxPrice}`);

                    const queryString = queryParts.join('&');
                    const response = await productService.getAllProducts(queryString);
                    
                    if (response && response.EC === 0) {
                        setProducts(response.DT.products || []);
                        setPagination({
                            totalItems: response.DT.totalItems || 0,
                            totalPages: response.DT.totalPages || 0,
                            currentPage: response.DT.currentPage || 1
                        });
                    }
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
            } finally {
                setIsLoading(false);
                setIsChildLoading?.(false); // Release parent layout lock
            }
        };

        fetchData();
    }, [searchParams, currentPage, slug, setIsChildLoading]);


    const handleSortChange = (value) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('sort', value);
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const handlePageChange = (newPage) => {
        if (isLoading) return; // Prevent multiple page changes
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
                    <h1 className="text-2xl md:text-3xl font-light text-[#1c1c19] mb-1 uppercase" style={{ fontFamily: "'Lora', serif" }}>
                        {slug ? (collectionInfo?.name || 'BỘ SƯU TẬP') : (searchParams.get('categoryName') || 'TẤT CẢ SẢN PHẨM')}
                    </h1>

                    <p className="text-xs text-gray-500 uppercase tracking-widest">
                        Hiển thị {products.length} trên {pagination.totalItems} sản phẩm
                    </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#1c1c19] uppercase tracking-wider">
                        <span>Sắp xếp:</span>
                        <select 
                            className="bg-transparent border-none focus:ring-0 cursor-pointer pr-8 disabled:opacity-50"
                            value={searchParams.get('sort') || 'newest'}
                            disabled={isLoading}
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
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-widest">Đang tải sản phẩm...</p>
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12 animate-in fade-in duration-500">
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
                        disabled={currentPage === 1 || isLoading}
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
                                        disabled={isLoading}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={cn(
                                            "w-10 h-10 text-sm font-medium border rounded-sm transition-all",
                                            currentPage === pageNum 
                                                ? "bg-[#1c1c19] border-[#1c1c19] text-white" 
                                                : "border-[#eeeeee] text-[#1c1c19] hover:border-[#1c1c19]",
                                            isLoading && "opacity-50"
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
                        disabled={currentPage === totalPages || isLoading}
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
