/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RunningEqubs from "./RunningEqubs";
import RegisteringEqubs from "./RegisteringEqubs";
import ClosedEqubs from "./ClosedEqubs";
import AllEqubs from "./AllEqubs";
import withMainComponent from "../../../layout/withMainComponent";
import { MdAdd } from "react-icons/md";
import Popup from "../../../layout/Popup";
import { IoSearchSharp } from "react-icons/io5";
import CreateEqub from "./CreateEqub";

const Equbs = () => {
  const [activeTab, setActiveTab] = useState<
    "running" | "registering" | "closed" | "all"
  >("all");
  const [selectedEqubType, setSelectedEqubType] = useState<
    "Daily" | "Weekly" | "Monthly" | "all"
  >("all");

  const [selectedCategory, setSelectedCategory] = useState<
    "Finance" | "Special Finance" | "Finance and Other" | "all"
  >("all");

  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get("tab");
    setActiveTab(
      tab === "running"
        ? "running"
        : tab === "registering"
        ? "registering"
        : tab === "closed"
        ? "closed"
        : "all"
    );
  }, [location.search]);

  const handleTabChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTab = event.target.value as
      | "running"
      | "registering"
      | "closed"
      | "all";
    setActiveTab(selectedTab);
    navigate(`/dashboard/equb/?tab=${selectedTab}`);
  };

  const tabData = [
    { id: "all", label: "All Equbs" },
    { id: "running", label: "Running Equbs" },
    { id: "registering", label: "Registering Equbs" },
    { id: "closed", label: "Closed Equbs" },
  ];

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
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

  return (
    <div className="border-b p-3 rounded-lg overflow-x-auto mx-4">
      <h6 className="font-medium text-black font-poppins text-2xl leading-9 mb-5">
        Equb Management
      </h6>
      <div className="flex items-center w-full justify-between mb-4">
        <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 ">
          <select
            className="p-2 border-[1px] outline-none   rounded-md"
            value={activeTab}
            onChange={handleTabChange}
          >
            {tabData.map((tabItem) => (
              <option key={tabItem.id} value={tabItem.id}>
                {tabItem.label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200">
          <select
            className="p-2 border outline-none rounded-md"
            value={selectedEqubType}
            onChange={handleEqubTypeChange}
          >
            <option value="all">Equb Types</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>

        <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200">
          <select
            className="p-2 border outline-none rounded-md"
            value={selectedCategory}
            onChange={handleEqubCategory}
          >
            <option value="all">Equb Category</option>
            <option value="Finance">Finance</option>
            <option value="Special Finance">Special Finance</option>
            <option value="Car">Car</option>
            <option value="Travel">Travel</option>
            <option value="House">House</option>
          </select>
        </div>

        <div className="relative">
          <IoSearchSharp
            className="absolute top-3 size-5 left-3 opacity-50 "
            id="equbIcon"
            name="equbIcon"
          />
          <input
            type="text"
            name="equbSearch"
            value={searchTerm}
            onChange={handleSearchChange}
            id="equbSearch"
            placeholder="Search..."
            className="p-2 pl-9 border-[1px] rounded-md outline-none"
          />
        </div>

        <button
          onClick={() => setShowPopup(true)}
          className="flex items-center gap-2 bg-btnColor hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm shadow-md"
        >
          <MdAdd /> Add Equb
        </button>
      </div>
      <div>
        {activeTab === "all" && (
          <AllEqubs
            searchTerm={searchTerm}
            equbTypeFilter={selectedEqubType}
            equbTypeCategory={selectedCategory}
          />
        )}
        {activeTab === "running" && (
          <RunningEqubs
            searchTerm={searchTerm}
            equbTypeFilter={selectedEqubType}
            equbTypeCategory={selectedCategory}
          />
        )}
        {activeTab === "registering" && (
          <RegisteringEqubs
            searchTerm={searchTerm}
            equbTypeFilter={selectedEqubType}
            equbTypeCategory={selectedCategory}
          />
        )}
        {activeTab === "closed" && (
          <ClosedEqubs
            searchTerm={searchTerm}
            equbTypeFilter={selectedEqubType}
            equbTypeCategory={selectedCategory}
          />
        )}
      </div>
      <Popup title="Create Equb" open={showPopup} setOpen={setShowPopup}>
        <CreateEqub setOpen={setShowPopup} />
      </Popup>
    </div>
  );
};

export default withMainComponent(Equbs);
