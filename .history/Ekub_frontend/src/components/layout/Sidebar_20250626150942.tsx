import {
  LuLayoutDashboard,
  LuPackageOpen,
  LuUsers,
  LuStickyNote,
  LuInfo,
  LuImage,
  LuSettings,
  LuBuilding2,
  LuBanknote,
} from "react-icons/lu";
import { FaRegSquarePlus } from "react-icons/fa6";
import { NavLink, useMatch } from "react-router-dom";
import { RiBankCard2Line, RiBankLine } from "react-icons/ri";
import { MdColorLens } from "react-icons/md";
import { useAppSelector, useAppDispatch } from "../../store/store";
import { hasPermission } from "../../utils/hasPermission";
import defaultLogo from "../../assets/Logo.png";
import { useEffect, useState } from "react";
import { fetchBranding } from "../../store/slices/brandingSlice";

const Sidebar: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { count } = useAppSelector((state) => state.payment);
  const { logoLight } = useAppSelector((state) => state.branding);
    const [Branding, setBranding] = useState<EqubResponse>({ equbs: [], totalCount: 0 });
  
  const dispatch = useAppDispatch();
console.log("logoLight..",logoLight);
  useEffect(() => {
    if (user) {
      dispatch(fetchBranding());
    }
  }, [dispatch, user]);

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

  const dashboardMatch = useMatch("/dashboard/home");
  const rolesAndStaffMatch = useMatch("/dashboard/staffAndRoles");
  const bannersMatch = useMatch("/dashboard/banners");
  const banksMatch = useMatch("/dashboard/banks");
  const equbsMatch = useMatch("/dashboard/equb");
  const equbTypeMatch = useMatch("/dashboard/equb/types");
  const usersMatch = useMatch("/dashboard/users");
  const paymentMatch = useMatch("/dashboard/payment");
  const lottoMatch = useMatch("/dashboard/lottoryManagement");
  const settingsMatch = useMatch("/dashboard/settings");
  const companyProfileMatch = useMatch("/dashboard/companyProfile");

  if (!user || !user.role) return null;

  const permissions = user.role.permissions;
  const adminNavigation = (
    <ul className="flex flex-col gap-3 overflow-auto">
      <li className="text-[#082431] text-xs font-normal opacity-50 p-4 uppercase font-poppins">
        Menu
      </li>

      {hasPermission(permissions, "all") && (
        <li
          className={`flex flex-col md:flex-row gap-1 md:gap-2 items-center rounded p-2 ${
            dashboardMatch ? "bg-primary bg-opacity-10 text-primary" : "text-secondary font-normal"
          }`}
        >
          <LuLayoutDashboard />
          <NavLink className="text-xs md:text-xs font-medium w-full" to="/dashboard/home">
            Dashboard
          </NavLink>
        </li>
      )}

      {hasPermission(permissions, "staff") && (
        <li
          className={`flex flex-col md:flex-row gap-1 md:gap-2 items-center rounded p-2 ${
            rolesAndStaffMatch ? "bg-primary bg-opacity-10 text-primary" : "text-secondary font-normal"
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
          className={`flex flex-col md:flex-row gap-1 md:gap-2 items-center rounded p-2 ${
            equbsMatch ? "bg-primary bg-opacity-10 text-primary" : "text-secondary font-normal"
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
          className={`flex flex-col md:flex-row gap-1 md:gap-2 items-center rounded p-2 ${
            banksMatch ? "bg-primary bg-opacity-10 text-primary" : "text-secondary font-normal"
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
          className={`flex flex-col md:flex-row gap-1 md:gap-2 items-center rounded p-2 ${
            companyProfileMatch ? "bg-primary bg-opacity-10 text-primary" : "text-secondary font-normal"
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
          className={`flex flex-col md:flex-row gap-1 md:gap-2 items-center rounded p-2 ${
            bannersMatch ? "bg-primary bg-opacity-10 text-primary" : "text-secondary font-normal"
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
          className={`flex flex-col md:flex-row gap-1 md:gap-2 items-center rounded p-2 ${
            paymentMatch ? "bg-primary bg-opacity-10 text-primary" : "text-secondary font-normal"
          }`}
        >
          <LuStickyNote />
          <NavLink className="text-xs font-medium w-full justify-between flex" to="/dashboard/payment">
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
          className={`flex flex-col md:flex-row gap-1 md:gap-2 items-center rounded p-2 ${
            equbTypeMatch ? "bg-primary bg-opacity-10 text-primary" : "text-secondary font-normal"
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
          className={`flex flex-col md:flex-row gap-1 md:gap-2 items-center rounded p-2 ${
            usersMatch ? "bg-primary bg-opacity-10 text-primary" : "text-secondary font-normal"
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
          className={`flex flex-col md:flex-row gap-1 md:gap-2 items-center rounded p-2 ${
            bannersMatch ? "bg-primary bg-opacity-10 text-primary" : "text-secondary font-normal"
          }`}
        >
          <FaRegSquarePlus />
          <NavLink className="text-xs font-medium w-full" to="/dashboard/financeAndOther">
            Finance and Other
          </NavLink>
        </li>
      )}

      {hasPermission(permissions, "lottoryManagement") && (
        <>
          <li
            className={`flex flex-col md:flex-row gap-1 md:gap-2 items-center rounded p-2 ${
              lottoMatch ? "bg-primary bg-opacity-10 text-primary" : "text-secondary font-normal"
            }`}
          >
            <LuInfo />
            <NavLink className="text-xs font-medium w-full" to="/dashboard/lottoryManagement">
              Lotto Management
            </NavLink>
          </li>

          <li
            className={`flex flex-col md:flex-row gap-1 md:gap-2 items-center rounded p-2 ${
              lottoMatch ? "bg-primary bg-opacity-10 text-primary" : "text-secondary font-normal"
            }`}
          >
            <MdColorLens />
            <NavLink className="text-xs font-medium w-full" to="/dashboard/brandingTheme">
              Branding Theme
            </NavLink>
          </li>
        </>
      )}

      <li className="text-[#082431] text-xs font-normal opacity-50 p-4 uppercase">Others</li>

      {hasPermission(permissions, "settings") && (
        <li
          className={`flex flex-col md:flex-row gap-1 md:gap-2 items-center rounded p-2 ${
            settingsMatch ? "bg-primary bg-opacity-10 text-primary" : "text-secondary font-normal"
          }`}
        >
          <LuSettings />
          <NavLink className="text-xs font-medium w-full" to="/dashboard/settings">
            Settings
          </NavLink>
        </li>
      )}

      {hasPermission(permissions, "notification") && (
        <li
          className={`flex flex-col md:flex-row gap-1 md:gap-2 items-center rounded p-2 ${
            equbTypeMatch ? "bg-primary bg-opacity-10 text-primary" : "text-secondary font-normal"
          }`}
        >
          <LuBanknote />
          <NavLink className="text-xs font-medium w-full" to="/dashboard/notifications">
            Withdraws
          </NavLink>
        </li>
      )}
    </ul>
  );

  return (
    <div className="bg-[#4B9B41] bg-opacity-10 h-full fixed top-0 left-0 w-24 md:w-52 flex flex-col p-4 font-poppins overflow-auto">
      <div className="mt-2">
        <NavLink to="/dashboard/home">
          <img
              className="mb-4 h-16 w-auto"
              src={logoLight ? `${import.meta.env.VITE_BACKEND_URL}/images/branding/${logoLight}` : defaultLogo}
              alt="logo"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultLogo;
              }}
          />
        </NavLink>
      </div>
      <nav>{adminNavigation}</nav>
    </div>
  );
};

export default Sidebar;