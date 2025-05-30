import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { Link } from "react-router-dom";
import Pagination from "../../layout/Pagination";
import Logo from "../../../assets/Logo.png";
import Loader from "../../../utils/Loader";
import ConnectionErrorPage from "../../../utils/ErrorPage";
import { fetchEqubClaimers } from "../../../store/features/admin/equb/equbSlice";
import dayjs from "dayjs";
import {
  Button,
} from "@mui/material";
import { CSVLink } from "react-csv";
import { Dropdown, Menu } from "antd";
import { DownOutlined } from "@ant-design/icons";
import exportPDF, { PdfConfig } from "../../../utils/importPdf";
import api from "../../../utils/axios";

interface AllMembersProps {
  searchQuery: string;
  equbId: string;
  equbName: string;
  startDate: Date | null;
  endDate: Date | null;
}

function Notifications({ searchQuery, equbId, equbName, startDate, endDate }: AllMembersProps) {
  const dispatch = useAppDispatch();
  const { Claimer, isLoading, error } = useAppSelector((state) => state.equbs);
  type TransformedPayment = {
    fullName: string;
    name?: string;
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
  const [transformedPaymentRequest, setTransformedPaymentRequest] = React.useState<TransformedPayment[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  useEffect(() => {
    dispatch(
      fetchEqubClaimers({
        search: searchQuery,
        equb: equbId,
        startDate: startDate
          ? dayjs(startDate).format("YYYY-MM-DD")
          : undefined,
        endDate: endDate ? dayjs(endDate).format("YYYY-MM-DD") : undefined,

      })
    );
  }, [dispatch, currentPage, itemsPerPage, searchQuery, equbId, startDate, endDate]);

  // Export configurations for PDF and Excel
  // Transform the equbs into a flat exportable format
  React.useEffect(() => {
    if (!currentNotifications) return;

    const transformed = currentNotifications.map((payment) => ({
      fullName: payment.user.fullName,
      name: payment.equber?.equb?.name,
      date: payment.createdAt ? dayjs(payment.createdAt).format("MMM DD YYYY")
        : "-",

    }));

    setTransformedPaymentRequest(transformed);
  }, [transformedPaymentRequest]);

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
  // Export configurations for PDF and Excel

  const exportAll = () => {
    const visibleColumn = [
      { key: "fullName", name: "Full Name" },
      { key: "name", name: "Equb" },
      { key: "date", name: "Date" },
    ];
    const pdfConfig: PdfConfig = {
      orientation: "portrait",
      unit: "pt",
      size: "A4",
      fileName: "Payment Request Of Hagerigna Cloud Equb",
      logoBase64: Logo,
      title: "Payment Request Of Hagerigna Cloud Equb",
      companyInfo: {
        country: companyProfile?.country,
        city: companyProfile?.city,
        address: companyProfile?.address,
        email: companyProfile?.email,
        tel: companyProfile?.tel,
      },

      items: transformedPaymentRequest ?? [],
      visibleColumn: visibleColumn,
    };

    // Call the actual PDF export function
    exportPDF({ pdfConfig });
  };

  const execl = transformedPaymentRequest ?? [];
  const Execlheaders = [
    {
      key: "fullName",
      label: "Full Name",
    },
    {
      key: "name",
      label: "Equb",
    },
    {
      key: "date",
      label: "Date",
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
              filename="Payment Request of Hagerigna Cloud Equb"
              title="List of Payment Request"
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


  // Pagination: Get current requests for the page
  const indexOfLastNotification = currentPage * itemsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - itemsPerPage;
  const currentNotifications = Claimer.slice(
    indexOfFirstNotification,
    indexOfLastNotification
  );

  const totalPages = Math.ceil(Claimer.length / itemsPerPage);

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to page 1 when items per page changes
  };

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
        Payment History
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


        </div>

        {currentNotifications.length ? (
          currentNotifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-white p-5 rounded-xl shadow-md border hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex justify-between items-center">
                {/* Notification Details */}
                <div className="space-y-1">
                  <p className="text-lg font-medium text-gray-800">
                    {notification.user.fullName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {notification.equber?.equb?.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Open Button */}
                <div>
                  <Link
                    to={`/dashboard/winnerrequest/${notification.equberId}`}
                    className="rounded-full px-5 py-2 text-sm font-semibold bg-green-500 text-white hover:bg-green-600 transition-all duration-300"
                  >
                    Open
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Empty State
          <div className="text-center text-gray-500">
            <svg
              className="w-20 h-20 mx-auto mb-4 text-gray-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6M4 6h16M4 6a2 2 0 012-2h12a2 2 0 012 2M4 6v12a2 2 0 002 2h12a2 2 0 002-2V6"
              />
            </svg>
            <p className="text-lg font-medium">No Request Available</p>
            <p className="text-sm text-gray-400">
              You currently don’t have any requests.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-8">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div >
  );
};

export default Notifications;
