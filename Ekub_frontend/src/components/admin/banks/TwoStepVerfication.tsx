import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { verifyAdmin } from "../../../store/features/admin/banks/banksSlice";
import { SendOtpToAdmin } from "../../../store/features/admin/banks/banksSlice";
import { useNavigate } from "react-router-dom";
import { MdClose } from "react-icons/md";
// import { Link } from "react-router-dom";
import ConnectionErrorPage from "../../../utils/ErrorPage";

const TwoStepVerification: React.FC = () => {
  const { isLoading, error } = useAppSelector((state) => state.banks);
  const dispatch = useAppDispatch();
  const [otpCode, setOtpCode] = useState("");
  const [openInput, setSetOpenInput] = useState(false);
  const [isSendOtp, setIsSendOtp] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(verifyAdmin(otpCode));
  };
  if (error) {
    return <ConnectionErrorPage error={error} />;
  }
  const handleCloseClick = () => {
    navigate("/dashboard/banks");
    window.location.reload(); // Forces full page reload
  };
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsSendOtp(true);
        await dispatch(SendOtpToAdmin());
        setIsSendOtp(false);
        setSetOpenInput(true);
        if (error) {
          setIsSendOtp(false);
        }
    };
  return (
    <div
      className={` fixed inset-0 z-50 overflow-auto bg-gray-600 bg-opacity-50 flex justify-center items-center`}
    >
      <div className="relative flex flex-col items-center shadow-lg p-6 bg-white rounded-lg max-w-2xl w-full mx-4 sm:mx-0 max-h-vh-60 overflow-y-auto pb-4">
        <div className="flex items-center justify-between w-full border-b-2 pb-4 mb-6">
          <h6 className="text-xl font-semibold text-gray-900">
            Two step verification
          </h6>
          <button
            onClick={handleCloseClick}
            className="text-gray-400 hover:text-red-500 focus:outline-none"
          >
            <MdClose size={24} />
          </button>
        </div>
        <div className="w-full">
          
          <div className="flex items-center justify-between">
            <button
              className={`bg-[#15803D] hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading && "opacity-50 cursor-not-allowed"
                }`}
              type="submit"
              disabled={isSendOtp}
              onClick={handleClick} // Add your function here
            >
              {!openInput && (
              isSendOtp ? "Otp Sending..." : "Otp Code"
              )}
              {openInput &&(
              isSendOtp ? "Re-Sending Otp..." : "Re-Send Otp Code"
              )}
            </button>
          </div>
          
          {openInput && (
            <><div className="flex items-center justify-between mt-4">
              <p className="text-gray-700 text-sm font-bold mb-2">
                Enter the OTP sent to admin phone
              </p>
            </div><div>
                <form onSubmit={handleSubmit}>


                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="name"
                    >
                      Otp Code
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="name"
                      type="otpCode"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      required />
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      className={`bg-[#15803D] hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading && "opacity-50 cursor-not-allowed"}`}
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? "Verifying..." : "Verify"}
                    </button>
                  </div>
                </form>
              </div></>
          )}

        </div>
      </div>
    </div>
  );
};

export default TwoStepVerification;
