import withMainComponent from "../../layout/withMainComponent";
import { GrPowerCycle } from "react-icons/gr";
import { FiUsers } from "react-icons/fi";
import imagebirr from "../../../assets/—Pngtree—200 ethiopian birr stack pile_8789613 (1) 2.png";
import imagebirr2 from "../../../assets/—Pngtree—200 ethiopian birr stack pile_8789613 (1) 1.png";
import { Link } from "react-router-dom";
import Logo from "../../../assets/Logo.png";

import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  fetchRegisteringEqubs,
  clearSuccessMessage,
  fetchAllEqubs,
} from "../../../store/features/admin/equb/equbSlice";
import {
  fetchAllCompanyBank,
} from "../../../store/features/admin/banks/banksSlice";

import { useEffect, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import Pagination from "../../layout/Pagination";
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
import React from "react";
import api from "../../../utils/axios";
function LottoryManagement() {
  const dispatch = useAppDispatch();
  const {
    registering,
    allEqubs,
    totalPages,
    isLoading,
    error,
    successMessage,
  } = useAppSelector((state) => state.equbs);
  // type Equb = {
  //   id: string;
  //   name: string;
  //   // other fields...
  // };

  // type EqubResponse = {
  //   equbs: Equb[];
  //   totalCount: number;
  // };
  type Transformed = {
    name: string | undefined;
    equbAmount: number | undefined;
    numberOfEqubers: number | undefined;
    nextRoundDate: string;
    equbType: string | undefined;
    equbCategory: string | undefined;
    currentRound: number | undefined;
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
  const [selectedEqubType, setSelectedEqubType] = useState<
    "Daily" | "Weekly" | "Monthly" | "all"
  >("all");

  const [selectedCategory, setSelectedCategory] = useState<
    "Finance" | "Special Finance" | "Finance and Other" | "all"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [transformed, setTransformed] = React.useState<Transformed[]>([]);
  const [totalAmount, setTotalAmount] = React.useState<number>(0);


  useEffect(() => {
    dispatch(fetchRegisteringEqubs({ limit: itemsPerPage, page: currentPage }));
  }, [dispatch, currentPage, itemsPerPage]);
  // Fetch all equbs based on the search query
  useEffect(() => {
    dispatch(
      fetchAllEqubs({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        sortBy: sortBy,
        equbType: selectedEqubType,
        equbCategory: selectedCategory,
        startDate: startDate
          ? dayjs(startDate).format("YYYY-MM-DD")
          : undefined,
        endDate: endDate ? dayjs(endDate).format("YYYY-MM-DD") : undefined,

      })
    );
  }, [dispatch, searchQuery, sortBy, selectedEqubType, selectedCategory, currentPage, itemsPerPage, startDate, endDate]);

  useEffect(() => {
    dispatch(
      fetchAllCompanyBank() as any
    );
  }, [dispatch]);
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
  // Determine if we should show filtered results or the full list
  const shouldShowFiltered = searchQuery.trim().length > 0 || sortBy;
  const displayEqubers = shouldShowFiltered ? allEqubs : registering;

  // Transform the equbs into a flat exportable format
  React.useEffect(() => {
    if (!displayEqubers) return;
    // Transform the equbs into a flat exportable format
    const transformedEqub = displayEqubers.map((equb) => ({
      name: equb.name,
      equbAmount: equb.equbAmount,
      numberOfEqubers: equb.numberOfEqubers,
      nextRoundDate: formatDate(equb.nextRoundDate || ""),
      equbType: equb.equbType?.name,
      equbCategory: equb.equbCategory?.name,
      currentRound: equb.currentRound,
    }));

    setTransformed(transformedEqub);
    let totalAmount = 0;
    transformed.forEach((item) => {
      if (item.equbAmount) {
        totalAmount = totalAmount + item.equbAmount
      }
    });
    setTotalAmount(totalAmount);


  }, [displayEqubers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearSuccessMessage());
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage, dispatch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleEqubTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedType = event.target.value as
      | "Daily"
      | "Weekly"
      | "Monthly"
      | "all";
    setSelectedEqubType(selectedType);
  };
  const handleEqubCategory = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTypeCategory = event.target.value as
      | "Finance"
      | "Special Finance"
      | "Finance and Other"
      | "all";
    setSelectedCategory(selectedTypeCategory);
  };

  // console.log("Sorted allEqubs data from backend:", allEqubs);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // console.log("Sorted allEqubs data from backend:", displayEqubers);
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    dispatch(
      fetchAllEqubs({
        page: currentPage,
        limit: newItemsPerPage,
      }) as any
    );
  };
  if (error) {
    return <ConnectionErrorPage error={error} />;
  }

  // Set Date functionality
  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };
  const onFilterClear = () => {
    setSearchQuery("");
    setStartDate(null);
    setEndDate(null);
    setSelectedCategory("all");
    setSelectedEqubType("all");

  };

  // Export configurations for PDF and Excel


  const exportAll = () => {
    const visibleColumn = [
      { key: "name", name: "Equber Name" },
      { key: "equbAmount", name: "Equb Amount" },
      { key: "numberOfEqubers", name: "Number Of Equbers" },
      { key: "nextRoundDate", name: "Next Round Date" },
      { key: "equbType", name: "Equb Type" },
      { key: "equbCategory", name: "Equb Category" },
      { key: "currentRound", name: "Current Round" },
    ];

    const pdfConfig: PdfConfig = {
      orientation: "portrait",
      unit: "pt",
      size: "A4",
      fileName: "Lottery Management Of Hagerigna Cloud Equb",
      logoBase64: Logo,
      title: "Lottery Management Of Hagerigna Cloud Equb",
      companyInfo: {
        country: companyProfile?.country,
        city: companyProfile?.city,
        address: companyProfile?.address,
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
      key: "name",
      label: "Equb",
    },
    {
      key: "equbAmount",
      label: "Equb Amount",
    },
    {
      key: "numberOfEqubers",
      label: "Number Of Equbers",
    },
    {
      key: "nextRoundDate",
      label: "Next Round Date",
    },
    {
      key: "equbType",
      label: "Equb Type",
    },
    {
      key: "equbCategory",
      label: "Equb Category",
    },
    {
      key: "currentRound",
      label: "Current Round",
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
              filename="Lottery Management of Hagerigna Cloud Equb"
              title="List of Lottery Management"
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
  return (
    <div className="overflow-x-auto mx-4 p-5">
      {successMessage && (
        <p className="text-green-500 items-center text-center">
          {successMessage}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between bg-white rounded-xl shadow-md px-6 py-5 gap-4">
        {/* Left: Title */}
        <div className="flex items-center gap-2">
          <h3 className="font-inter font-semibold text-[22px] text-gray-800">
            🎲 Lottery Management
          </h3>
        </div>

        {/* Middle: Filters */}
        <div className="flex flex-wrap items-center justify-start gap-3 flex-grow">
          {/* Equb Type */}
          <select
            className="min-w-[140px] bg-[#F9FBFF] border border-gray-200 rounded-lg shadow-sm py-2 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={selectedEqubType}
            onChange={handleEqubTypeChange}
          >
            <option value="all">All Equb Types</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>

          {/* Equb Category */}
          <select
            className="min-w-[160px] bg-[#F9FBFF] border border-gray-200 rounded-lg shadow-sm py-2 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={selectedCategory}
            onChange={handleEqubCategory}
          >
            <option value="all">All Equb Categories</option>
            <option value="Finance">Finance</option>
            <option value="Special Finance">Special Finance</option>
            <option value="Car">Car</option>
            <option value="Travel">Travel</option>
            <option value="House">House</option>
          </select>

          {/* Date Picker */}
          <DatePicker
            selected={startDate}
            onChange={handleDateChange}
            startDate={startDate!}
            endDate={endDate!}
            selectsRange
            className="py-2 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholderText="Select date range"
          />

          {/* Search */}
          <div className="w-[220px] bg-[#F9FBFF] flex items-center px-3 py-2 rounded-lg shadow-sm border border-gray-200">
            <AiOutlineSearch className="text-gray-400 mr-2" size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full text-sm text-gray-700 border-none focus:outline-none bg-transparent"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center bg-[#F9FBFF] px-3 py-2 rounded-lg shadow-sm border border-gray-200">
            <label className="text-gray-400 text-sm mr-2">Sort by:</label>
            <select
              className="bg-transparent border-none text-sm text-gray-700 font-medium focus:outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {/* Right: Export Button */}
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
              <span
                className="flex items-center gap-2 bg-[#149D52] hover:bg-green-600 text-white font-bold rounded  normal-case">
                Export </span>
              <DownOutlined style={{ fontSize: "12px" }} />
            </Button>
          </Dropdown>

        </div>
      </div>

      {isLoading ? (
        <div className="text-center">
          <Loader />
        </div>
      ) : (
        <>
          {displayEqubers.length > 0 ? (
            displayEqubers.map((registering) => (
              <div
                className="flex justify-between m-14 border-[1px] p-1"
                key={registering.id}
              >
                <div className="flex gap-10 h-[100hv]">
                  <div className="relative w-[303px] h-[151px] bg-gradient-to-r from-lime-800 to-lime-500">
                    <div className="flex flex-col gap-2 absolute top-[32%] left-[32%]">
                      <h1 className="text-white font-extrabold font-poppins size-[32px] w-40">
                        {registering.name}
                      </h1>
                      <h1 className="text-white font-extrabold font-poppins size-[32px] w-40">
                        {formatCurrencyWithSymbolAfter(
                          registering.equbAmount! *
                          registering.numberOfEqubers!,
                          "ETB",
                          "am-ET"
                        )}
                      </h1>
                    </div>
                    <div className="flex gap-2 absolute top-2 left-2">
                      <FiUsers className="text-white" />
                      <p className="text-white mt-[-5px]">
                        {registering.numberOfEqubers}
                      </p>
                    </div>
                    <div className="flex gap-2 absolute top-2 right-2">
                      <GrPowerCycle className="text-white" />
                      <p className="text-white mt-[-5px]">
                        {registering.numberOfEqubers}
                      </p>
                    </div>
                    <div className="flex justify-between mt-[35px]">
                      <img
                        className="h-[92.03px] w-[92.03px]"
                        src={imagebirr}
                        alt=""
                      />
                      <img
                        className="h-[92.03px] w-[92.03px]"
                        src={imagebirr2}
                        alt=""
                      />
                    </div>
                  </div>
                  <div className="flex-col flex gap-5 font-inter">
                    <p className="text-[#5D6679] font-semibold leading-[24px] size-[16px] w-44">
                      {registering.name}
                    </p>
                    <p className="text-[#858D9D] w-32 ">
                      {formatDate(registering.nextRoundDate || "")}
                    </p>
                    <p className="text-[#858D9D]">
                      {formatCurrencyWithSymbolAfter(
                        registering.equbAmount!,
                        "ETB",
                        "am-ET"
                      )}
                    </p>
                    <p className="text-[#858D9D] flex items-center justify-between gap-3">
                      <span>Round {registering.currentRound} |</span>
                      <span className="flex justify-center items-center gap-3">
                        <span className=" border-2 border-[#76B715] outline-none text-[#76B715] rounded-md py-1 px-3">
                          {registering?.equbType?.name!}{" "}
                        </span>
                        <span className="bg-[#76B715] outline-none rounded-md text-white p-1">
                          {registering.equbCategory?.name}{" "}
                        </span>
                      </span>
                    </p>
                    {/* <p className="text-[#858D9D] text-xs">
                      {registering?.equbType?.name!} | {registering.equbCategory?.name}
                    </p> */}
                  </div>
                </div>
                <div>
                  <Link to={`/dashboard/lotterydetail/${registering.id}`}>
                    <button className="border-solid border-transparent-300 text-center text-[#1366D9] border-[1px] w-20 hover:bg-transparent-100 font-medium">
                      Open
                    </button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center">
              {searchQuery ? (
                <p>No results found.</p>
              ) : (
                <div className="flex flex-col items-center justify-center h-80">
                  <svg
                    className="w-16 h-16 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6M12 6h.01M12 20.02v.01M20 12.02a8 8 0 11-16 0 8 8 0 0116 0z"
                    ></path>
                  </svg>
                  <p className="text-gray-500 text-xl font-semibold">
                    No Equb available.
                  </p>
                  <p className="text-gray-400">
                    Once Equb are Created, they will be displayed here.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
}

export default withMainComponent(LottoryManagement);
