import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const generateExcelReport = async (reportData: any) => {
  if (!reportData?.data || !Array.isArray(reportData.data)) {
    console.error("Invalid report data");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "User Report";
  workbook.created = new Date();

  // Add a worksheet
  const worksheet = workbook.addWorksheet("User Report", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  // Add title
  worksheet.mergeCells("A1:N1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "User Report";
  titleCell.font = { size: 18, bold: true, color: { argb: "FFFFFF" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "388E3C" }, // Dark green for header
  };

  // Add column headers
  const headers = [
    "Transaction ID",
    "Type",
    "Amount",
    "Payment Method",
    "Round",
    "Approved",
    "State",
    "Created At",
    "Updated At",
    "Staff ID",
    "Equb ID",
    "Equb Name",
    "Equb Amount",
    "Equb Description",
    "User ID",
    "Picture",
    "Reference",
  ];

  worksheet.addRow(headers).font = { bold: true };
  worksheet.getRow(2).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "2C6E49" }, // Medium green for header cells
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Add data rows
  reportData.data.forEach((item: any) => {
    worksheet.addRow([
      item.id,
      item.type,
      item.amount,
      item.paymentMethod,
      item.round,
      item.approved ? "Yes" : "No",
      item.state,
      new Date(item.createdAt).toLocaleString(),
      new Date(item.updatedAt).toLocaleString(),
      item.staffId || "N/A",
      item.equbId,
      item.equb?.name || "N/A",
      item.equb?.equbAmount || "N/A",
      item.equb?.description || "N/A",
      item.userId,
      item.picture || "N/A",
      item.reference || "N/A",
    ]);
  });

  // Apply zebra striping and dynamic column widths
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2) {
      row.eachCell((cell) => {
        cell.alignment = { vertical: "middle", horizontal: "left" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        if (rowNumber % 2 === 0) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "E8F5E9" }, // Light green for even rows
          };
        } else {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF" }, // White for odd rows
          };
        }
      });
    }
  });

  // Adjust column widths
  headers.forEach((_, index) => {
    worksheet.getColumn(index + 1).width = 20; // Adjust width as needed
  });

  // Write workbook to file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `User_Report_${Date.now()}.xlsx`);
};

export default generateExcelReport;
