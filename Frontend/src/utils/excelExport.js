import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Xuất dữ liệu ra file Excel với định dạng đẹp mắt (Premium Styling)
 * @param {Object} options
 * @param {string} options.fileName - Tên file Excel tải về (không cần đuôi .xlsx)
 * @param {string} options.sheetName - Tên sheet trong file Excel
 * @param {string} options.title - Tiêu đề lớn hiển thị ở đầu sheet
 * @param {Array} options.columns - Cấu hình cột [{ header: 'Tên', key: 'name', width: 20, style: { numFmt: '' } }]
 * @param {Array} options.data - Mảng dữ liệu các dòng [{ name: 'A', ... }]
 * @param {string} [options.subTitle] - Phụ đề (ví dụ: Khoảng thời gian báo cáo)
 */
export const exportToExcel = async ({
    fileName = 'bao-cao',
    sheetName = 'Báo cáo',
    title = 'BÁO CÁO KINH DOANH',
    subTitle = '',
    columns = [],
    data = []
}) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(sheetName, {
            views: [{ showGridLines: true }]
        });

        // 1. Dòng tiêu đề chính
        const titleRow = worksheet.addRow([title]);
        worksheet.mergeCells(`A1:${String.fromCharCode(65 + columns.length - 1)}1`);
        titleRow.height = 30;
        titleRow.getCell(1).font = {
            name: 'Segoe UI',
            size: 16,
            bold: true,
            color: { argb: 'FFFFFFFF' }
        };
        titleRow.getCell(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1E3A8A' } // Sleek Dark Blue
        };
        titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // 2. Dòng phụ đề (nếu có)
        let currentRowIndex = 2;
        if (subTitle) {
            const subTitleRow = worksheet.addRow([subTitle]);
            worksheet.mergeCells(`A2:${String.fromCharCode(65 + columns.length - 1)}2`);
            subTitleRow.height = 20;
            subTitleRow.getCell(1).font = {
                name: 'Segoe UI',
                size: 10,
                italic: true,
                color: { argb: 'FF4B5563' }
            };
            subTitleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
            currentRowIndex = 3;
        }

        // Dòng trống
        worksheet.addRow([]);
        currentRowIndex += 1;

        // 3. Cấu hình tiêu đề cột (Headers)
        const headerRowIndex = currentRowIndex;
        const headerRow = worksheet.addRow(columns.map(col => col.header));
        headerRow.height = 24;

        // Định dạng header
        for (let i = 1; i <= columns.length; i++) {
            const cell = headerRow.getCell(i);
            cell.font = {
                name: 'Segoe UI',
                size: 11,
                bold: true,
                color: { argb: 'FFFFFFFF' }
            };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF3B82F6' } // Blue primary color
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
                left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
                bottom: { style: 'medium', color: { argb: 'FF1E3A8A' } },
                right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
            };
        }

        // 4. Điền dữ liệu (Data Rows)
        data.forEach((item, rowIndex) => {
            const rowData = columns.map(col => item[col.key] !== undefined ? item[col.key] : '');
            const dataRow = worksheet.addRow(rowData);
            dataRow.height = 20;

            // Định dạng mỗi cell của dòng data
            for (let i = 1; i <= columns.length; i++) {
                const cell = dataRow.getCell(i);
                const colConfig = columns[i - 1];

                // Font & Align
                cell.font = { name: 'Segoe UI', size: 10 };
                cell.alignment = colConfig.align ? { vertical: 'middle', horizontal: colConfig.align } : { vertical: 'middle' };

                // Định dạng số/tiền nếu có cấu hình style
                if (colConfig.style && colConfig.style.numFmt) {
                    cell.numFmt = colConfig.style.numFmt;
                }

                // Xen kẽ màu nền dòng chẵn lẻ (zebra-striping) để dễ nhìn
                if (rowIndex % 2 === 1) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF9FAFB' }
                    };
                }

                // Border
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                    left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                    bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                    right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
                };
            }
        });

        // 5. Tự động điều chỉnh độ rộng cột (Auto-fit Column Width)
        columns.forEach((col, index) => {
            const column = worksheet.getColumn(index + 1);
            let maxLength = col.header.length;
            data.forEach(item => {
                const val = item[col.key];
                if (val !== null && val !== undefined) {
                    let textVal = String(val);
                    // Nếu là định dạng tiền tệ vnd, độ dài biểu diễn sẽ dài hơn
                    if (col.style && col.style.numFmt && col.style.numFmt.includes('đ')) {
                        textVal = Number(val).toLocaleString('vi-VN') + 'đ';
                    }
                    if (textVal.length > maxLength) {
                        maxLength = textVal.length;
                    }
                }
            });
            column.width = Math.min(Math.max(maxLength + 4, col.width || 12), 40);
        });

        // 6. Tạo blob và lưu file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
        console.error('Error generating Excel file:', error);
    }
};

