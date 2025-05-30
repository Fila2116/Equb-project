import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import Logo from "../../../assets/Logo.png";
import Loader from "../../../utils/Loader";
import ConnectionErrorPage from "../../../utils/ErrorPage";
import { fetchPaymentHistory } from "../../../store/features/admin/equb/equbSlice";
import dayjs from "dayjs";
import { DownOutlined } from "@ant-design/icons";
import {
  Button
} from "@mui/material";
import { formatCurrencyWithSymbolAfter } from "../../../utils/currencyFormatter";
import { CSVLink } from "react-csv";
import { Dropdown, Menu } from "antd";
import exportPDF, { PdfConfig } from "../../../utils/importPdf copy";
import api from "../../../utils/axios";
interface AllMembersProps {
  searchQuery: string;
  equbId: string;
  equbName: string;
  startDate: Date | null;
  endDate: Date | null;
}

function PaymentHistory({ searchQuery, equbId, equbName, startDate, endDate }: AllMembersProps) {
  const dispatch = useAppDispatch();
  const { paymentHistory, isLoading, error } = useAppSelector((state) => state.equbs);

  type TransformedPayment = {
    fullName: string;
    lotteryNumber?: string;
    stake: string;
    createdAt: string;
    round: number;
    dabit: number;
    credit: number;
    [key: string]: string | number | undefined;
  };

  type EquberNameList = {
    fullName: string;
    phoneNumber?: string;
  };
  type CompanyProfile = {
    id: string;
    country: string;
    city: string;
    address: string;
    email: string;
    tel: string;
    createdAzt: string;
    updatedAt: string;
  };

  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | undefined>();
  const [transformedPaymentHistory, setTransformedPaymentHistory] = React.useState<TransformedPayment[]>([]);
  const [equberFullName, setEquberFullName] = React.useState<EquberNameList[]>([]);

  useEffect(() => {
    dispatch(
      fetchPaymentHistory({
        search: searchQuery,
        equb: equbId,
        startDate: startDate
          ? dayjs(startDate).format("YYYY-MM-DD")
          : undefined,
        endDate: endDate ? dayjs(endDate).format("YYYY-MM-DD") : undefined,

      })
    );
  }, [dispatch, searchQuery, equbId, startDate, endDate]);


  const cellStyle: React.CSSProperties = {
    border: "1px solid #000",
    padding: "6px",
    fontSize: "12px",
  };
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const response = await api.get("/companyProfile/getCompanyProfileforHeader");
        setCompanyProfile(response.data.data.companyProfile);
      } catch (error: any) {
      }
    };

    fetchCompanyProfile();
  }, []);
  // Transform the equbs into a flat exportable format
  React.useEffect(() => {
    if (!paymentHistory?.paymentHistory) return;

    const transformed = paymentHistory.paymentHistory.map((payment) => ({
      fullName: payment.equberUser.user.fullName,
      phone: payment.equberUser.user.phoneNumber,
      lotteryNumber: payment.equberUser.equber?.lotteryNumber,
      stake: payment.equberUser.stake.toFixed(2) + "%",
      createdAt: payment.createdAt
        ? dayjs(payment.createdAt).format("MMM DD YYYY")
        : "-",
      round: payment.equberUser.paymentScoreCalculatedRound,
      dabit: payment.amount,
      credit: payment.equberUser?.calculatedPaidAmount,
    }));

    setTransformedPaymentHistory(transformed);

    // Group by fullName
    const grouped: { [key: string]: EquberNameList } = {};

    transformed.forEach((item) => {
      if (!grouped[item.fullName]) {
        grouped[item.fullName] = {
          fullName: item.fullName,
          phoneNumber: item.phone,
        };
      }
    });

    setEquberFullName(Object.values(grouped));
  }, [paymentHistory]);


  const exportAll = () => {
    const visibleColumn = [
      { key: "fullName", name: "Full Name" },
      { key: "lotteryNumber", name: "Lottery Number" },
      { key: "stake", name: "Stake" },
      { key: "createdAt", name: "Date" },
      { key: "round", name: "Round" },
      { key: "dabit", name: "Debits" },
      { key: "credit", name: "Credit" },
    ];
    const pdfConfig: PdfConfig = {
      orientation: "portrait",
      unit: "pt",
      size: "A4",
      fileName: "Lottery Management Of Hagerigna Cloud Equb",
      logoBase64: Logo,
      companyInfo: {
        country: companyProfile?.country,
        city: companyProfile?.city,
        address: companyProfile?.address,
        email: companyProfile?.email,
        tel: companyProfile?.tel,
      },
      customerInfo: {
        name: equberFullName.length == 1 ? equberFullName[0].fullName : "",
        phone: equberFullName.length == 1 ? equberFullName[0].phoneNumber : "",
        startDate: startDate
          ? dayjs(startDate).format("YYYY-MM-DD")
          : undefined,
        endDate: endDate
          ? dayjs(endDate).format("YYYY-MM-DD")
          : undefined,
        equbName: equbName


      },
      items: transformedPaymentHistory ?? [],
      visibleColumn: visibleColumn,
      totalPaid: paymentHistory?.totalPaid,
      totalReceived: paymentHistory?.totalReceived,

    };

    // Call the actual PDF export function
    exportPDF({ pdfConfig });
  };
  const execl = transformedPaymentHistory ?? [];
  const Execlheaders = [
    {
      key: "fullName",
      label: "Full Name",
    },
    {
      key: "lotteryNumber",
      label: "Lottery Number",
    },
    {
      key: "stake",
      label: "Stake",
    },
    {
      key: "createdAt",
      label: "Date",
    },
    {
      key: "round",
      label: "Round",
    },
    {
      key: "dabit",
      label: "Debits",
    },
    {
      key: "credit",
      label: "Credit",
    },
  ];
  // Dropdown menu for export options
  const menu = (
    <Menu
      items={[
        {
          key: "1",
          label: <a onClick={exportAll}>PDF</a>,
        },
        {
          key: "2",
          label: (
            <CSVLink
              filename="Payment History of Hagerigna Cloud Equb"
              title="List of Payment History"
              data={execl}
              headers={Execlheaders}
            >
              Excel
            </CSVLink>
          ),
        },

      ]}
    />
  );
  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <ConnectionErrorPage error={error} />;
  }
  return (
    <div className="min-w-full my-4 p-6 bg-gray-50 rounded-lg shadow-sm">
      {/* Title */}
      <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>
        Transaction History
      </h1>
      {/* Right: Export Button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Dropdown overlay={menu} placement="bottom" arrow={{ pointAtCenter: true }}>
          <Button
            style={{
              backgroundColor: "#149D52",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "8px",
              padding: "6px 14px",
            }}
          >
            <span className="flex items-center gap-2 bg-[#149D52] hover:bg-green-600 text-white font-bold rounded normal-case">
              Export
            </span>
            <DownOutlined style={{ fontSize: "12px" }} />
          </Button>
        </Dropdown>
      </div>

      <div className="space-y-6 mt-6">

        <div className="tab-content">

          <div
            style={{
              borderBottom: "1px solid #eee",
            }}
          >
            <div
              style={{
                flex: 1,
                gridTemplateColumns: "1fr 3fr",
                fontSize: "14px",
                color: "#333",
                lineHeight: "1.6",
                display: "inline-block"
              }}
            >
              {equbName != "" && (
                <div>

                  <div><strong>Equb:</strong> {equbName}</div>
                </div>
              )}

              {startDate != null && (
                <div><strong>Start Date:</strong> {dayjs(startDate).format("MMM DD, YYYY")}</div>
              )}
              {endDate != null && (
                <div><strong>End Date:</strong> {dayjs(endDate).format("MMM DD, YYYY")}</div>
              )}
            </div>


          </div>

          {/* Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
            <thead>
              <tr>
                {["Full Name", "Phone Number", "Lottery Number", "Stake", "Date", "Round", "Debits", "Credit"].map(header => (
                  <th key={header} style={{ border: "1px solid #000", padding: "6px", background: "#f1f1f1" }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paymentHistory && paymentHistory?.paymentHistory.length > 0 ? (
                paymentHistory?.paymentHistory?.map((e) => (
                  <tr key={e.id}>
                    <td style={cellStyle}>
                      {e.equberUser.user.fullName}
                    </td>
                    <td style={cellStyle}>
                      {e.equberUser.user.phoneNumber}
                    </td>
                    <td style={cellStyle}>
                      {e.equberUser.equber?.lotteryNumber}
                    </td>
                    <td style={cellStyle}>{
                      e.equberUser
                        ? e.equberUser.stake?.toFixed(2) + "%"
                        : ""
                    }</td>
                    <td style={cellStyle}>{
                      e.createdAt
                        ? dayjs(e.createdAt).format("MMM DD YYYY")
                        : "-"
                    }</td>
                    <td style={cellStyle}>{e.equberUser.paymentScoreCalculatedRound}</td>
                    <td style={cellStyle}>
                      {formatCurrencyWithSymbolAfter(e.amount, "ETB", "am-ET")}
                    </td>
                    <td style={cellStyle}>
                      {formatCurrencyWithSymbolAfter(e.equberUser.calculatedPaidAmount, "ETB", "am-ET")}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center text-gray-500 py-4"
                  >
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Summary Totals */}
          {/* <div style={{ marginTop: 30 }}>
            <h3>Total Paid: {formatCurrencyWithSymbolAfter(paymentHistory?.totalPaid ?? 0, "ETB", "am-ET")}</h3>

          </div>
          <div style={{ marginTop: 30 }}>
            <h3>Total Recived: {formatCurrencyWithSymbolAfter(paymentHistory?.totalReceived ?? 0, "ETB", "am-ET")}</h3>

          </div> */}



        </div>
      </div>

    </div>
  );
};

export default PaymentHistory;


