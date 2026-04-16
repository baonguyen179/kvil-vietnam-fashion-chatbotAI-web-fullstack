import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import authService from "@/services/authService";
import { toast } from "react-toastify";
import { setLoginData } from "@/redux/slices/authSlice";

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
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); // Chặn hành vi load lại trang của form mặc định
    
    if (!loginValue || !password) {
      toast.error("Vui lòng nhập đầy đủ Tài khoản và Mật khẩu!");
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

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-[400px] shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center font-bold">Đăng nhập</CardTitle>
          <CardDescription className="text-center">
            Nhập email và mật khẩu của bạn để tiếp tục
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="abc@example.com"
                value={loginValue}
                onChange={(e) => setLoginValue(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
              </div>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Quên mật khẩu?
                </Link>
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