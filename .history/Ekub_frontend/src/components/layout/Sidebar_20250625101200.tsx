import {
  LuLayoutDashboard,
  LuPackageOpen,
  LuUsers,
  LuStickyNote,
  LuImage,
  LuSettings,
  LuBuilding2,
} from "react-icons/lu";
import { FaRegSquarePlus } from "react-icons/fa6";
import { NavLink, useMatch } from "react-router-dom";
import { RiBankCard2Line, RiBankLine } from "react-icons/ri";
import { useAppSelector } from "../../store/store";
import { hasPermission } from "../../utils/hasPermission";
import { useEffect, useState } from "react";


const Sidebar: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { count } = useAppSelector((state) => state.payment);
  const { branding } = useAppSelector((state) => state.branding);
  const { logoLight, logoDark } = useAppSelector((state) => state.branding);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const logoSrc =
    branding && (branding.logoDark || branding.logoLight)
      ? isDarkMode
        ? branding.logoDark
        : branding.logoLight
      : "/default-logo.png"; // fallback logo path

  // Route matching
  const dashboardMatch = useMatch("/dashboard/home");
  const rolesAndStaffMatch = useMatch("/dashboard/staffAndRoles");
  const bannersMatch = useMatch("/dashboard/banners");
  const banksMatch = useMatch("/dashboard/banks");
  const equbsMatch = useMatch("/dashboard/equb");
  const equbTypeMatch = useMatch("/dashboard/equb/types");
  const usersMatch = useMatch("/dashboard/users");
  const paymentMatch = useMatch("/dashboard/payment");
  const settingsMatch = useMatch("/dashboard/settings");
  const companyProfileMatch = useMatch("/dashboard/companyProfile");
  const financeAndOtherMatch = useMatch("/dashboard/financeAndOther");

  if (!user || !user.role) return null;
  const permissions = user.role.permissions;

  return (
    <div className="bg-white dark:bg-boxdark h-screen w-64 p-4 shadow-card border-r border-stroke dark:border-strokedark overflow-y-auto fixed top-0 left-0 z-50">
      <div className="my-6 flex justify-center">
        <NavLink to="/">
          <img
            src={logoSrc}
            alt="App Logo"
            className="max-h-12 object-contain"
            loading="lazy"
          />
        </NavLink>
      </div>

      <ul className="flex flex-col gap-3 overflow-auto">
        <li className="text-[#082431] text-xs font-normal opacity-50 p-4 uppercase font-poppins">
          Menu
        </li>

        {hasPermission(permissions, "all") && (
          <li
            className={`flex gap-2 items-center rounded p-2 ${
              dashboardMatch
                ? "bg-primary bg-opacity-10 text-primary"
                : "text-secondary"
            }`}
          >
            <LuLayoutDashboard />
            <NavLink className="text-xs font-medium w-full" to="/dashboard/home">
              Dashboard
            </NavLink>
          </li>
        )}

        {hasPermission(permissions, "staff") && (
          <li
            className={`flex gap-2 items-center rounded p-2 ${
              rolesAndStaffMatch
                ? "bg-primary bg-opacity-10 text-primary"
                : "text-secondary"
            }`}
          >
            <LuUsers />
            <NavLink className="text-xs font-medium w-full" to="/dashboard/staffAndRoles">
              Staff & Roles
            </NavLink>
          </li>
        )}

        {hasPermission(permissions, "equb") && (
          <li
            className={`flex gap-2 items-center rounded p-2 ${
              equbsMatch
                ? "bg-primary bg-opacity-10 text-primary"
                : "text-secondary"
            }`}
          >
            <LuPackageOpen />
            <NavLink className="text-xs font-medium w-full" to="/dashboard/equb">
              Equb
            </NavLink>
          </li>
        )}

        {hasPermission(permissions, "bank") && (
          <li
            className={`flex gap-2 items-center rounded p-2 ${
              banksMatch
                ? "bg-primary bg-opacity-10 text-primary"
                : "text-secondary"
            }`}
          >
            <RiBankLine />
            <NavLink className="text-xs font-medium w-full" to="/dashboard/banks">
              Bank
            </NavLink>
          </li>
        )}

        {hasPermission(permissions, "all") && (
          <li
            className={`flex gap-2 items-center rounded p-2 ${
              companyProfileMatch
                ? "bg-primary bg-opacity-10 text-primary"
                : "text-secondary"
            }`}
          >
            <LuBuilding2 />
            <NavLink className="text-xs font-medium w-full" to="/dashboard/companyProfile">
              Company Profile
            </NavLink>
          </li>
        )}

        {hasPermission(permissions, "banner") && (
          <li
            className={`flex gap-2 items-center rounded p-2 ${
              bannersMatch
                ? "bg-primary bg-opacity-10 text-primary"
                : "text-secondary"
            }`}
          >
            <LuImage />
            <NavLink className="text-xs font-medium w-full" to="/dashboard/banners">
              Banner
            </NavLink>
          </li>
        )}

        {hasPermission(permissions, "payment") && (
          <li
            className={`flex gap-2 items-center rounded p-2 ${
              paymentMatch
                ? "bg-primary bg-opacity-10 text-primary"
                : "text-secondary"
            }`}
          >
            <LuStickyNote />
            <NavLink className="text-xs font-medium w-full flex justify-between" to="/dashboard/payment">
              Payment
              {count > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {count}
                </span>
              )}
            </NavLink>
          </li>
        )}

        {hasPermission(permissions, "equb_type") && (
          <li
            className={`flex gap-2 items-center rounded p-2 ${
              equbTypeMatch
                ? "bg-primary bg-opacity-10 text-primary"
                : "text-secondary"
            }`}
          >
            <RiBankCard2Line />
            <NavLink className="text-xs font-medium w-full" to="/dashboard/equb/types">
              Equb Types
            </NavLink>
          </li>
        )}

        {hasPermission(permissions, "user") && (
          <li
            className={`flex gap-2 items-center rounded p-2 ${
              usersMatch
                ? "bg-primary bg-opacity-10 text-primary"
                : "text-secondary"
            }`}
          >
            <LuUsers />
            <NavLink className="text-xs font-medium w-full" to="/dashboard/users">
              Customer Relation
            </NavLink>
          </li>
        )}

        {hasPermission(permissions, "financeAndOther") && (
          <li
            className={`flex gap-2 items-center rounded p-2 ${
              financeAndOtherMatch
                ? "bg-primary bg-opacity-10 text-primary"
                : "text-secondary"
            }`}
          >
            <FaRegSquarePlus />
            <NavLink className="text-xs font-medium w-full" to="/dashboard/financeAndOther">
              Finance and Other
            </NavLink>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
