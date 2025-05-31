/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import FetchAllEqubs from "./AllEqubs";
import RunningEqubs from "./RunningEqubs";
import RegisteringEqubs from "./RegisteringEqubs";
import ClosedEqubs from "./ClosedEqubs";

const Equbs = () => {
  const [activeTab, setActiveTab] = useState<"running" | "registering" | "closed" | "all">("all");
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get("tab");
    setActiveTab(tab === "running"? "running": tab === "registering"? "registering": tab === "closed"? "closed": "all");
  }, [location.search]);

  const tabData = [
    { id: "all", label: "All Equbs" },
    { id: "running", label: "Running Equbs" },
    { id: "registering", label: "Registering Equbs" },
    { id: "closed", label: "Closed Equbs" },
  ];

  return (
    <div className="overflow-auto">
      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200">
        <ul className="flex flex-wrap">
          {tabData.map((tabItem) => (
            <li key={tabItem.id} className="my-2 mr-2 cursor-pointer bg-white rounded-sm text-center">
              <Link
                to={`/dashboard/home/?tab=${tabItem.id}`}
                onClick={() => {
                  setActiveTab(
                    tabItem.id as "running" | "registering" | "closed" | "all"
                  );
                }}
                className={`inline-block p-3 ${
                  activeTab === tabItem.id
                    ? "text-primary font-medium text-base"
                    : "border-transparent text-base hover:text-gray-600 hover:border-gray-300"
                }`}
              >
                {tabItem.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        {activeTab === "all" && <FetchAllEqubs />}
        {activeTab === "running" && <RunningEqubs />}
        {activeTab === "registering" && <RegisteringEqubs />}
        {activeTab === "closed" && <ClosedEqubs />}
      </div>
    </div>
  );
};
export default Equbs;
