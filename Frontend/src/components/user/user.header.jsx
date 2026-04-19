import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, User, Menu, X, Search, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
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

const navLinks = [
    { label: "TRANG CHỦ", href: "/" },
    { label: "GIỚI THIỆU", href: "/about" },
    { label: "SẢN PHẨM", href: "/collections" },
    { label: "ALBUMS", href: "#albums" },
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
            <DropdownMenu>
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
                    {user?.role === "ADMIN" && (
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
                        <img src={logo} alt="KOISAN Logo" className="h-10 w-auto object-contain" />
                    </Link>

                    <div className="flex flex-1 items-center justify-end gap-5">
                        <Button variant="ghost" size="icon" className="text-[#504444] hover:bg-[#f3ede6]">
                            <Search className="h-5 w-5" strokeWidth={1.5} />
                        </Button>
                        <Button variant="ghost" size="icon" className="relative text-[#504444] hover:bg-[#f3ede6]">
                            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#785254] text-[9px] font-semibold text-white">0</span>
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
                            <img src={logo} alt="Logo" className="h-6 w-auto object-contain" />
                        </Link>
                    </div>

                    <nav className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => {
                            const active = isLinkActive(link.label);
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#504444]">
                            <ShoppingBag className="h-4 w-4" />
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
                    {navLinks.map((link) => (
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
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default UserHeader;
