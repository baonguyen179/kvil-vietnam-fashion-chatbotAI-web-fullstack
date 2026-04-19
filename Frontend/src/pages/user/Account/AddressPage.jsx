import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Loader2, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import userService from '@/services/userService';
import UserAddressCard from '@/components/user/user.address-card';
import UserAddressModal from '@/components/user/user.address-modal';

const AddressPage = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const res = await userService.getUserAddresses();
            if (res && res.EC === 0) {
                setAddresses(res.DT);
            } else {
                toast.error(res.EM || 'Lỗi khi lấy danh sách địa chỉ');
            }
        } catch (error) {
            console.error("Fetch addresses error:", error);
            toast.error('Lỗi hệ thống khi tải địa chỉ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleOpenAddModal = () => {
        setEditingAddress(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (address) => {
        setEditingAddress(address);
        setModalOpen(true);
    };

    const handleOnSubmit = async (formData) => {
        setSubmitLoading(true);
        try {
            let res;
            if (editingAddress) {
                res = await userService.updateUserAddress(editingAddress.id, formData);
            } else {
                res = await userService.createNewAddress(formData);
            }

            if (res && res.EC === 0) {
                toast.success(res.EM || 'Lưu địa chỉ thành công!');
                setModalOpen(false);
                fetchAddresses(); // Refresh list
            } else {
                toast.error(res.EM || 'Lưu địa chỉ thất bại');
            }
        } catch (error) {
            toast.error('Lỗi hệ thống');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;

        try {
            const res = await userService.deleteUserAddress(id);
            if (res && res.EC === 0) {
                toast.success('Xóa địa chỉ thành công!');
                fetchAddresses();
            } else {
                toast.error(res.EM || 'Xóa địa chỉ thất bại');
            }
        } catch (error) {
            toast.error('Lỗi hệ thống');
        }
    };

    const handleSetDefault = async (id) => {
        try {
            const res = await userService.setDefaultAddress(id);
            if (res && res.EC === 0) {
                toast.success('Đã đổi địa chỉ mặc định');
                fetchAddresses();
            } else {
                toast.error(res.EM || 'Đổi mặc định thất bại');
            }
        } catch (error) {
            toast.error('Lỗi hệ thống');
        }
    };

    return (
        <div className="flex flex-col gap-8 pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-medium tracking-[2px] text-[#1c1c19] uppercase" style={{ fontFamily: "'Noto Serif', Georgia, serif" }}>
                        Danh sách địa chỉ
                    </h2>
                    <p className="text-sm text-[#888888]">Quản lý thông tin nhận hàng của bạn</p>
                </div>
                
                <button
                    onClick={handleOpenAddModal}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1c1c19] text-white text-xs font-bold uppercase tracking-[2px] rounded-sm transition-all hover:bg-[#333333] active:scale-[0.98]"
                >
                    <Plus className="w-4 h-4" />
                    Thêm địa chỉ mới
                </button>
            </div>

            {/* List Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-[#785254]" />
                    <p className="text-sm text-[#888888] font-medium uppercase tracking-[1px]">Đang tải dữ liệu...</p>
                </div>
            ) : addresses.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {addresses.map((addr) => (
                        <UserAddressCard 
                            key={addr.id}
                            address={addr}
                            onEdit={handleOpenEditModal}
                            onDelete={handleDeleteAddress}
                            onSetDefault={handleSetDefault}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 px-6 border-2 border-dashed border-[#eeeeee] rounded-sm bg-[#fafafa]">
                    <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                        <MapPin className="w-8 h-8 text-[#cccccc]" />
                    </div>
                    <p className="text-sm text-[#888888] mb-1 italic">Bạn chưa có địa chỉ nhận hàng nào.</p>
                    <button 
                        onClick={handleOpenAddModal}
                        className="text-xs font-bold text-[#785254] hover:underline uppercase tracking-[1px]"
                    >
                        Tạo địa chỉ đầu tiên ngay
                    </button>
                </div>
            )}

            {/* Hint Area */}
            {!loading && addresses.length > 0 && (
                <div className="flex items-start gap-3 p-4 bg-[#f9f9f9] rounded-sm border border-[#f0f0f0]">
                    <Info className="w-4 h-4 text-[#785254] shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-5 text-[#888888]">
                        <span className="font-bold text-[#555555]">Lưu ý:</span> Bạn có thể lưu tối đa nhiều địa chỉ khác nhau. Địa chỉ mặc định sẽ được chọn tự động khi bạn tiến hành thanh toán đơn hàng.
                    </p>
                </div>
            )}

            {/* Modal */}
            <UserAddressModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleOnSubmit}
                initialData={editingAddress}
                loading={submitLoading}
            />
        </div>
    );
};

export default AddressPage;
