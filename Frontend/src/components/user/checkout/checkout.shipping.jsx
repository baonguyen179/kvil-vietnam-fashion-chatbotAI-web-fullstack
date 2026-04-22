import React, { useEffect, useState } from 'react';
import { Truck, Store, MapPin, ChevronDown } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const CheckoutShipping = ({ 
    isAuthenticated, 
    savedAddresses, 
    formData, 
    setFormData,
    locationData, // from useLocations
}) => {
    const { 
        provinces, districts, wards, 
        selectedProvince, setSelectedProvince,
        selectedDistrict, setSelectedDistrict,
        selectedWard, setSelectedWard 
    } = locationData;

    const [isManualAddress, setIsManualAddress] = useState(true);

    useEffect(() => {
        if (isAuthenticated && savedAddresses.length > 0) {
            setIsManualAddress(false);
            // Default to first address if it's the default one
            const defaultAddress = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
            handleSelectSavedAddress(defaultAddress.id.toString());
        }
    }, [isAuthenticated, savedAddresses]);

    const handleSelectSavedAddress = (id) => {
        const addr = savedAddresses.find(a => a.id.toString() === id);
        if (addr) {
            setFormData(prev => ({
                ...prev,
                fullName: addr.receiverName,
                phone: addr.phoneNumber,
                address: addr.detailAddress,
                // We'll store the names for the final payload, but dropdowns need codes
                // For now, let's just mark that we are using a saved address
                selectedSavedAddressId: id
            }));
            
            // Try to set codes in dropdowns if they match names
            // This is complex because we only have names in DB but need codes for API
            // For now, if they select a saved address, we'll keep the dropdowns as they are
            // or we could show a "Using saved address" view.
        }
    };

    return (
        <div className="space-y-12">
            {/* Contact Info */}
            <section className="space-y-6">
                <h2 className="text-2xl font-light text-[#1c1c19] font-lora">
                    Thông tin giao hàng
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <Input 
                            placeholder="Họ và tên" 
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            className="h-12 border-[#eeeeee] focus:border-black rounded-none"
                        />
                    </div>
                    <Input 
                        placeholder="Email" 
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="h-12 border-[#eeeeee] focus:border-black rounded-none"
                    />
                    <Input 
                        placeholder="Số điện thoại" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="h-12 border-[#eeeeee] focus:border-black rounded-none"
                    />
                </div>
            </section>

            {/* Delivery Method */}
            <section className="space-y-6">
                <RadioGroup 
                    value={formData.deliveryMethod} 
                    onValueChange={(val) => setFormData({...formData, deliveryMethod: val})}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    <Label
                        htmlFor="home_delivery"
                        className={cn(
                            "flex items-center justify-between p-4 border cursor-pointer transition-all",
                            formData.deliveryMethod === 'home_delivery' ? "border-black bg-gray-50" : "border-[#eeeeee]"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="home_delivery" id="home_delivery" />
                            <div className="flex flex-col gap-1">
                                <span className="font-medium">Giao tận nơi</span>
                                <span className="text-xs text-gray-500 italic">Vận chuyển đến địa chỉ của bạn</span>
                            </div>
                        </div>
                        <Truck size={20} className="text-gray-400" />
                    </Label>

                    <Label
                        htmlFor="store_pickup"
                        className={cn(
                            "flex items-center justify-between p-4 border cursor-pointer transition-all",
                            formData.deliveryMethod === 'store_pickup' ? "border-black bg-gray-50" : "border-[#eeeeee]"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="store_pickup" id="store_pickup" />
                            <div className="flex flex-col gap-1">
                                <span className="font-medium">Nhận tại cửa hàng</span>
                                <span className="text-xs text-gray-500 italic">Nhận tại showroom KOISAN</span>
                            </div>
                        </div>
                        <Store size={20} className="text-gray-400" />
                    </Label>
                </RadioGroup>

                {formData.deliveryMethod === 'home_delivery' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        {isAuthenticated && savedAddresses.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-sm font-medium">Địa chỉ đã lưu:</p>
                                <Select 
                                    onValueChange={(val) => {
                                        if (val === 'new') {
                                            setIsManualAddress(true);
                                            setFormData({...formData, selectedSavedAddressId: null});
                                        } else {
                                            setIsManualAddress(false);
                                            handleSelectSavedAddress(val);
                                        }
                                    }}
                                    defaultValue={savedAddresses.find(a => a.isDefault)?.id.toString() || savedAddresses[0]?.id.toString()}
                                >
                                    <SelectTrigger className="h-12 border-[#eeeeee] rounded-none focus:ring-0 w-full">
                                        <SelectValue placeholder="Chọn địa chỉ đã lưu" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {savedAddresses.map(addr => (
                                            <SelectItem key={addr.id} value={addr.id.toString()}>
                                                {addr.receiverName} - {addr.detailAddress}, {addr.ward}, {addr.province}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="new" className="text-blue-600 font-medium">+ Thêm địa chỉ mới</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {isManualAddress && (
                            <div className="space-y-4 pt-2 border-t border-gray-100">
                                <Input 
                                    placeholder="Địa chỉ cụ thể (Số nhà, tên đường...)" 
                                    value={formData.address}
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    className="h-12 border-[#eeeeee] focus:border-black rounded-none"
                                />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                                        <SelectTrigger className="h-12 border-[#eeeeee] rounded-none focus:ring-0">
                                            <SelectValue placeholder="Tỉnh / Thành" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {provinces.map(p => (
                                                <SelectItem key={p.code} value={p.code.toString()}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedProvince}>
                                        <SelectTrigger className="h-12 border-[#eeeeee] rounded-none focus:ring-0">
                                            <SelectValue placeholder="Quận / Huyện" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {districts.map(d => (
                                                <SelectItem key={d.code} value={d.code.toString()}>{d.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={selectedWard} onValueChange={setSelectedWard} disabled={!selectedDistrict}>
                                        <SelectTrigger className="h-12 border-[#eeeeee] rounded-none focus:ring-0">
                                            <SelectValue placeholder="Phường / Xã" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {wards.map(w => (
                                                <SelectItem key={w.code} value={w.code.toString()}>{w.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {formData.deliveryMethod === 'store_pickup' && (
                    <div className="p-4 bg-orange-50 border border-orange-100 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-sm font-bold text-orange-900 flex items-center gap-2">
                            <MapPin size={16} /> Địa điểm nhận hàng:
                        </p>
                        <p className="text-sm text-orange-800">
                            KOISAN LẠCH TRAY: Số 274B Lạch Tray, Quận Ngô Quyền, Hải Phòng
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default CheckoutShipping;
