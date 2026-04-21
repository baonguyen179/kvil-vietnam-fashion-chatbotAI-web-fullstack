/**
 * Tiện ích mã hóa ID để bảo mật URL (ID Obfuscation)
 * Giúp biến ID số (18) thành chuỗi ký tự (3j9x)
 */

const SALT = 0x5EE7; // Mã bí mật để xáo trộn (có thể thay đổi tùy ý)

/**
 * Mã hóa ID từ số sang chuỗi
 * @param {number|string} id 
 * @returns {string}
 */
export const encodeId = (id) => {
    if (!id) return '';
    const numId = parseInt(id);
    if (isNaN(numId)) return id;

    // Phép biến đổi: XOR với Salt để phá vỡ tính tuần tự
    const scrambled = numId ^ SALT;
    
    // Chuyển sang hệ cơ số 36 (0-9, a-z) cho ngắn gọn
    return scrambled.toString(36);
};

/**
 * Giải mã chuỗi về ID số ban đầu
 * @param {string} encodedStr 
 * @returns {number|null}
 */
export const decodeId = (input) => {
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
