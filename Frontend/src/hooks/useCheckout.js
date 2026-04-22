import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { clearCart } from '@/redux/slices/cartSlice';
import orderService from '@/services/orderService';
import userService from '@/services/userService';
import useLocations from '@/hooks/useLocations';
import useUserAddresses from '@/hooks/useUserAddresses';

const useCheckout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const { cartItems, totalPrice } = useSelector((state) => state.cart);

    const locationData = useLocations();
    const { addresses: savedAddresses } = useUserAddresses(isAuthenticated);

    const [formData, setFormData] = useState({
        email: user?.email || '',
        fullName: user?.fullName || '',
        phone: user?.phone || '',
        address: '',
        deliveryMethod: 'home_delivery',
        paymentMethod: 'COD',
        selectedSavedAddressId: null
    });

    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifyingSession, setIsVerifyingSession] = useState(false);
    const [isWaitingPayment, setIsWaitingPayment] = useState(false);
    const [pendingOrderId, setPendingOrderId] = useState(null);

    // Sync initial user data
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                email: prev.email || user.email || '',
                fullName: prev.fullName || user.fullName || '',
                phone: prev.phone || user.phone || ''
            }));
        }
    }, [user]);

    const shippingFee = useMemo(() => {
        if (formData.deliveryMethod === 'store_pickup') return 0;
        return totalPrice >= 500000 ? 0 : 30000;
    }, [totalPrice, formData.deliveryMethod]);

    const buildAddressString = useCallback(() => {
        if (formData.deliveryMethod === 'store_pickup') {
            return "KOISAN LẠCH TRAY: Số 274B Lạch Tray, Quận Ngô Quyền, Hải Phòng";
        }

        if (formData.selectedSavedAddressId) {
            const addr = savedAddresses.find(a => a.id.toString() === formData.selectedSavedAddressId);
            return addr ? `${addr.detailAddress}, ${addr.ward}, ${addr.province}` : "";
        }

        const provinceName = locationData.provinces.find(p => p.code.toString() === locationData.selectedProvince)?.name;
        const districtName = locationData.districts.find(d => d.code.toString() === locationData.selectedDistrict)?.name;
        const wardName = locationData.wards.find(w => w.code.toString() === locationData.selectedWard)?.name;
        
        if (!formData.address || !wardName) return "";
        return `${formData.address}, ${wardName}, ${districtName}, ${provinceName}`;
    }, [formData, locationData, savedAddresses]);

    const validateForm = useCallback(() => {
        // Senior Tip: More robust email/phone regex can be added here
        if (!formData.fullName || !formData.phone || !formData.email) {
            toast.error("Vui lòng điền đầy đủ thông tin cá nhân!");
            return false;
        }

        if (formData.deliveryMethod === 'home_delivery') {
            if (!formData.selectedSavedAddressId && (!formData.address || !locationData.selectedProvince || !locationData.selectedWard)) {
                toast.error("Vui lòng điền đầy đủ địa chỉ giao hàng!");
                return false;
            }
        }
        return true;
    }, [formData, locationData]);

    const handleSubmitOrder = useCallback(async () => {
        if (!validateForm()) return;

        const fullAddress = buildAddressString();
        if (!fullAddress) {
            toast.error("Thông tin địa chỉ không hợp lệ!");
            return;
        }

        // [SENIOR] Chuyển hướng trực tiếp trên Tab hiện tại theo yêu cầu người dùng
        if (formData.paymentMethod === 'VNPAY') {
            console.log(">>> [PAYMENT INIT] Đang khởi tạo thanh toán VNPay...");
        }


        setIsSubmitting(true);
        try {
            const orderPayload = {
                paymentMethod: formData.paymentMethod,
                deliveryMethod: formData.deliveryMethod,
                couponCode: appliedCoupon?.code || null,
                shippingAddress: fullAddress,
            };

            const isGuest = !isAuthenticated && !user?.id;
            if (isGuest) {
                orderPayload.guestInfo = { fullName: formData.fullName, phone: formData.phone, email: formData.email };
                orderPayload.items = cartItems.map(item => ({
                    variantId: item.variantId || (item.variant && item.variant.id),
                    quantity: item.quantity
                }));
            }

            // console.log(">>> [ORDER PAYLOAD]:", orderPayload);

            const res = await orderService.createOrder(orderPayload);
            
            if (res && res.EC === 0) {
                const orderId = res.DT.id;
                // console.log(">>> [ORDER CREATED SUCCESS] ID:", orderId);
                
                // [SECURITY] Save last order ID for guest verification on success page
                sessionStorage.setItem('KOISAN_LAST_ORDER_ID', orderId.toString());

                if (formData.paymentMethod === 'VNPAY') {
                    try {
                        let paymentRes;
                        if (isAuthenticated) {
                            paymentRes = await orderService.getVNPayUrl(orderId);
                        } else {
                            paymentRes = await orderService.getGuestVNPayUrl(orderId, formData.phone);
                        }

                        // console.log(">>> [VNPAY URL RES]:", paymentRes);

                        if (paymentRes && paymentRes.EC === 0 && paymentRes.DT) {
                            // console.log(">>> [REDIRECTING TO VNPAY]:", paymentRes.DT);
                            window.location.href = paymentRes.DT;
                        } else {
                            toast.warning("Tạo đơn thành công nhưng không thể kết nối cổng thanh toán.");
                            navigate(`/order-success/${orderId}`);
                        }
                    } catch (payError) {
                        console.error(">>> [PAYMENT URL ERROR]:", payError);
                        navigate(`/order-success/${orderId}`);
                    }
                } else {
                    toast.success("Đặt hàng thành công!");
                    dispatch(clearCart());
                    navigate(`/order-success/${orderId}`);
                }
            } else {
                toast.error(res.EM || "Có lỗi xảy ra khi đặt hàng");
            }
        } catch (error) {
            console.error(">>> [SUBMIT ORDER ERROR]:", error);
            if (error?.status !== 401) toast.error(error?.EM || "Lỗi server khi đặt hàng");
        } finally {
            setIsSubmitting(false);
        }

    }, [formData, appliedCoupon, cartItems, isAuthenticated, user, validateForm, buildAddressString, dispatch, navigate]);

    return {
        formData, setFormData,
        appliedCoupon, setAppliedCoupon,
        isSubmitting,
        isVerifyingSession, setIsVerifyingSession,
        isWaitingPayment, setIsWaitingPayment,
        pendingOrderId,
        shippingFee,
        totalPrice,
        cartItems,
        isAuthenticated,
        savedAddresses,
        locationData,
        handleSubmitOrder
    };
};

export default useCheckout;
