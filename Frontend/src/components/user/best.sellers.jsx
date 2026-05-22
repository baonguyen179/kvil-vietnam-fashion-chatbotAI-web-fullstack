import { useState, useEffect } from "react";
import productService from "@/services/productService";
import ProductCard from "@/components/user/product.card";

const serif = { fontFamily: "'Noto Serif', Georgia, serif" };
const sans = { fontFamily: "'Manrope', Helvetica, sans-serif" };

const BestSellers = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                setLoading(true);
                const response = await productService.getBestSellers(10); // Fetch 10 products
                // console.log("res best seller:", response);
                if (response && response.EC === 0) {
                    setProducts(response?.DT?.products || []);
                }
            } catch (error) {
                console.error("Failed to fetch best sellers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBestSellers();
    }, []);

    if (loading) {
        return (
            <section className="flex flex-col w-full gap-10 px-6 md:px-20 py-16 animate-pulse">
                <div className="h-10 bg-gray-100 rounded-md w-1/4 mb-4" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex flex-col gap-3">
                            <div className="aspect-2/3 bg-gray-100 rounded-sm" />
                            <div className="h-4 bg-gray-100 w-3/4" />
                            <div className="h-4 bg-gray-100 w-1/2" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (!products.length) return null;

    return (
        <section id="bo-suu-tap" className="flex flex-col w-full gap-12 px-6 md:px-20 py-20 bg-white">
            <div className="flex flex-col gap-2 border-l-4 border-[#785254] pl-5">
                <span className="text-[#785254] text-xs tracking-[4px] uppercase font-bold" style={sans}>
                    SẢN PHẨM BÁN CHẠY
                </span>
                <h2 className="text-[#1c1c19] text-2xl md:text-3xl font-normal" style={serif}>
                    Best Sellers This Season
                </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-10">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
};

export default BestSellers;
