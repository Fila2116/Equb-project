import React, { useEffect, useState } from "react";
import withMainComponent from "../../layout/withMainComponent";
import Logo from "../../../assets/Logo.png";
import Popup from "../../layout/Popup";
import ImagePay from "./ImagePage";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  fetchPayment,
  fetchExportPayment,
  clearSuccessMessage,
  updatePayment,
} from "../../../store/features/admin/Payment/PaymentSclice";
import {
  fetchAllCompanyBank,
} from "../../../store/features/admin/banks/banksSlice";

import {
  fetchAllEqub,
} from "../../../store/features/admin/equb/equbSlice";

import Pagination from "../../layout/Pagination";
import { FaWallet } from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";
import ConnectionErrorPage from "../../../utils/ErrorPage";
import { formatCurrencyWithSymbolAfter } from "../../../utils/currencyFormatter";
import Loader from "../../../utils/Loader";
import { Dropdown, Menu } from "antd";
import {
  Button,
} from "@mui/material";
import { CSVLink } from "react-csv";
import { DownOutlined } from "@ant-design/icons";
import exportPDF, { PdfConfig } from "../../../utils/importPdf";
import DatePicker from "react-datepicker";
import dayjs from "dayjs";
import api from "../../../utils/axios";

// import { MdOutlineWatchLater } from "react-icons/md";

