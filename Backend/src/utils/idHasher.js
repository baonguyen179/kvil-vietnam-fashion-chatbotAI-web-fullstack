/**
 * Tiện ích mã hóa ID để bảo mật URL (ID Obfuscation)
 * Phải đồng nhất hoàn toàn với Frontend
 */

const SALT = 0x5EE7; 

const encodeId = (id) => {
    if (!id) return '';
    const numId = parseInt(id);
    if (isNaN(numId)) return id;

    const scrambled = numId ^ SALT;
    return scrambled.toString(36);
};

const decodeId = (input) => {
    if (!input) return null;
    // Nếu là số hoặc chuỗi số thuần túy (legacy ID: /products/18)
    if (!isNaN(input) && !isNaN(parseFloat(input))) {
        return parseInt(input);
    }

    // Nếu là chuỗi mã hóa (Base36: /products/ip1)
    try {
        const val = parseInt(input, 36);
        if (isNaN(val)) return null;
        return val ^ SALT;
    } catch (e) {
        return null;
    }
};

module.exports = {
    encodeId,
    decodeId
};
