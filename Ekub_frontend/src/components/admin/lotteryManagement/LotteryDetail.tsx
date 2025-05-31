// import { Link } from 'react-router-dom';
import withMainComponent from "../../layout/withMainComponent";

import { useEffect, useState } from "react";
import Members from "./Members";
import Popup from "../../layout/Popup";
import LiveEqubSet from "./LiveEqubSet";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchEqub,
  fetchEqubProfileStats,
} from "../../../store/features/admin/equb/equbSlice";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { clearSuccessMessage } from "../../../store/features/admin/equb/equbTypeSlice";
import ConnectionErrorPage from "../../../utils/ErrorPage";
import { FiArrowLeft } from "react-icons/fi";
import { formatCurrencyWithSymbolAfter } from "../../../utils/currencyFormatter";

function LotteryDetail() {
  const [showCreatePopup, setShowCreatePopup] = useState<boolean>(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  useEffect(() => {
    if (id) {
      dispatch(fetchEqub(id));
    }
  }, [id, dispatch]);
  useEffect(() => {
    if (id) {
      dispatch(fetchEqubProfileStats(id));
    }
  }, [id, dispatch]);

  const { equb, equbProfile, error, successMessage } = useAppSelector(
    (state) => state.equbs
  );
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearSuccessMessage());
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage, dispatch]);

  // console.log("equb i got", equb);

  if (error) {
    return <ConnectionErrorPage error={error} />;
  }
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // console.log("equbProfile?.totalPaidAmount!", equbProfile?.totalPaidAmount!);
  return (
    <div>
      {equb && (
        <>
          {/* <h1>Data for ID: {id}</h1> */}
          <div
            className={`flex flex-col m-8 bg-white p-2 ${
              equb.equbCategory?.name === "Travel"
                ? "bg-gradient-to-r from-blue-100 via-white to-green-100"
                : "bg-white"
            } `}
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-green-500 hover:text-green-600 transition-colors duration-300 space-x-2  rounded-lg p-2 w-20 shadow-md hover:shadow-lg"
            >
              <FiArrowLeft className="text-2xl" />
              <span className="font-semibold">Back</span>
            </button>
            <div className="flex justify-between mb-5">
              <div className="font-medium text-[#383E49] mb-2 py-3">
                {equb.name}
              </div>

              {equb.status === "completed" ? (
                <button className="py-1 px-3 border-green-500 bg-InActiveBtn rounded-md text-[#DF0404]">
                  completed
                </button>
              ) : equb.equbCategory?.name === "Travel" ? (
                <div className="flex items-center justify-between px-4 py-2 border rounded-md bg-white shadow-sm my-2 transition-all duration-200 ease-in-out hover:shadow-md gap-2">
                  <p className="text-white px-3 py-1 rounded-md bg-[#4B9B41] text-sm font-medium">
                    End Date:
                  </p>
                  <div className="text-[#4B9B41] text-base font-semibold">
                    {formatDate(equb.endDate || "")}
                  </div>
                </div>
              ) : (
                <div
                  className="flex items-center gap-2 border rounded-md w-[185px] h-[40px] bg-[#4B9B41] text-center text-white text-sm cursor-pointer my-2"
                  onClick={() => setShowCreatePopup(true)}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-3"
                  >
                    <path
                      d="M2 16.1C2.96089 16.296 3.84294 16.7702 4.53638 17.4636C5.22982 18.1571 5.70403 19.0391 5.9 20M2 12.05C4.03079 12.2759 5.92428 13.186 7.36911 14.6309C8.81395 16.0757 9.72414 17.9692 9.95 20M2 8V6C2 5.46957 2.21071 4.96086 2.58579 4.58579C2.96086 4.21071 3.46957 4 4 4H20C20.5304 4 21.0391 4.21071 21.4142 4.58579C21.7893 4.96086 22 5.46957 22 6V18C22 18.5304 21.7893 19.0391 21.4142 19.4142C21.0391 19.7893 20.5304 20 20 20H14"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 20H2.01"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <p>Schedule</p>
                </div>
              )}
            </div>

            <div className="flex justify-between p-3 md:p-0 gap-x-2 md:gap-x-0 overflow-x-auto">
              <div className="flex flex-col gap-y-2">
                <p className="text-[#1570EF] font-semibold ">Total Members</p>
                <p className="font-semibold text-[#5D6679]">
                  {equbProfile?.totalMembers}
                </p>
                <p className="text-[#858D9D] text-sm">Active Equbers</p>
              </div>
              <div className="flex flex-col gap-y-2 gap-x-2 md:gap-x-0 ">
                <p className="text-[#E19133] font-semibold">Total Paid</p>
                <div className="flex justify-between md:gap-12 gap-4">
                  <div className="font-semibold text-[#5D6679]">
                    {formatCurrencyWithSymbolAfter(
                      equbProfile?.totalPaidAmount!,
                      "ETB",
                      "am-ET"
                    )}
                  </div>
                  <div className="font-semibold text-[#5D6679]">
                    {equbProfile?.totalPaidMembers}
                  </div>
                </div>
                <div className="flex justify-between md:gap-12 gap-4">
                  <div className="text-[#858D9D] text-sm">Amounts</div>
                  <div className="text-[#858D9D] text-sm">Members</div>
                </div>
              </div>
              <div className="flex flex-col gap-y-2 gap-x-2 md:gap-x-0">
                <p className="text-[#845EBC] font-semibold ">Round</p>
                <div className="flex justify-between md:gap-12 gap-4">
                  <div className="font-semibold text-[#5D6679]">
                    {equbProfile?.currentRound}
                  </div>
                  <div className="font-semibold text-[#5D6679]">
                    {formatCurrencyWithSymbolAfter(
                      equbProfile?.equbAmount!,
                      "ETB",
                      "am-ET"
                    )}
                  </div>
                </div>
                <div className="flex justify-between md:gap-12 gap-4">
                  <div className="text-[#858D9D] text-sm">
                    {equb?.numberOfEqubers! - equbProfile?.currentRound!} Rounds
                    left
                  </div>
                  <div className="text-[#858D9D] text-sm">Amount</div>
                </div>
              </div>
              <div className="flex flex-col gap-y-2 gap-x-2 md:gap-x-0">
                <p className="text-[#F36960] font-semibold">UnPaid</p>
                <div className="flex justify-between md:gap-12 gap-4">
                  <div className="font-semibold text-[#5D6679]">
                    {equbProfile?.totalUnPaidMembers}
                  </div>
                  <div className="font-semibold text-[#5D6679]">
                    {formatCurrencyWithSymbolAfter(
                      equbProfile?.totalUnPaidAmount!,
                      "ETB",
                      "am-ET"
                    )}
                  </div>
                </div>
                <div className="flex justify-between md:gap-12 gap-4 text-sm">
                  <div className="text-[#858D9D]">Members</div>
                  <div className="text-[#858D9D]">Amounts</div>
                </div>
              </div>
            </div>
          </div>

          {showCreatePopup && (
            <Popup
              title="Live Equb Setup"
              open={showCreatePopup}
              setOpen={setShowCreatePopup}
            >
              <LiveEqubSet setOpen={setShowCreatePopup} />
            </Popup>
          )}
          <Members equbName={equb.equbCategory?.name || ""} />
        </>
      )}
    </div>
  );
}

export default withMainComponent(LotteryDetail);
