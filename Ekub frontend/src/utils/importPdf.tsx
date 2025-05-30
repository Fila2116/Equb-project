import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Column {
  name: string;
  key: string;
}

export interface PdfConfig {
  orientation?: "p" | "portrait" | "l" | "landscape";
  unit?: "pt" | "px" | "in" | "mm" | "cm" | "ex" | "em" | "pc";
  size?: "A1" | "A2" | "A3" | "A4";
  fileName?: string;
  total?: number;
  title?: string;
  logoBase64?: string;
  companyInfo?: {
    country?: string;
    city?: string;
    address?: string;
    email?: string;
    tel?: string;
  };

  items: Record<string, any>[];
  visibleColumn: Column[];
}


const exportPDF = async ({
  pdfConfig: config,
}: {
  pdfConfig: PdfConfig;
}) => {
  const doc = new jsPDF({
    orientation: config.orientation || "p",
    unit: config.unit || "pt",
    format: config.size || "A4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 40;
  const marginRight = 40;
  const contentWidth = pageWidth - marginLeft - marginRight;
  let currentY = 20;

  // === Header with Padding ===
  const headerPadding = 10; // Padding on all sides
  doc.setFillColor(7, 118, 57);
  doc.rect(marginLeft - 7 + headerPadding, headerPadding, contentWidth - 2 * headerPadding, 50, 'F'); // Adjusted header height for larger logo

  // Logo in header with padding adjustment and increased size
  if (config.logoBase64) {
    const logoX = marginLeft;
    const logoY = headerPadding;
    const logoWidth = 40;
    const logoHeight = 50;

    // White rectangle background
    doc.setFillColor(255, 255, 255);
    doc.rect(logoX - 3, logoY - 3, logoWidth + 6, logoHeight + 6, 'F');

    // Logo
    doc.addImage(config.logoBase64, "PNG", logoX, logoY, logoWidth, logoHeight);
  }

  // Timestamp before the title
  doc.setTextColor(255, 255, 255); // White text
  // Centered Title in header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Hagerigna Cloud Equb", marginLeft + (contentWidth / 2), headerPadding + 25, { align: "center" });
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0); // Reset to black
  currentY += 60 + headerPadding;

  // === Company and Customer Info in Two Columns ===
  const ci = config.companyInfo || {};
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Company Address & Other Information", marginLeft, currentY);


  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
 currentY += 15;
   doc.text(`Country: ${ci.country || ""}`, marginLeft, currentY); currentY += 10;
  doc.text(`City: ${ci.city || ""}`, marginLeft, currentY); currentY += 10;
  doc.text(`Address: ${ci.address || ""}`, marginLeft, currentY); currentY += 10;
  doc.text(`Email: ${ci.email || ""}`, marginLeft, currentY); currentY += 10;
  doc.text(`Tel: ${ci.tel || ""}`, marginLeft, currentY); currentY += 10;

  doc.setFontSize(10);

  currentY += 20;

  // === Transaction Info ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(config.title||"", pageWidth / 2, currentY, { align: "center" });
  currentY += 10;


  const headers = [config.visibleColumn.map((col) => col.name)];
  const data = config.items.map((row) =>
    config.visibleColumn.map((col) => row[col.key])
  );


  autoTable(doc, {
    head: headers,
    body: data,
    startY: currentY,
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
      halign: "left",
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 20;

  // === Footer ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  if(config.total){
  doc.text(`Total Equb Amount : ${Number(config.total).toFixed(2)}`, marginLeft, currentY, { align: "left" });
  }

  currentY += 20;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  currentY += 25;
  doc.setFontSize(8);
  const currentYear = new Date().getFullYear();
  doc.text(`© ${currentYear} Hagerigna Cloud Equb . All rights reserved.`, pageWidth / 2, currentY, { align: "center" });

  // Save the PDF
  doc.save(`${config.fileName || "receipt"}.pdf`);
};

export default exportPDF;