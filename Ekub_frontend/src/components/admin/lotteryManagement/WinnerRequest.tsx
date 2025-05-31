import { useState } from "react";

import withMainComponent from "../../layout/withMainComponent";
import WinnerRequestEquber from "./WinnerRequestEquber";
import WinnerRequestGuarantor from "./WinnerRequestGuarantor ";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function WinnerRequest() {
  const [activeTab, setActiveTab] = useState("tab1");
  const navigate = useNavigate();
  const renderContent = () => {
    switch (activeTab) {
      case "tab1":
        return <WinnerRequestEquber />;
      case "tab2":
        return <WinnerRequestGuarantor />;
      default:
        return <WinnerRequestEquber />;
    }
  };
  return (
    <div className=" p-8  ">
      <div className="bg-white p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-green-500 hover:text-green-600 transition-colors duration-300 space-x-2 mb-3 rounded-lg p-2 w-20 shadow-md hover:shadow-lg"
        >
          <FiArrowLeft className="text-2xl" />
          <span className="font-semibold">Back</span>
        </button>
        <h3 className=" font-bold ">Winner Request</h3>

        <ul className="tab-list flex gap-5 ">
          <li
            className={`cursor-pointer py-2   ${
              activeTab === "tab1" ? "text-[#16C098] " : "hover:text-[#16C098]"
            }`}
            onClick={() => setActiveTab("tab1")}
          >
            Personal Infomation
          </li>
          <li
            className={`cursor-pointer  py-2  ${
              activeTab === "tab2" ? "text-[#16C098]" : "hover:text-[#16C098]"
            }`}
            onClick={() => setActiveTab("tab2")}
          >
            Guarantor
          </li>
        </ul>
        <div className="tab-content">{renderContent()}</div>
      </div>
    </div>
  );
}

export default withMainComponent(WinnerRequest);
