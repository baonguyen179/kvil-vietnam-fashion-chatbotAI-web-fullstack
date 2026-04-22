import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, User, Menu, X, Search, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { performLogout } from "@/redux/slices/authSlice";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import CartSheet from "./cart.sheet";
import { toggleCartDrawer } from "@/redux/slices/cartSlice";
import collectionService from "@/services/collectionService";
import { ChevronDown } from "lucide-react";

const navLinks = [
    { label: "TRANG CHỦ", href: "/" },
    { label: "GIỚI THIỆU", href: "/about" },
    { label: "SẢN PHẨM", href: "/collections" },
    { label: "BỘ SƯU TẬP", href: "#", isDropdown: true },
    { label: "LIÊN HỆ", href: "#lien-he" },
];


export const UserHeader = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { pathname } = useLocation();
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    const [activeLink, setActiveLink] = useState(navLinks[0].label);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { cartItems } = useSelector((state) => state.cart);
    const cartCount = cartItems?.length || 0;
    const [collections, setCollections] = useState([]);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const res = await collectionService.getPublicCollections();
                if (res && res.EC === 0) {
                    setCollections(res.DT || []);
                }
            } catch (error) {
                console.error(">>> Lỗi khi lấy danh sách bộ sưu tập:", error);
            }
        };
        fetchCollections();
    }, []);

    const handleLogout = async () => {
        await dispatch(performLogout());
        navigate("/login");
    };

    const UserMenu = ({ size = "base" }) => {
        const isMobile = size === "mobile";
        
        if (!isAuthenticated) {
            return (
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                        "text-[#504444] hover:bg-[#f3ede6]",
                        size === "sm" ? "h-8 w-8" : "h-9 w-9"
                    )}
                    onClick={() => navigate("/login")}
                >
                    <User className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} strokeWidth={1.5} />
                </Button>
            );
        }

        return (
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                            "text-[#504444] hover:bg-[#f3ede6]",
                            size === "sm" ? "h-8 w-8" : "h-9 w-9"
                        )}
                    >
                        <User className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} strokeWidth={1.5} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-none p-2" style={{ fontFamily: "'Lora', serif" }}>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user?.fullName || "User"}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/account")} className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Thông tin tài khoản</span>
                    </DropdownMenuItem>
                    {["SUPER_ADMIN", "SALES", "ACCOUNTANT"].includes(user?.role) && (
                        <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Trang quản trị viên</span>
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Đăng xuất</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    /* Watch scroll to shrink header */
    useEffect(() => {
        const threshold = 100;
        const onScroll = () => {
            if (window.scrollY > threshold) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Helper for active styling - can be expanded to check actual routes if needed
    const isLinkActive = (label) => activeLink === label;

    return (
        <>
            <header
                className={cn(
                    "fixed left-0 top-0 z-50 w-full bg-white transition-all duration-500",
                    scrolled ? "shadow-md" : "shadow-sm"
                )}
            >
            <div className="mx-auto w-full max-w-screen-2xl px-6 md:px-12 lg:px-20">
                
                <div 
                    className={cn(
                        "flex items-center justify-between overflow-hidden transition-all duration-500",
                        scrolled ? "h-0 opacity-0 py-0" : "h-20 opacity-100 py-4"
                    )}
                >
                    <div className="flex-1" />

                    <Link to="/" className="shrink-0 transition-opacity hover:opacity-80">
                        <img src="https://res.cloudinary.com/dnj77wstm/image/upload/v1776768974/logo_ozmocg.png" alt="KOISAN Logo" className="h-10 w-auto object-contain" />
                    </Link>

                    <div className="flex flex-1 items-center justify-end gap-5">
                        <Button variant="ghost" size="icon" className="text-[#504444] hover:bg-[#f3ede6]">
                            <Search className="h-5 w-5" strokeWidth={1.5} />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="relative text-[#504444] hover:bg-[#f3ede6]"
                            onClick={() => dispatch(toggleCartDrawer(true))}
                        >
                            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#785254] text-[9px] font-semibold text-white">
                                {cartCount}
                            </span>
                        </Button>
                        <UserMenu />
                    </div>
                </div>

                <div 
                    className={cn(
                        "flex items-center border-t border-transparent transition-all duration-500",
                        scrolled ? "h-16 justify-between border-[#e8e0d8]" : "h-14 justify-center"
                    )}
                >
                    <div 
                        className={cn(
                            "transition-all duration-500 overflow-hidden shrink-0",
                            scrolled ? "w-24 opacity-100 mr-8" : "w-0 opacity-0"
                        )}
                    >
                        <Link to="/" className="block">
                            <img src="https://res.cloudinary.com/dnj77wstm/image/upload/v1776768974/logo_ozmocg.png" alt="Logo" className="h-6 w-auto object-contain" />
                        </Link>
                    </div>

                    <nav className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => {
                            const active = isLinkActive(link.label);
                            
                            if (link.isDropdown) {
                                return (
                                    <DropdownMenu key={link.label} modal={false}>
                                        <DropdownMenuTrigger asChild>

                                            <button
                                                className={cn(
                                                    "relative text-[11px] tracking-[0.15em] uppercase font-medium transition-colors flex items-center gap-1",
                                                    active ? "text-[#785254]" : "text-[#504444] hover:text-[#785254]"
                                                )}
                                                style={{ fontFamily: "'Lora', serif" }}
                                            >
                                                {link.label}
                                                <ChevronDown className="h-3 w-3" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-56 rounded-none p-2 border-[#e8e0d8] shadow-sm" style={{ fontFamily: "'Lora', serif" }}>
                                            {collections.length > 0 ? (
                                                collections.map((item) => (
                                                    <DropdownMenuItem 
                                                        key={item.id} 
                                                        onClick={() => {
                                                            setActiveLink(link.label);
                                                            navigate(`/collections/${item.slug}`);
                                                        }}
                                                        className="cursor-pointer text-xs uppercase tracking-wider py-2 hover:bg-[#fcfaf7]"
                                                    >
                                                        {item.name}
                                                    </DropdownMenuItem>
                                                ))
                                            ) : (
                                                <DropdownMenuItem disabled className="text-xs text-gray-400">
                                                    Đang cập nhật...
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                );
                            }

                            return (
                                <Link
                                    key={link.label}
                                    to={link.href}
                                    onClick={() => setActiveLink(link.label)}
                                    className={cn(
                                        "relative text-[11px] tracking-[0.15em] uppercase font-medium transition-colors",
                                        active ? "text-[#785254]" : "text-[#504444] hover:text-[#785254]"
                                    )}
                                    style={{ fontFamily: "'Lora', serif" }}
                                >
                                    {link.label}
                                    <span 
                                        className={cn(
                                            "absolute -bottom-1 left-0 h-px bg-[#785254] transition-all duration-300",
                                            active ? "w-full" : "w-0"
                                        )} 
                                    />
                                </Link>
                            );
                        })}
                    </nav>


                    <div 
                        className={cn(
                            "flex items-center gap-4 transition-all duration-500 overflow-hidden",
                            scrolled ? "w-auto opacity-100 ml-8" : "w-0 opacity-0"
                        )}
                    >
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-[#504444] relative"
                            onClick={() => dispatch(toggleCartDrawer(true))}
                        >
                            <ShoppingBag className="h-4 w-4" />
                            <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#785254] text-[8px] font-semibold text-white">
                                {cartCount}
                            </span>
                        </Button>
                        <UserMenu size="sm" />
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="flex md:hidden h-9 w-9 text-[#504444] absolute right-6"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            <div
                className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out md:hidden bg-white border-t border-[#e8e0d8]",
                    mobileOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <nav className="flex flex-col px-10 py-6 gap-6">
                    {navLinks.map((link) => {
                        if (link.isDropdown) {
                            return (
                                <div key={link.label} className="flex flex-col gap-4">
                                    <span className="text-[12px] tracking-widest uppercase font-bold text-[#785254]">
                                        {link.label}
                                    </span>
                                    <div className="flex flex-col gap-3 pl-4 border-l border-[#e8e0d8]">
                                        {collections.map(item => (
                                            <Link
                                                key={item.id}
                                                to={`/collections/${item.slug}`}
                                                onClick={() => {
                                                    setActiveLink(link.label);
                                                    setMobileOpen(false);
                                                }}
                                                className="text-[11px] tracking-widest uppercase font-medium text-[#504444] hover:text-[#785254]"
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        }
                        return (
                            <Link
                                key={link.label}
                                to={link.href}
                                onClick={() => {
                                    setActiveLink(link.label);
                                    setMobileOpen(false);
                                }}
                                className={cn(
                                    "text-[12px] tracking-widest uppercase font-medium",
                                    isLinkActive(link.label) ? "text-[#785254]" : "text-[#504444]"
                                )}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

            </div>
            </header>
            <CartSheet />
        </>
    );
};

export default UserHeader;
