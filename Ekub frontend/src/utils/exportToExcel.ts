import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const exportToExcel = async (reportData: any) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Hagerigna Equb";
  workbook.created = new Date();

  const addStyledSheet = (sheetName: string, data: any[]) => {
    const worksheet = workbook.addWorksheet(sheetName, {
      views: [{ state: "frozen", ySplit: 1 }],
    });

    // Add title
    worksheet.mergeCells("A1:J1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "Hagerigna Equb Report";
    titleCell.font = { size: 18, bold: true, color: { argb: "FFFFFF" } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "388E3C" }, // Dark Green for the header
    };

    // Add column headers
    const headers = [
      "EQUB NAME",
      "EQUB AMOUNT",
      "USERNAME",
      "EMAIL",
      "PHONE NUMBER",
      "LOTTERY NUMBER",
      "AMOUNT",
      "APPROVED",
      "PAID ROUND",
      "PAYMENT ID",
      "TYPE",
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
    data.forEach((row) => {
      worksheet.addRow(Object.values(row));
    });

    // Add zebra striping for rows
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
              fgColor: { argb: "E8F5E9" }, // Light green for zebra striping
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

    // Adjust column widths dynamically based on content
    headers.forEach((_, index) => {
      worksheet.getColumn(index + 1).width = 20; // Adjust width as needed
    });
  };

  // Transform data
  const transformData = (data: any[], type: string) =>
    data.map((item) => ({
      equbName: item.equb?.name || "",
      equbAmount: item.equb?.equbAmount || "",
      username: item.user?.username || "",
      email: item.user?.email || "",
      phoneNumber: item.user?.phoneNumber || "",
      lotteryNumber: item.equbber?.lotteryNumber || "",
      amount: item.amount || "",
      approved: item.approved ? "Yes" : "No",
      paidRound: item.equbber?.paidRound || "",
      id: item.id || "",
      type,
    }));

  const registeringData = transformData(
    reportData.registering || [],
    "Registering"
  );
  const equbData = transformData(reportData.equb || [], "Equb");
  const lotteryData = transformData(reportData.lottery || [], "Lottery");

  // Create styled sheets for each category
  addStyledSheet("Registering", registeringData);
  addStyledSheet("Equb", equbData);
  addStyledSheet("Lottery", lotteryData);

  // Write workbook to file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `HagerignaEqubReport_${new Date().toISOString()}.xlsx`);
};
