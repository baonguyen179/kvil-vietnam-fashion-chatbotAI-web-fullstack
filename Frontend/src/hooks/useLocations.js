import { useState, useEffect } from 'react';
import axios from 'axios';

const useLocations = (initialProvince = '', initialDistrict = '', initialWard = '') => {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [selectedProvince, setSelectedProvince] = useState(initialProvince);
    const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
    const [selectedWard, setSelectedWard] = useState(initialWard);

    // Fetch Provinces
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res = await axios.get('https://provinces.open-api.vn/api/?depth=1');
                setProvinces(res.data);
            } catch (error) {
                console.error("Error fetching provinces:", error);
            }
        };
        fetchProvinces();
    }, []);

    // Fetch Districts when Province changes
    useEffect(() => {
        if (selectedProvince) {
            const fetchDistricts = async () => {
                try {
                    const res = await axios.get(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`);
                    setDistricts(res.data.districts);
                    // Don't reset if we are initializing with a value
                    if (selectedDistrict === initialDistrict && initialDistrict !== '') {
                        // Keep it
                    } else {
                        // setDistricts sets the list, but we might need to reset selection if not manual init
                    }
                } catch (error) {
                    console.error("Error fetching districts:", error);
                }
            };
            fetchDistricts();
        } else {
            setDistricts([]);
            setWards([]);
        }
    }, [selectedProvince]);

    // Fetch Wards when District changes
    useEffect(() => {
        if (selectedDistrict) {
            const fetchWards = async () => {
                try {
                    const res = await axios.get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`);
                    setWards(res.data.wards);
                } catch (error) {
                    console.error("Error fetching wards:", error);
                }
            };
            fetchWards();
        } else {
            setWards([]);
        }
    }, [selectedDistrict]);

    return {
        provinces,
        districts,
        wards,
        selectedProvince,
        setSelectedProvince,
        selectedDistrict,
        setSelectedDistrict,
        selectedWard,
        setSelectedWard,
        // Helper to set all at once (e.g. from saved address)
        setFullLocation: (p, d, w) => {
            setSelectedProvince(p);
            setSelectedDistrict(d);
            setSelectedWard(w);
        }
    };
};

export default useLocations;
