import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import collectionService from "@/services/collectionService";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

const serif = { fontFamily: "'Noto Serif', Georgia, serif" };
const sans = { fontFamily: "'Manrope', Helvetica, sans-serif" };

const UserEditorial = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                setLoading(true);
                const response = await collectionService.getPublicCollections();
                if (response && response.EC === 0) {
                    // Filter active collections
                    const activeCollections = (response.DT || []).filter(c => c.isActive);
                    setCollections(activeCollections);
                }
            } catch (error) {
                console.error("Failed to fetch collections for editorial:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCollections();
    }, []);

    if (loading) {
        return (
            <div className="w-full aspect-16/7 bg-gray-100 animate-pulse flex items-center justify-center">
                <div className="h-10 bg-gray-200 w-1/4 rounded-md" />
            </div>
        );
    }

    if (!collections.length) return null;

    return (
        <section className="relative w-full overflow-hidden">
            <Carousel 
                className="w-full"
                opts={{
                    align: "start",
                    loop: true,
                }}
            >
                <CarouselContent className="ml-0">
                    {collections.map((collection) => (
                        <CarouselItem key={collection.id} className="pl-0 basis-full">
                            <Link 
                                to={`/collections/${collection.slug}`} 
                                className="block relative w-full aspect-4/5 md:aspect-16/7 lg:aspect-21/9 max-h-[85vh] group cursor-pointer overflow-hidden bg-black"
                            >
                                <img
                                    src={collection.bannerUrl}
                                    alt="background blur"
                                    className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-50 scale-125"
                                    aria-hidden="true"
                                />

                                <img
                                    src={collection.bannerUrl}
                                    alt={collection.name}
                                    className="absolute inset-0 w-full h-full object-contain transition-transform duration-2000 group-hover:scale-105 z-10"
                                    loading="lazy"
                                />
                                
                                <div className="absolute inset-0 bg-black/20 transition-opacity duration-500 group-hover:bg-black/10 z-10" />
                                
                                <div className="relative z-20 h-full flex flex-col items-center justify-center gap-4 px-6 text-center text-white">
                                    <div className="flex flex-col gap-2 md:gap-3 max-w-lg md:max-w-2xl px-4">
                                        <span className="text-[10px] md:text-xs tracking-[4px] uppercase opacity-90 drop-shadow-md" style={sans}>
                                            BỘ SƯU TẬP
                                        </span>
                                        <h2
                                            className="text-3xl md:text-4xl lg:text-5xl leading-tight font-normal drop-shadow-lg"
                                            style={serif}
                                        >
                                            {collection.name}
                                        </h2>
                                    </div>
                                    <p className="mt-2 text-xs md:text-sm tracking-[3px] uppercase border-b border-white/80 pb-1 hover:opacity-100 hover:border-white opacity-80 transition-all drop-shadow-md" style={sans}>
                                        KHÁM PHÁ NGAY
                                    </p>
                                </div>
                            </Link>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                <div className="absolute bottom-10 right-20 flex gap-4 z-20">
                    <CarouselPrevious className="relative left-0 top-0 translate-y-0 bg-transparent text-white border-white hover:bg-white hover:text-black transition-all rounded-none w-12 h-12" />
                    <CarouselNext className="relative right-0 top-0 translate-y-0 bg-transparent text-white border-white hover:bg-white hover:text-black transition-all rounded-none w-12 h-12" />
                </div>
            </Carousel>
        </section>
    );
};

export default UserEditorial;
