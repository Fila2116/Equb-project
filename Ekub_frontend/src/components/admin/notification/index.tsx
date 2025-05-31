import { useEffect, useState } from "react";
import CleaimRequests from "./Notification";
import PaymentHistory from "./PaymentHistory";
import { AiOutlineSearch } from "react-icons/ai";
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../../utils/axios";
import { Button } from "@mui/material";

type Equb = {
    id: string;
    name: string;
    // other fields...
};
type EqubResponse = {
    equbs: Equb[];
    totalCount: number;
};
function Withdraws() {
    const [searchQuery, setSearchQuery] = useState("");
    const [equbName, setEqubName] = useState("");
    const [activeTab, setActiveTab] = useState("tab1");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [selectedEqub, setSelectedEqub] = useState("");
    const [dateError, setDateError] = useState(false);
    const [equbLists, setEqubLists] = useState<EqubResponse>({ equbs: [], totalCount: 0 });

    // const [selectedEqubType, setSelectedEqubType] = useState<
    //     "Daily" | "Weekly" | "Monthly" | "all"
    // >("all");

    // const [selectedCategory, setSelectedCategory] = useState<
    //     "Finance" | "Special Finance" | "Finance and Other" | "all"
    // >("all");
    const renderContent = () => {
        switch (activeTab) {
            case "tab1":
                return (
                    <CleaimRequests
                        searchQuery={searchQuery}
                        equbId={selectedEqub}
                        equbName={equbName}
                        startDate={startDate}
                        endDate={endDate}
                    />
                );
            case "tab2":
                return (
                    <PaymentHistory
                        searchQuery={searchQuery}
                        equbId={selectedEqub}
                        equbName={equbName}
                        startDate={startDate}
                        endDate={endDate}

                    />
                );
            default:
                return null;
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };
    // const handleEqubTypeChange = (
    //     event: React.ChangeEvent<HTMLSelectElement>
    // ) => {
    //     const selectedType = event.target.value as
    //         | "Daily"
    //         | "Weekly"
    //         | "Monthly"
    //         | "all";
    //     setSelectedEqubType(selectedType);
    // };
    // const handleEqubCategory = (event: React.ChangeEvent<HTMLSelectElement>) => {
    //     const selectedTypeCategory = event.target.value as
    //         | "Finance"
    //         | "Special Finance"
    //         | "Finance and Other"
    //         | "all";
    //     setSelectedCategory(selectedTypeCategory);
    // };
    const handleEqubChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setSelectedEqub(event.target.value);
        const selectedEqubObj = equbLists.equbs.find(equb => equb.id === event.target.value);

        if (selectedEqubObj) {
            setEqubName(selectedEqubObj.name); // Also store/display name
        }
    };
    const onFilterClear = () => {
        setSearchQuery("");
        setStartDate(null);
        setEndDate(null);
        setSelectedEqub("");
        setEqubName("");
    };

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

    const handleDateChange = (dates: [Date | null, Date | null]) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
        setDateError(false);
    };


    return (
        <div className="bg-white p-8 rounded-xl shadow-md ml-[250px] min-h-screen">
            <div className="mb-6">
                <h3 className="text-2xl font-semibold text-gray-800">Withdraw Requests</h3>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                
                {/* Equb Dropdown */}
                <div className="w-[350px]">
                    <select
                        id="equbId"
                        name="equbId"
                        value={selectedEqub}
                        onChange={handleEqubChange}
                        className="w-full bg-[#F9FBFF] border border-gray-300 rounded-lg py-2 px-3 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Equbs</option>
                        {equbLists.equbs.map((equb) => (
                            <option key={equb.id} value={equb.id}>{equb.name}</option>
                        ))}
                    </select>
                </div>

                {/* Search */}
                <div className="flex flex-col w-full md:w-1/3">
                    <div className="flex items-center px-3 py-2 border rounded-md shadow-sm bg-white border-gray-300">
                        <AiOutlineSearch className="text-gray-400 mr-2" size={18} />
                        <input
                            type="text"
                            placeholder="Search Equbers..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full text-sm text-gray-700 outline-none bg-transparent"
                        />
                    </div>

                </div>

                {/* Date Range */}
                <div className="w-full md:w-1/3">
                    <DatePicker
                        selected={startDate}
                        onChange={handleDateChange}
                        startDate={startDate!}
                        endDate={endDate!}
                        selectsRange
                        required
                        className={`w-full py-2 px-3 rounded-md border text-sm shadow-sm outline-none focus:ring-2 ${dateError ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`}
                        placeholderText="Select date range"
                    />
                    {dateError && (
                        <span className="text-red-500 text-xs mt-1 ml-1">Please select a date range</span>
                    )}
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

                </div>
            </div>


            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-6 ml-1">
                    <button
                        onClick={() => setActiveTab("tab1")}
                        className={`pb-2 text-sm font-medium ${activeTab === "tab1" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500 hover:text-green-600"}`}
                    >
                        Request Member
                    </button>
                    <button
                        onClick={() => setActiveTab("tab2")}
                        className={`pb-2 text-sm font-medium ${activeTab === "tab2" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500 hover:text-green-600"}`}
                    >
                        Transaction History
                    </button>
                </nav>
            </div>

            <div className="tab-content">
                {renderContent()}
            </div>
        </div>
    );
}

export default Withdraws;
