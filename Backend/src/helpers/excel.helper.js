const ExcelJS = require('exceljs');

/**
 * Đọc buffer Excel và chuyển thành mảng JSON.
 * Hỗ trợ các định dạng .xlsx
 * 
 * @param {Buffer} buffer - File buffer từ multer
 * @returns {Promise<Array>} Mảng JSON chứa dữ liệu
 */
const parseExcelBuffer = async (buffer) => {
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        
        // Lấy sheet đầu tiên
        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
            throw new Error('File Excel không có dữ liệu (Worksheet rỗng)');
        }

        const data = [];
        // Đọc từ dòng số 2 (Bỏ qua header)
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Bỏ qua Header

            // Cột 1: SKU
            // Cột 2: Tên sản phẩm (Chỉ để xem, không bắt buộc)
            // Cột 3: Số lượng nhập
            // Cột 4: Giá vốn nhập
            const sku = row.getCell(1).value;
            const quantityStr = row.getCell(3).value;
            const costPriceStr = row.getCell(4).value;

            // Xử lý an toàn: Chỉ lấy những dòng có khai báo SKU
            if (sku) {
                data.push({
                    rowNumber: rowNumber,
                    sku: typeof sku === 'object' && sku.text ? sku.text.trim() : String(sku).trim(),
                    quantity: typeof quantityStr === 'object' && quantityStr.result !== undefined ? quantityStr.result : Number(quantityStr),
                    costPrice: typeof costPriceStr === 'object' && costPriceStr.result !== undefined ? costPriceStr.result : Number(costPriceStr)
                });
            }
        });

        return data;
    } catch (error) {
        console.error('>>> Lỗi parseExcelBuffer:', error);
        throw new Error('Định dạng file Excel không hợp lệ hoặc bị lỗi đọc.');
    }
};

/**
 * Tạo file mẫu (Template) dạng Buffer để gửi xuống Client
 */
const generateTemplateBuffer = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Mau_Nhap_Kho');

    worksheet.columns = [
        { header: 'MÃ SKU (*)', key: 'sku', width: 20 },
        { header: 'TÊN SẢN PHẨM (Tham khảo)', key: 'productName', width: 40 },
        { header: 'SỐ LƯỢNG NHẬP (*)', key: 'quantity', width: 25 },
        { header: 'GIÁ VỐN NHẬP (*)', key: 'costPrice', width: 25 },
    ];

    // Style cho Header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF107C41' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Thêm dòng ví dụ
    worksheet.addRow({
        sku: 'AOMUA-DEN-XL',
        productName: 'Áo thun mùa hè - Đen - XL',
        quantity: 100,
        costPrice: 150000
    });
    
    // Ghi chú hướng dẫn ở dòng 3
    const guideRow = worksheet.getRow(3);
    guideRow.getCell(1).value = 'LƯU Ý: Không sửa các cột Header có dấu (*). Chỉ điền thông tin từ dòng số 2.';
    worksheet.mergeCells('A3:D3');
    guideRow.font = { italic: true, color: { argb: 'FFFF0000' } };

    return await workbook.xlsx.writeBuffer();
};

module.exports = {
    parseExcelBuffer,
    generateTemplateBuffer
};