/**
 * Xuất nhiều bảng dữ liệu (Multi-sheet hoặc nhiều Table chung một Sheet)
 */
export const exportMultiTablesToExcel = async ({
    fileName = 'bao-cao-tong-hop',
    sheetName = 'Tổng hợp',
    title = 'BÁO CÁO TỔNG HỢP',
    subTitle = '',
    tables = [] // [{ title: 'Bảng 1', columns: [], data: [] }]
}) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(sheetName, {
            views: [{ showGridLines: true }]
        });

        // Tìm độ rộng tối đa để merge header chính
        let maxCols = 1;
        tables.forEach(t => {
            if (t.columns.length > maxCols) maxCols = t.columns.length;
        });

        // 1. Tiêu đề chính
        const titleRow = worksheet.addRow([title]);
        worksheet.mergeCells(`A1:${String.fromCharCode(65 + maxCols - 1)}1`);
        titleRow.height = 30;
        titleRow.getCell(1).font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
        titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF111827' } }; // Charcoal Dark
        titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };

        let currentRow = 2;
        if (subTitle) {
            const subTitleRow = worksheet.addRow([subTitle]);
            worksheet.mergeCells(`A2:${String.fromCharCode(65 + maxCols - 1)}2`);
            subTitleRow.height = 20;
            subTitleRow.getCell(1).font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF6B7280' } };
            subTitleRow.alignment = { vertical: 'middle', horizontal: 'center' };
            currentRow = 3;
        }

        // Vẽ từng bảng
        for (const table of tables) {
            worksheet.addRow([]); // Dòng trống
            currentRow++;

            // Tiêu đề bảng nhỏ
            const tableTitleRow = worksheet.addRow([table.title]);
            tableTitleRow.height = 22;
            tableTitleRow.getCell(1).font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FF2563EB' } };
            currentRow++;

            // Headers của bảng
            const headerRow = worksheet.addRow(table.columns.map(col => col.header));
            headerRow.height = 24;
            for (let i = 1; i <= table.columns.length; i++) {
                const cell = headerRow.getCell(i);
                cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4B5563' } };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
                    left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
                    bottom: { style: 'medium', color: { argb: 'FF374151' } },
                    right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
                };
            }
            currentRow++;

            // Data của bảng
            table.data.forEach((item, rIdx) => {
                const rowData = table.columns.map(col => item[col.key] !== undefined ? item[col.key] : '');
                const dataRow = worksheet.addRow(rowData);
                dataRow.height = 20;

                for (let i = 1; i <= table.columns.length; i++) {
                    const cell = dataRow.getCell(i);
                    const colConfig = table.columns[i - 1];

                    cell.font = { name: 'Segoe UI', size: 10 };
                    cell.alignment = colConfig.align ? { vertical: 'middle', horizontal: colConfig.align } : { vertical: 'middle' };

                    if (colConfig.style && colConfig.style.numFmt) {
                        cell.numFmt = colConfig.style.numFmt;
                    }

                    if (rIdx % 2 === 1) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                    }

                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                        right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
                    };
                }
                currentRow++;
            });
        }

        // Tự động căn rộng cột
        tables.forEach(table => {
            table.columns.forEach((col, cIdx) => {
                const column = worksheet.getColumn(cIdx + 1);
                let maxLength = col.header.length;
                table.data.forEach(item => {
                    const val = item[col.key];
                    if (val !== null && val !== undefined) {
                        let textVal = String(val);
                        if (col.style && col.style.numFmt && col.style.numFmt.includes('đ')) {
                            textVal = Number(val).toLocaleString('vi-VN') + 'đ';
                        }
                        if (textVal.length > maxLength) maxLength = textVal.length;
                    }
                });
                const currentWidth = column.width || 0;
                column.width = Math.min(Math.max(currentWidth, maxLength + 4, col.width || 12), 40);
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
        console.error('Error generating multi-table Excel file:', error);
    }
};
