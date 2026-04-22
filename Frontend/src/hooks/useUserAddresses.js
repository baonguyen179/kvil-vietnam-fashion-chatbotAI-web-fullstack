import { useState, useEffect } from 'react';
import userService from '@/services/userService';

const useUserAddresses = (isAuthenticated) => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            const fetchAddresses = async () => {
                setLoading(true);
                try {
                    const res = await userService.getUserAddresses();
                    if (res && res.EC === 0) {
                        setAddresses(res.DT);
                    } else {
                        setError(res.EM);
                    }
                } catch (err) {
                    setError("Lỗi khi tải danh sách địa chỉ.");
                } finally {
                    setLoading(false);
                }
            };
            fetchAddresses();
        }
    }, [isAuthenticated]);

    return { addresses, loading, error };
};

export default useUserAddresses;
