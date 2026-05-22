import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "@/services/authService";
import { toast } from "react-toastify";
import { Eye, EyeOff, Mail, Lock, KeyRound, ChevronLeft } from "lucide-react";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập OTP & Mật khẩu mới
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Vui lòng nhập Email!");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await authService.sendOtp(email);
      if (res && res.EC === 0) {
        toast.success(res.EM || "Mã OTP đã được gửi!");
        setStep(2); // Chuyển sang bước 2
      } else {
        toast.error(res.EM || "Có lỗi xảy ra!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối đến máy chủ!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!otp || !newPassword || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ OTP và Mật khẩu mới!");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải từ 6 ký tự trở lên!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.resetPassword(email, otp, newPassword);
      if (res && res.EC === 0) {
        toast.success(res.EM || "Đổi mật khẩu thành công!");
        navigate("/login");
      } else {
        toast.error(res.EM || "Đổi mật khẩu thất bại!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối đến máy chủ!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-10">
      <Card className="w-[450px] shadow-lg">
        <CardHeader className="space-y-2 flex flex-col items-center">
          <Link to="/" className="mb-2">
            <img src="https://res.cloudinary.com/dnj77wstm/image/upload/v1776768974/logo_ozmocg.png" alt="Logo" className="h-10 w-auto object-contain" />
          </Link>
          <CardTitle className="text-2xl text-center font-bold">Quên mật khẩu</CardTitle>

          <CardDescription className="text-center">
            {step === 1 ? "Nhập email của bạn để nhận mã xác nhận (OTP)" : "Vui lòng nhập mã OTP và mật khẩu mới"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    type="email" 
                    value={email}
                    disabled
                    className="pl-10 bg-gray-100 cursor-not-allowed text-gray-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Mã xác nhận (OTP)</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <Input 
                    id="otp" 
                    type="text" 
                    placeholder="Nhập mã OTP 6 số"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <Input 
                    id="newPassword" 
                    type={showPassword ? "text" : "password"}
                    placeholder="Từ 6 ký tự trở lên"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <Input 
                    id="confirmPassword" 
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
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
                  <p className="text-sm text-red-500">Mật khẩu xác nhận không khớp!</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-0">
          <Button 
            variant="ghost" 
            asChild 
            className="w-full text-gray-500 hover:text-black"
          >
            <Link to="/" className="flex items-center gap-2">
              <ChevronLeft size={18} />
              Quay về trang chủ
            </Link>
          </Button>
          <div className="text-sm text-center text-gray-500">
            <Link to="/login" className="text-blue-600 hover:underline">
              Quay lại Đăng nhập
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
