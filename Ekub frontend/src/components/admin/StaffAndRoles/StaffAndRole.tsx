/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import withMainComponent from "../../layout/withMainComponent";
import FetchRoles from "./roles/FetchRoles";
import FetchStaffs from "./staffs/FetchStaffs";
import { hasPermission } from "../../../utils/hasPermission";
import { useAppSelector } from "../../../store/store";

const StaffsAndRoles = () => {
  const [activeTab, setActiveTab] = useState<"staff" | "roles">("staff");
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get("tab");
    setActiveTab(
      tab === "staff" ? "staff" : tab === "roles" ? "roles" : "staff"
    );
  }, [location.search]);

  const tabData = [
    { id: "staff", label: "Staff", permission: "staff" },
    { id: "roles", label: "Role", permission: "all" },
  ].filter((tab) =>
    hasPermission(user?.role?.permissions || [], tab.permission)
  );

  return (
    <div className="border-b p-3 rounded-md overflow-x-auto mx-4">
      <div className="flex justify-between items-center my-3">
        <h3 className="text-2xl font-medium text-black font-poppins  leading-9">
          Manage Staff and Roles
        </h3>
      </div>
      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 rounded-md">
        <ul className="flex flex-wrap ">
          {tabData.map((tabItem) => (
            <li
              key={tabItem.id}
              className="mr-2 cursor-pointer bg-white rounded-md border-[1px] w-32 h-10"
            >
              <Link
                to={`/dashboard/staffAndRoles/?tab=${tabItem.id}`}
                onClick={() => {
                  setActiveTab(tabItem.id as "staff" | "roles");
                }}
                className={`inline-block p-2 rounded-t-lg ${
                  activeTab === tabItem.id
                    ? "text-primary  font-medium "
                    : " text-base hover:text-green-500 "
                }`}
              >
                {tabItem.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        {activeTab === "staff" && <FetchStaffs />}
        {activeTab === "roles" && <FetchRoles />}
      </div>
    </div>
  );
};
export default withMainComponent(StaffsAndRoles);
