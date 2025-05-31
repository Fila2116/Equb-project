/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState, FC } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { logout } from "../../store/features/admin/auth/authSlice";
import { MdLogout } from "react-icons/md";
import { FaAngleDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import noAvator from "../../assets/no avator.jpg";
import { imageUrl } from "../../utils/imageUrl";

const Header: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  useOutsideAlerter(wrapperRef, setOpen);
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="bg-white h-16 w-full relative font-poppins">
      <div className="flex justify-between gap-2 items-center h-full mx-6">
        <div>
          <p className="text-sm font-semibold text-black font-poppins">
            Welcome back, {user?.firstName}
          </p>
        </div>
        <div ref={wrapperRef}>
          <div className="flex justify-between items-center flex-row gap-2">
            <div className="w-6 h-6 bg-white rounded-full border-[#D9D9D9] border-2 overflow-hidden">
              {user?.avatar && user.avatar !== "" ? (
                <img
                  src={imageUrl("avatar", user.avatar)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={noAvator}
                  alt="Default Profile"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="text-sm font-semibold text-black">
              {user?.fullName}
            </div>
            <button
              onClick={() => setOpen(!open)}
              className="text-slate-500 hover:text-slate-600 transition-colors"
            >
              <FaAngleDown />
            </button>
          </div>
          {open && (
            <div className="z-10 absolute right-4 top-[72px] bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-44">
              <ul
                className="py-2 text-sm text-gray-800"
                aria-labelledby="dropdownDefaultButton"
              >
                <li>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 hover:bg-gray-100 flex gap-2 items-center w-full"
                  >
                    <MdLogout /> Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;

/**
 * Hook that closes dropdown if clicked outside of the passed ref
 */
function useOutsideAlerter(
  ref: React.RefObject<HTMLDivElement>,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, setOpen]);
}
