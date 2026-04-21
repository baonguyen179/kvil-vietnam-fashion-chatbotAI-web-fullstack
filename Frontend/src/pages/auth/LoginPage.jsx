import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import authService from "@/services/authService";
import { toast } from "react-toastify";
import { setLoginData } from "@/redux/slices/authSlice";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";


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

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); // Chặn hành vi load lại trang của form mặc định
    
    if (!loginValue || !password) {
      toast.error("Vui lòng nhập đầy đủ Tài khoản và Mật khẩu!");
      return;
    }

    if (password.length < 6) {
      toast.error("Mật khẩu phải có độ dài tối thiểu 6 ký tự!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.login(loginValue, password);

      if (res && res.EC === 0) {
        dispatch(setLoginData({
          user: res.DT.user,
          access_token: res.DT.access_token
        }));
        
        toast.success(res.EM);
        navigate("/"); 
      } else {
        toast.error(res.EM); 
      }
    } catch (error) {
      toast.error("Lỗi kết nối đến máy chủ!");
    } finally {
      setIsLoading(false);
    }
  };

  // Xác thực real-time (tức thì) cho giao diện
  const isPasswordShort = password.length > 0 && password.length < 6;

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-[400px] shadow-lg">
        <CardHeader className="space-y-2 flex flex-col items-center">
          <Link to="/" className="mb-2">
            <img src="https://res.cloudinary.com/dnj77wstm/image/upload/v1776768974/logo_ozmocg.png" alt="Logo" className="h-10 w-auto object-contain" />
          </Link>
          <CardTitle className="text-2xl text-center font-bold">Chào mừng bạn trở lại</CardTitle>

          <CardDescription className="text-center">
            Nhập email và mật khẩu của bạn để tiếp tục
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="abc@example.com"
                  value={loginValue}
                  onChange={(e) => setLoginValue(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 pr-10 ${isPasswordShort ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {isPasswordShort && (
                <p className="text-sm text-red-500">
                  Mật khẩu phải có độ dài tối thiểu 6 ký tự.
                </p>
              )}

              <div className="flex items-center justify-between mt-1">
                <Link to="/" className="text-sm text-gray-500 hover:text-black flex items-center gap-1 transition-colors">
                  <ArrowLeft size={16} />
                  Quay về trang chủ
                </Link>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-500">
            Chưa có tài khoản? <a href="/register" className="text-blue-600 hover:underline">Đăng ký ngay</a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;