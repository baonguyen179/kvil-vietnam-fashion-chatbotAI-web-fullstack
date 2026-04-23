import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import userService from '@/services/userService';

const UserReturnModal = ({ isOpen, onClose, orderId, onSuccess }) => {
    const [reason, setReason] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + selectedFiles.length > 5) {
            toast.warning('Bạn chỉ có thể tải lên tối đa 5 ảnh');
            return;
        }

        const newFiles = [...selectedFiles, ...files];
        setSelectedFiles(newFiles);

        // Generate previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
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

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('reason', reason);
            selectedFiles.forEach(file => {
                formData.append('images', file);
            });

            const res = await userService.requestReturnOrder(orderId, formData);
            if (res && res.EC === 0) {
                toast.success('Gửi yêu cầu trả hàng thành công!');
                onSuccess();
                handleClose();
            } else {
                toast.error(res.EM || 'Lỗi khi gửi yêu cầu');
            }
        } catch (error) {
            toast.error('Lỗi kết nối server');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setReason('');
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
                        disabled={isSubmitting}
                        className="rounded-none bg-[#785254] hover:bg-[#5a3d3f] text-white px-8 h-11 transition-all"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : 'Gửi yêu cầu'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UserReturnModal;