const Payments: React.FC = ({ }) => {
  type Equb = {
    id: string;
    name: string;
    // other fields...
  };

  type EqubResponse = {
    equbs: Equb[];
    totalCount: number;
  };
  type Transformed = {
    fullName: string;
    equbName: string;
    amount: number;
  };

  const dispatch = useAppDispatch();
  const { payments, paymentExport, totalPages, isLoading, task, error, successMessage } =
    useAppSelector((state) => state.payment);

  const { companyBanks } =
    useAppSelector((state) => state.banks);
  const [showCreatePopup, setShowCreatePopup] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isApproved, setIsApproved] = useState<string>("all");
  const [photo, setPhoto] = useState("");
  const [updatedPayment, setUpdatedPayment] = useState({
    id: "",
    approved: "",
  });
  const [updatedPaymentMethod, setUpdatedPaymentMethod] = useState("all");
  // const [equbTypes, setEqubTypes] = useState("finance");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedEqub, setSelectedEqub] = useState("");
  const [selectedCompanyBank, setSelectedCompanyBank] = useState("");
  const [equbLists, setEqubLists] = useState<EqubResponse>({ equbs: [], totalCount: 0 });
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
  const [transformed, setTransformed] = React.useState<Transformed[]>([]);

  useEffect(() => {
    dispatch(
      fetchPayment({
        page: currentPage,
        limit: itemsPerPage,
        isApproved,
        search: searchQuery,
        sortBy: sortBy,
        paymentMethod: updatedPaymentMethod,
        startDate: startDate
          ? dayjs(startDate).format("YYYY-MM-DD")
          : undefined,
        endDate: endDate ? dayjs(endDate).format("YYYY-MM-DD") : undefined,
        equbId: selectedEqub,
        companyBankId: selectedCompanyBank,
      })
    );
  }, [dispatch, currentPage, itemsPerPage, isApproved, searchQuery, sortBy, updatedPaymentMethod, startDate, endDate, selectedEqub, selectedCompanyBank]);

  //Fetch payment for using export
  useEffect(() => {
    dispatch(
      fetchExportPayment({
        isApproved,
        search: searchQuery,
        sortBy: sortBy,
        paymentMethod: updatedPaymentMethod,
        startDate: startDate
          ? dayjs(startDate).format("YYYY-MM-DD")
          : undefined,
        endDate: endDate ? dayjs(endDate).format("YYYY-MM-DD") : undefined,
        equbId: selectedEqub,
        companyBankId: selectedCompanyBank,
      })
    )

  }, [dispatch,
    isApproved,
    searchQuery,
    sortBy,
    updatedPaymentMethod,
    startDate,
    endDate,
    selectedEqub,
    selectedCompanyBank]);


  useEffect(() => {
    dispatch(
      fetchAllCompanyBank() as any
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchAllEqub() as any
    );
  }, [dispatch]);


  useEffect(() => {
    const fetchEqubs = async () => {
      try {
        const response = await api.get("/equbs/getAllEqub");
        setEqubLists(response.data.data);
      } catch (error: any) {
      }
    };

    fetchEqubs();
  }, []);


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

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearSuccessMessage());
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage, dispatch]);

  const handleSubmit = (id: string, approved: string) => {
    if (id && approved)
      dispatch(
        updatePayment({
          id,
          approved,
        })
      );
  };
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    id: string
  ) => {
    const { value } = e.target;
    setUpdatedPayment({
      id,
      approved: value,
    });
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    dispatch(
      fetchPayment({
        page: currentPage,
        limit: newItemsPerPage,
        isApproved,
      }) as any
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  const handleEqubChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedEqub(event.target.value);
  };

  const handleCompanyBankChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedCompanyBank(event.target.value);
  };
  const onFilterClear = () => {
    setSearchQuery("");
    setStartDate(null);
    setEndDate(null);
    setSelectedEqub("");
    setSelectedCompanyBank("");
    setIsApproved("all");
    setUpdatedPaymentMethod("all");
  };
  // Set up print functionality
  // Transform the payments into a flat exportable format
  React.useEffect(() => {
    if (!paymentExport) return;
    const transformedPayments = paymentExport.map((payment) => ({
      fullName:
        payment?.user?.fullName ||
        payment.equberRequests?.[0]?.users?.[0]?.user?.fullName ||
        "N/A",
      equbName: payment.equb?.name || "N/A",
      amount: payment.amount,
      // approved: payment.state, // Optional formatting
    }));
    setTransformed(transformedPayments);

  }, [paymentExport]);

  const exportAll = () => {

    let totalAmount = 0;
    transformed.forEach((item) => {
      if (item.amount) {
        totalAmount = totalAmount + item.amount
      }
    });
    const visibleColumn = [
      { key: "fullName", name: "Equber Name" },
      { key: "equbName", name: "Equb" },
      { key: "amount", name: "Amount" },
      // { key: "approved", name: "Status" },
    ];

    const pdfConfig: PdfConfig = {
      orientation: "portrait",
      unit: "pt",
      size: "A4",
      fileName: "Payment Of Hagerigna Cloud Equb",
      logoBase64: Logo,
      title: "Payment Of Hagerigna Cloud Equb",
      companyInfo: {
        country: companyProfile?.country,
        city: companyProfile?.city,
        address:companyProfile?.address ,
        email: companyProfile?.email,
        tel: companyProfile?.tel,
      },

      items: transformed ?? [],
      visibleColumn: visibleColumn,
      total: totalAmount
    };

    // Call the actual PDF export function
    exportPDF({ pdfConfig });
  };


  const execl = transformed;
  const Execlheaders = [
    {
      key: "fullName",
      label: "Equber Name",
    },
    {
      key: "equbName",
      label: "Equb",
    },
    {
      key: "amount",
      label: "Amount",
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
              filename="Payment of Hagerigna Cloud Equb"
              title="List of Payment"
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

  // const paymentFilter = payments.filter((payment) => {
  //   if (updatedPaymentMethod === "all") {
  //     return payment.picture && true;
  //   }

  //   return payment.picture && payment.paymentMethod === updatedPaymentMethod;
  // });
  // console.log("paymentFilter", payments);
  if (error) {
    return <ConnectionErrorPage error={error} />;
  }
  // const handleEqubTypes = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const { value } = e.target;
  //   setEqubTypes(value);
  // };

  return (
    <div>
      <div>
        <div className="mt-4 ml-6 flex justify-between ">
          <h1 className="font-medium text-black font-poppins text-2xl leading-9 ">
            Payment
          </h1>
          {/* <button className="mr-20 bg-[#149D52] rounded-lg text-white p-2 font-inter font-medium leading-4 text-xs flex justify-center items-center my-2">
              <IoIosAdd size={20} />
              Add Branch
            </button> */}
        </div>
        <div className="p-4  rounded-sm mx-4 ">
          {successMessage && (
            <p className="text-green-500 items-center text-center">
              {successMessage}
            </p>
          )}
          <div className=" bg-white shadow-lg rounded-xl p-8 ">
            <div className="relative overflow-x-auto m-1 p-2">
              <div className="mb-6 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h2 className="font-poppins text-[22px] font-semibold leading-[33px] tracking-[-0.01em] text-left">
                    All Payment
                  </h2>
                </div>
                <div className="flex items-center justify-end w-full gap-2 mb-2 ">
                  <Button
                    className=" normal-case"
                    size="small"
                    variant="contained"
                    color="error"
                    onClick={onFilterClear}
                    sx={{ ml: 2 }} // Adds spacing between buttons
                  >
                    <div
                      className="normal-case">
                      Clear
                    </div>

                  </Button>
                  {/* export  */}
                  {/* Export dropdown: PDF, Excel, Print */}
                  <Dropdown
                    overlay={menu}
                    placement="bottom"
                    arrow={{ pointAtCenter: true }}
                  >
                    <Button size="small" variant="contained"
                      style={{ backgroundColor: "#149D52", color: "white" }}
                    >
                      <div
                        className="flex items-center gap-2 bg-[#149D52] hover:bg-green-600 text-white font-bold rounded  normal-case">
                        Export
                      </div>
                      <DownOutlined
                        translate={undefined}
                        style={{ marginLeft: "2px" }}
                      />
                    </Button>
                  </Dropdown>


                </div>
                {/* Top Row: Equb, Bank, Date (inline) */}
                <div className="flex flex-wrap gap-4 mb-4">
                  {/* Equb Dropdown */}
                  <div className="w-[150px]">
                    <select
                      id="equbId"
                      name="equbId"
                      value={selectedEqub}
                      onChange={handleEqubChange}
                      className="w-full bg-[#F9FBFF] border border-gray-300 rounded-lg py-2 px-3 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" disabled>All Equbs</option>
                      {equbLists.equbs.map((equb) => (
                        <option key={equb.id} value={equb.id}>{equb.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Bank Dropdown */}
                  <div className="w-[150px]">
                    <select
                      id="comapnyBankId"
                      name="comapnyBankId"
                      value={selectedCompanyBank}
                      onChange={handleCompanyBankChange}
                      className="w-full bg-[#F9FBFF] border border-gray-300 rounded-lg py-2 px-3 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" disabled>All Banks</option>
                      {companyBanks.map((bank) => (
                        <option key={bank.id} value={bank.id}>{bank.accountName}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date Picker */}
                  <div className="w-[180px]">
                    <DatePicker
                      selected={startDate}
                      onChange={handleDateChange}
                      startDate={startDate!}
                      endDate={endDate!}
                      selectsRange
                      className="w-full bg-white py-2 px-3 rounded-lg border border-gray-300 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholderText="Select date range"
                    />
                  </div>

                  {/* Approved Dropdown */}
                  <div className="w-[150px]">
                    <select
                      name="type"
                      id="type"
                      value={isApproved}
                      onChange={(e) => setIsApproved(e.target.value)}
                      className="w-full bg-[#F9FBFF] border border-gray-300 rounded-lg py-2 px-3 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="approved">Approved</option>
                      <option value="not_approved">Pending</option>
                    </select>
                  </div>

                  {/* Payment Method Dropdown */}
                  <div className="w-[180px] flex items-center bg-[#F9FBFF] border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
                    <FaWallet className="text-gray-400 mr-2" />
                    <select
                      name="paymentMethod"
                      id="paymentMethod"
                      value={updatedPaymentMethod}
                      onChange={(e) => setUpdatedPaymentMethod(e.target.value)}
                      className="w-full bg-transparent text-sm text-gray-700 outline-none"
                    >
                      <option value="all">All P.Method</option>
                      <option value="bankTransfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                {/* Bottom Row: Search (left) and Sort By (right) */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  {/* Search Input */}
                  <div className="w-[180px] flex items-center bg-[#F9FBFF] border border-gray-200 rounded-lg px-3 py-2 shadow-md ">
                    <AiOutlineSearch className="text-gray-500 mr-2" size={18} />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400"
                    />
                  </div>

                  {/* Sort Dropdown */}
                  <div className="w-[180px] flex items-center bg-[#F9FBFF] border border-gray-200 rounded-lg px-3 py-2 shadow-md  md:justify-end">
                    <p className="text-gray-500 text-sm mr-2">Sort by:</p>
                    <select
                      name="select"
                      id="select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent border-none text-sm text-gray-700 outline-none"
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                    </select>
                  </div>
                </div>


              </div>
              <table className="w-full text-sm text-left text-gray-800 min-h-30">
                <thead className="text-xs text-slate-500 bg-transparent">
                  <tr className=" border-b">
                    <th scope="col" className="px-6 py-3 text-xs ">
                      Equber Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs ">
                      Equb
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs ">
                      Payment Method
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs ">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs ">
                      Status
                    </th>
                    {/* <th scope="col" className="px-6 py-3 text-xs ">
                      Total
                    </th> */}
                    <th scope="col" className="px-6 py-3 text-xs ">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && task === "fetch-payments" ? (
                    <tr className="px-2 border-b border-gray-400">
                      <th colSpan={6} className="text-center">
                        <Loader />
                      </th>
                    </tr>
                  ) : (
                    <>
                      {payments.length > 0 ? (
                        payments.map((payment) => (
                          <tr
                            key={payment.id}
                            className="bg-white  border-b border-gray-200 "
                          >
                            <td
                              scope="row"
                              className="px-6 py-4 whitespace-nowrap text-xs text-gray-900  "
                            >
                              {/* 2514594 */}
                              {/* {payment.approved
                                ? payment?.user?.fullName
                                : payment.equberRequests[0]?.users[0]?.user
                                    ?.fullName} */}
                              {payment?.user?.fullName ||
                                payment.equberRequests[0]?.users[0]?.user
                                  ?.fullName}
                            </td>
                            <td className="px-4 py-2 border-b">
                              {payment.equb.name}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-xs ">
                              <p>Bank Transfer</p> <br />
                              {payment.picture && (
                                <p
                                  onClick={() => {
                                    setShowCreatePopup(true);
                                    setPhoto(payment.picture);
                                  }}
                                  className="text-[#14B400] cursor-pointer"
                                >
                                  View Receipt
                                </p>
                              )}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-xs ">
                              {formatCurrencyWithSymbolAfter(
                                Number(payment.amount!),
                                "ETB",
                                "am-ET"
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs">
                              {isLoading &&
                                task === "update-payment" &&
                                updatedPayment.id === payment.id ? (
                                <p className="text-gray-500">Updating...</p>
                              ) : (
                                <>
                                  {payment.approved ? (
                                    <p className="text-green-500 font-semibold">
                                      Approved
                                    </p>
                                  ) : (
                                    <select
                                      name="approved"
                                      id="approved"
                                      className="border border-red-100 shadow-md outline-none p-1 rounded-md transition-colors duration-200 "
                                      value={
                                        updatedPayment.id === payment.id
                                          ? updatedPayment.approved
                                          : payment.approved || ""
                                      }
                                      onChange={(e) =>
                                        handleInputChange(e, payment.id)
                                      }
                                    >
                                      <option
                                        value=""
                                        className="text-gray-400"
                                      >
                                        Pending
                                      </option>
                                      <option
                                        value="yes"
                                        className="text-green-500 font-semibold"
                                      >
                                        Approve
                                      </option>
                                      <option
                                        value="no"
                                        className="text-red-500 font-semibold"
                                      >
                                        Decline
                                      </option>
                                    </select>
                                  )}
                                </>
                              )}
                            </td>

                            <td className="text-center relative">
                              <button
                                className="px-4 py-2 rounded hover:underline text-primary "
                                disabled={
                                  updatedPayment.approved === "" ||
                                  (isLoading && task === "update-payment")
                                }
                                onClick={() =>
                                  handleSubmit(
                                    updatedPayment.id,
                                    updatedPayment.approved
                                  )
                                }
                              >
                                Save
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <>
                          <tr>
                            <th colSpan={6} className="py-6 text-center">
                              No Payment
                            </th>
                          </tr>
                        </>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemsPerPage={itemsPerPage}
            />
          </div>
          {showCreatePopup && photo && (
            <Popup title="" open={showCreatePopup} setOpen={setShowCreatePopup}>
              <ImagePay photo={photo} />
            </Popup>
          )}
        </div>
      </div>
    </div>
  );
};

export default withMainComponent(Payments);
