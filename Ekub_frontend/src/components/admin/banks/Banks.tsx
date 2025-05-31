import { useEffect, useState } from "react";
import withMainComponent from "../../layout/withMainComponent";
import { MdAdd } from "react-icons/md";
import { hasPermission } from "../../../utils/hasPermission";
import { Link, useLocation } from "react-router-dom";
import FetchBanks from "./FetchBanks";
import Popup from "../../layout/Popup";
import CreateBank from "./CreateBank";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { clearSuccessMessage } from "../../../store/features/admin/roles/rolesSlice";
import CompanyBanks from "./CompanyBanks";
import CreateCompanyBank from "./CreateCompanyBank";
import ConnectionErrorPage from "../../../utils/ErrorPage";

const Banks = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [activeLink, setActiveLink] = useState<"companyBank" | "bankList">(
    "bankList"
  );
  const [isLinkSet, setIsLinkSet] = useState<boolean>(false);
  const location = useLocation();
  const { error, successMessage } = useAppSelector((state) => state.banks);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    const tab = searchParams.get("tab");
    setActiveLink(tab === "companyBank" ? "companyBank" : "bankList");
    setIsLinkSet(true);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearSuccessMessage());
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage, dispatch]);

  if (error) {
    return <ConnectionErrorPage error={error} />;
  }
  return (
    <div className="p-4 my-2  rounded-sm mx-4 ">
      <h2 className="text-2xl font-medium text-black font-poppins  leading-9">
        Bank Managment
      </h2>
      <div className="flex justify-between items-center my-3 w-full">
        <div className="flex gap-2 w-full">
          <Link
            to={"/dashboard/banks?tab=bankList"}
            onClick={() => {
              setActiveLink("bankList");
            }}
            className={`px-8 py-4 cursor-pointer w-fit bg-white font-medium text-base ${
              activeLink === "bankList" ? "text-primary" : "text-gray-400"
            } `}
          >
            Bank List
          </Link>
          {hasPermission(["all"], "") && (
            <Link
              to={"/dashboard/banks?tab=companyBank"}
              onClick={() => {
                setActiveLink("companyBank");
              }}
              className={`px-8 py-4 cursor-pointer w-fit bg-white font-medium text-base ${
                activeLink === "companyBank" ? "text-primary" : "text-gray-400"
              } `}
            >
              Company Bank
            </Link>
          )}
        </div>
        <div className="flex items-center w-full justify-end ">
          {activeLink === "bankList" && (
            <button
              onClick={() => setShowPopup(true)}
              className="flex items-center gap-2 bg-primary hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md text-sm"
            >
              <MdAdd color="#fff" /> Add Bank
            </button>
          )}

          {activeLink === "companyBank" && (
            <button
              onClick={() => setShowPopup(true)}
              className="flex items-center gap-2 bg-[#15803d] hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md text-sm"
            >
              <MdAdd color="#fff" /> Add Company Bank
            </button>
          )}
        </div>
      </div>
      <div className="">
        {successMessage && (
          <p className="text-green-500 items-center text-center">
            {successMessage}
          </p>
        )}
        {isLinkSet && activeLink === "bankList" && <FetchBanks />}
        {isLinkSet && activeLink === "companyBank" && <CompanyBanks />}
        {/* {isLinkSet && activeLink === 'bankList' && <NotApprovedBrokers   />} */}
      </div>
      <Popup
        title="Add Bank"
        open={showPopup && activeLink === "bankList"}
        setOpen={setShowPopup}
      >
        <CreateBank setOpen={setShowPopup} />
      </Popup>
      <Popup
        title="Add Company Bank"
        open={showPopup && activeLink === "companyBank"}
        setOpen={setShowPopup}
      >
        <CreateCompanyBank />
      </Popup>
    </div>
  );
};

export default withMainComponent(Banks);
