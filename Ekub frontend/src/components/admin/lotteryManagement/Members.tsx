import { useState } from "react";
import AllMembers from "./AllMembers";
import WinnerMember from "./WinnerMember";
import SpecialRequest from "./SpecialRequest";
import { AiOutlineSearch } from "react-icons/ai";
// import { Autocomplete, TextField } from "@mui/material";
import React from "react";
import DatePicker from "react-datepicker";

function Members({ equbName }: { equbName: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("tab1");
  const [openPrint, setOpenPrint] = React.useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  // Add state at the top of your component
  // const [userName, setUserName] = useState<{ label: string } | null>(null);
  const [lotteryNumber, setLotteryNumber] = useState("");
  const [userNameError, setUserNameError] = useState(false);
  const [dateError, setDateError] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "tab1":
        return <AllMembers searchQuery={searchQuery} sortBy={sortBy} openPrint={openPrint} lotteryNumber={lotteryNumber} startDate={startDate} endDate={endDate} />;
      case "tab2":
        return <WinnerMember searchQuery={searchQuery} sortBy={sortBy} openPrint={openPrint} lotteryNumber={lotteryNumber} startDate={startDate} endDate={endDate} />;
      case "tab3":
        return <SpecialRequest searchQuery={searchQuery} sortBy={sortBy} />;
      default:
        return <AllMembers searchQuery={searchQuery} sortBy={sortBy} openPrint={openPrint} lotteryNumber={lotteryNumber} startDate={startDate} endDate={endDate} />;
    }
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };
  const handleLotteryNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLotteryNumber(e.target.value);
  };
  // Set Date functionality
  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    setDateError(false); // clear error when user updates
  };
  const handleOpen = () => {
    let hasError = false;
    if (searchQuery == null || searchQuery === "") {
      setUserNameError(true);
      hasError = true;
    }
    else {
      setUserNameError(false);
    }

    if (!startDate || !endDate) {
      setDateError(true);
      hasError = true;
    }
    else {
      setDateError(false);
    }
    if (!hasError) {
      setOpenPrint(true);
    }
  };

  return (
    <div className="bg-white pt-5 flex-col m-8 bg-white p-2 ">
      <div className="px-[95px] mb-4">
        <h3 className="font-inter font-semibold text-[22px] text-gray-800">
          All Members
        </h3>
      </div>
      <div className="flex flex-wrap items-center justify-between bg-white rounded-xl shadow-md px-6 py-5 gap-4">
        {/* Left: Title */}


        <div className="flex flex-wrap items-center justify-start gap-2 md:gap-4 w-full">

          {/* Search Field */}
          <div className="w-auto flex-shrink-0 flex flex-col">
            <div className={`flex items-center px-3 py-2 bg-white border ${userNameError ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm hover:shadow-md transition`}>
              <AiOutlineSearch className="text-gray-400 mr-2" size={18} />
              <input
                type="text"
                placeholder="Search Equbers..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full text-sm text-gray-700 border-none focus:outline-none bg-transparent"
              />
            </div>
            {userNameError && (
              <span className="text-red-500 text-xs mt-1 ml-2">Please input a equber name</span>
            )}
          </div>
          {/* Date Range Picker */}
          <div className="w-auto flex-shrink-0">
            <DatePicker
              selected={startDate}
              onChange={handleDateChange}
              startDate={startDate!}
              endDate={endDate!}
              selectsRange
              required
              className={`w-full py-2 px-3 rounded-md border text-sm shadow-sm focus:outline-none focus:ring-2 ${dateError ? "border-red-500 focus:ring-red-200" : "border-gray-300 text-gray-700 focus:ring-blue-200"
                }`}
              placeholderText="Select date range"
            />
            {dateError && (
              <div className="text-red-500 text-xs mt-1">Please select a date range</div>
            )}
          </div>

          {/* Lottery Number */}
          <div className="w-auto flex-shrink-0 flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:shadow-md transition">
            <input
              type="text"
              placeholder="Lottery Number..."
              value={lotteryNumber}
              onChange={handleLotteryNumberChange}
              className="w-full text-sm text-gray-700 border-none focus:outline-none bg-transparent"
            />
          </div>




          {/* Sort Dropdown */}
          <div className="w-auto flex-shrink-0 flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:shadow-md transition">
            <label className="text-gray-500 text-sm mr-2 whitespace-nowrap">Sort by:</label>
            <select
              name="select"
              id="select"
              className="bg-transparent border-none text-gray-700 font-semibold text-sm focus:outline-none"
              onChange={handleSortChange}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
          {/* Right-aligned Print Button */}
          <div className="ml-auto">
            <button
              onClick={handleOpen}
              className="bg-[#149D52] text-white flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#128947] transition"
            >
              Export
            </button>
          </div>
        </div>



      </div>
      <ul className="tab-list flex gap-2 -mb-[100px] mt-[20px] ml-[80px] mr-20">
        <li
          className={`cursor-pointer px-4 py-2 font-normal   ${activeTab === "tab1" ? "text-[#16C098] " : "hover:text-[#16C098]"
            }`}
          onClick={() => setActiveTab("tab1")}
        >
          Active Member
        </li>
        <li
          className={`cursor-pointer px-4 py-2 font-normal  ${activeTab === "tab2" ? "text-[#16C098]" : "hover:text-[#16C098]"
            }`}
          onClick={() => setActiveTab("tab2")}
        >
          Winner
        </li>
        {equbName === "Special Finance" && (
          <li
            className={`cursor-pointer px-4 py-2 font-normal  ${activeTab === "tab3" ? "text-[#16C098]" : "hover:text-[#16C098]"
              }`}
            onClick={() => setActiveTab("tab3")}
          >
            Special Requests
          </li>
        )}
      </ul>


      <div className="tab-content">{renderContent()}</div>
    </div>
  );
}

export default Members;

