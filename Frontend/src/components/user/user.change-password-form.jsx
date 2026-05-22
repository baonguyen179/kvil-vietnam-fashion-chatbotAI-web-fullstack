import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import authService from "@/services/authService";

const UserChangePasswordForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client side validation
        if (!oldPassword || !newPassword || !confirmPassword) {
            toast.error("Vui lòng điền đầy đủ các trường thông tin!");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
            return;
        }

        if (newPassword === oldPassword) {
            toast.error("Mật khẩu mới không được trùng với mật khẩu cũ!");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp!");
            return;
        }

        setIsLoading(true);
        try {
            const res = await authService.changePassword(oldPassword, newPassword);
            if (res && res.EC === 0) {
                toast.success(res.EM || "Đổi mật khẩu thành công!");
                // Clear form
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                toast.error(res.EM || "Đổi mật khẩu thất bại!");
            }
        } catch (error) {
            console.error(">>> Error Change Password:", error);
            toast.error("Lỗi kết nối đến máy chủ!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl font-medium" style={{ fontFamily: "'Lora', serif" }}>
                    Thay đổi mật khẩu
                </CardTitle>
                <CardDescription>
                    Để đảm bảo an toàn, vui lòng không chia sẻ mật khẩu của bạn cho người khác.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
                    {/* Mật khẩu cũ */}
                    <div className="space-y-2">
                        <Label htmlFor="oldPassword">Mật khẩu cũ</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <Input 
                                id="oldPassword" 
                                type={showOldPassword ? "text" : "password"}
                                placeholder="Nhập mật khẩu cũ"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="pl-10 pr-10 border-[#e5e7eb] focus-visible:ring-[#785254]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Mật khẩu mới */}
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">Mật khẩu mới</Label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <Input 
                                id="newPassword" 
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Tối thiểu 6 ký tự"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="pl-10 pr-10 border-[#e5e7eb] focus-visible:ring-[#785254]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Xác nhận mật khẩu mới */}
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <Input 
                                id="confirmPassword" 
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Nhập lại mật khẩu mới"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pl-10 pr-10 border-[#e5e7eb] focus-visible:ring-[#785254]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {confirmPassword && newPassword !== confirmPassword && (
                            <p className="text-xs text-red-500">Mật khẩu xác nhận không khớp!</p>
                        )}
                    </div>

                    <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="bg-[#1c1c19] hover:bg-[#333333] text-white px-8 rounded-none transition-all duration-300"
                    >
                        {isLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default UserChangePasswordForm;
