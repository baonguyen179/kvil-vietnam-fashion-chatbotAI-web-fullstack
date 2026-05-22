import React from 'react';
import { Truck, CheckCircle2 } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import vnpayLogo from '@/assets/logovnpay.png';

const CheckoutPayment = ({ paymentMethod, setPaymentMethod }) => {
    return (
        <section className="space-y-6">
            <h2 className="text-lg font-medium">Phương thức thanh toán</h2>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="border border-[#eeeeee] divide-y divide-[#eeeeee]">
                <Label
                    htmlFor="COD"
                    className={cn(
                        "flex items-center justify-between p-5 cursor-pointer transition-all",
                        paymentMethod === 'COD' ? "bg-gray-50" : "hover:bg-gray-50/50"
                    )}
                >
                    <div className="flex items-center gap-4">
                        <RadioGroupItem value="COD" id="COD" />
                        <div className="flex items-center gap-3">
                            <div className="w-[140px] h-[50px] flex items-center justify-center bg-white border border-gray-100 shadow-sm overflow-hidden p-1">
                                <Truck size={20} className="text-blue-600" />
                            </div>
                            <span className="text-sm font-medium">Thanh toán khi giao hàng (COD)</span>
                        </div>
                    </div>
                    {paymentMethod === 'COD' && <CheckCircle2 size={18} className="text-green-600" />}
                </Label>

                <Label
                    htmlFor="VNPAY"
                    className={cn(
                        "flex items-center justify-between p-5 cursor-pointer transition-all",
                        paymentMethod === 'VNPAY' ? "bg-gray-50" : "hover:bg-gray-50/50"
                    )}
                >
                    <div className="flex items-center gap-4">
                        <RadioGroupItem value="VNPAY" id="VNPAY" />
                        <div className="flex items-center gap-3">
                            <div className="w-[140px] h-[50px] flex items-center justify-center bg-white border border-gray-100 shadow-sm overflow-hidden p-1">
                                <img 
                                    src={vnpayLogo} 
                                    alt="VNPAY" 
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <span className="text-sm font-medium">Chuyển khoản qua ngân hàng (VNPAY)</span>
                        </div>
                    </div>
                    {paymentMethod === 'VNPAY' && <CheckCircle2 size={18} className="text-green-600" />}
                </Label>
            </RadioGroup>
        </section>
    );
};

export default CheckoutPayment;
