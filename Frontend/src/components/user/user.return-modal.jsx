import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import userService from '@/services/userService';

const UserReturnModal = ({ isOpen, onClose, order, onSuccess }) => {
    const orderId = order?.id;
    const paymentMethod = order?.paymentMethod;
    const [reason, setReason] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // [PROACTIVE] Cleanup memory leaks khi component unmount
    useEffect(() => {
        return () => {
            previews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previews]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        
        // [PROACTIVE] Validate số lượng ảnh
        if (files.length + selectedFiles.length > 5) {
            toast.warning('Bạn chỉ có thể tải lên tối đa 5 ảnh');
            return;
        }

        // [PROACTIVE] Validate File Type & Size (Max 5MB)
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                toast.error(`'${file.name}' không phải là định dạng ảnh hợp lệ.`);
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`Ảnh '${file.name}' vượt quá dung lượng cho phép (5MB).`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        const newFiles = [...selectedFiles, ...validFiles];
        setSelectedFiles(newFiles);

        // Generate previews
        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
        
        // Reset input value to allow selecting the same file again if needed
        e.target.value = null;
    };

    const removeFile = (index) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const handleSubmit = async () => {
        if (!reason.trim()) {
            toast.error('Vui lòng nhập lý do trả hàng');
            return;
        }

        if (paymentMethod === 'COD') {
            if (!bankName) {
                toast.error('Vui lòng chọn ngân hàng nhận tiền hoàn');
                return;
            }
            if (!accountNumber.trim()) {
                toast.error('Vui lòng nhập số tài khoản ngân hàng');
                return;
            }
            if (!accountHolder.trim()) {
                toast.error('Vui lòng nhập tên chủ tài khoản ngân hàng');
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            
            let finalReason = reason.trim();
            if (paymentMethod === 'COD') {
                const bankInfo = `[Thông tin hoàn tiền: ${bankName} - ${accountNumber.trim()} - ${accountHolder.trim().toUpperCase()}]`;
                finalReason = `${bankInfo} - Lý do: ${reason.trim()}`;
            }

            formData.append('reason', finalReason);
            selectedFiles.forEach(file => {
                formData.append('images', file);
            });

            const res = await userService.requestReturnOrder(orderId, formData);
            if (res && res.EC === 0) {
                toast.success('Gửi yêu cầu trả hàng thành công!');
                onSuccess();
                handleClose();
            } else {
                toast.error(res?.EM || 'Lỗi khi gửi yêu cầu. Vui lòng thử lại.');
            }
        } catch (error) {
            // [PROACTIVE] Catch Axios Error format
            const errorMsg = error.response?.data?.EM || 'Lỗi kết nối máy chủ khi tải ảnh lên.';
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setReason('');
        setBankName('');
        setAccountNumber('');
        setAccountHolder('');
        setSelectedFiles([]);
        previews.forEach(url => URL.revokeObjectURL(url));
        setPreviews([]);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-sm">
                <DialogHeader className="p-6 bg-[#1c1c19] text-white">
                    <DialogTitle className="text-lg font-medium tracking-[1px] uppercase">
                        Yêu cầu trả hàng - Đơn #{orderId}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#504444]">
                            Lý do trả hàng <span className="text-red-500">*</span>
                        </label>
                        <Textarea 
                            placeholder="Mô tả chi tiết lý do bạn muốn trả hàng (ví dụ: Sản phẩm bị rách, sai màu, không đúng size...)"
                            className="min-h-[120px] resize-none border-[#eeeeee] focus:border-[#785254] rounded-sm text-sm"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>

                    {paymentMethod === 'COD' && (
                        <div className="space-y-4 p-4 bg-gray-50 border border-[#eeeeee] rounded-sm animate-in fade-in slide-in-from-top-2 duration-300">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#504444] border-b border-gray-200 pb-2">
                                Thông tin nhận hoàn tiền (Đơn COD)
                            </h4>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-[#666666] uppercase">
                                        Ngân hàng <span className="text-red-500">*</span>
                                    </label>
                                    <Select value={bankName} onValueChange={setBankName}>
                                        <SelectTrigger className="h-10 border-[#eeeeee] bg-white rounded-none focus:ring-0 w-full text-xs">
                                            <SelectValue placeholder="Chọn ngân hàng" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Vietcombank">Vietcombank (VCB)</SelectItem>
                                            <SelectItem value="Techcombank">Techcombank (TCB)</SelectItem>
                                            <SelectItem value="BIDV">BIDV</SelectItem>
                                            <SelectItem value="VietinBank">VietinBank (CTG)</SelectItem>
                                            <SelectItem value="MB Bank">MB Bank (MBB)</SelectItem>
                                            <SelectItem value="ACB">ACB</SelectItem>
                                            <SelectItem value="TPBank">TPBank (TPB)</SelectItem>
                                            <SelectItem value="Sacombank">Sacombank (STB)</SelectItem>
                                            <SelectItem value="VPBank">VPBank (VPB)</SelectItem>
                                            <SelectItem value="Agribank">Agribank (VBA)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-[#666666] uppercase">
                                            Số tài khoản <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            placeholder="Nhập số tài khoản"
                                            value={accountNumber}
                                            onChange={(e) => setAccountNumber(e.target.value.replace(/\s/g, ''))}
                                            className="h-10 border-[#eeeeee] bg-white focus:border-black rounded-none text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-[#666666] uppercase">
                                            Tên chủ tài khoản <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            placeholder="TÊN CHỦ TÀI KHOẢN"
                                            value={accountHolder}
                                            onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                                            className="h-10 border-[#eeeeee] bg-white focus:border-black rounded-none text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#504444] block">
                            Hình ảnh minh chứng (Tối đa 5 ảnh)
                        </label>
                        
                        <div className="grid grid-cols-4 gap-2">
                            {previews.map((url, index) => (
                                <div key={index} className="relative aspect-square border border-[#eeeeee] rounded-sm overflow-hidden bg-gray-50 group">
                                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                    <button 
                                        onClick={() => removeFile(index)}
                                        className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            
                            {selectedFiles.length < 5 && (
                                <label className="aspect-square border-2 border-dashed border-[#eeeeee] hover:border-[#785254] hover:bg-gray-50 transition-all rounded-sm flex flex-col items-center justify-center cursor-pointer gap-1 group">
                                    <Upload size={20} className="text-[#cccccc] group-hover:text-[#785254]" />
                                    <span className="text-[10px] text-[#888888]">Tải ảnh</span>
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={handleFileChange}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-sm">
                        <p className="text-[11px] text-amber-800 leading-relaxed italic">
                            * Lưu ý: Yêu cầu của bạn sẽ được đội ngũ chăm sóc khách hàng xem xét và phản hồi trong vòng 24-48h làm việc. 
                            Vui lòng giữ nguyên bao bì và nhãn mác sản phẩm.
                        </p>
                    </div>
                </div>

                <DialogFooter className="p-6 bg-gray-50 gap-3">
                    <Button 
                        variant="outline" 
                        onClick={handleClose}
                        className="rounded-none border-[#eeeeee] text-[#888888] hover:bg-white px-6 h-11"
                    >
                        Hủy
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        disabled={isSubmitting || !reason.trim()}
                        className="rounded-none bg-[#785254] hover:bg-[#5a3d3f] text-white px-8 h-11 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang tải lên...
                            </>
                        ) : 'Gửi yêu cầu'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UserReturnModal;
