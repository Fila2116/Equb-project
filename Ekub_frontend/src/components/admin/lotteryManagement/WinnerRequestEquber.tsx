import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  fetchEquber,
  updateMarkAsPaid,
} from "../../../store/features/admin/equber/equberSlice";
import { TiTick } from "react-icons/ti";
import dayjs from "dayjs";
import { imageUrl } from "../../../utils/imageUrl";
import { MdClose } from "react-icons/md";
import { formatCurrencyWithSymbolAfter } from "../../../utils/currencyFormatter";

function MemberProfile() {
  const { equber } = useAppSelector((state) => state.equbers);
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(fetchEquber(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (equber) {
      if (equber?.users?.length > 0) {
        const isTaken = equber.users[selectedUserIndex]?.hasTakenEqub ?? false;
        setMarkingPaid(isTaken);
      }
    }
  }, [equber, selectedUserIndex]);

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUserIndex(Number(event.target.value));
  };

  const markAsPaid = () => {
    dispatch(
      updateMarkAsPaid({
        id: equber?.users[selectedUserIndex].id!,
        reference: referenceNumber,
      })
    ).then(() => {
      setMarkingPaid(true);
      setIsModalOpen(false);
    });
  };

  const selectedUser = equber?.users[selectedUserIndex]?.user;
  const avatarImg = equber?.users[selectedUserIndex]?.user?.avatar;
  const bankAccounts = equber?.users?.[selectedUserIndex]?.user?.bankAccounts;
  const primaryAccount = bankAccounts?.find((account) => account.isPrimary);
  const accountName =
    primaryAccount?.accountName || bankAccounts?.[0]?.accountName;
  const accountNumber =
    primaryAccount?.accountNumber || bankAccounts?.[0]?.accountNumber;
  const calculatedPaidAmount =
    equber?.users[selectedUserIndex]?.calculatedPaidAmount;

  return (
    <div className="flex justify-between p-6">
      {calculatedPaidAmount !== undefined && (
        <div className="mb-4">
          <p className="text-[#858D9D] w-32">Calculated Payable Amount</p>
          <p className="text-[#5D6679]">
            {formatCurrencyWithSymbolAfter(
              calculatedPaidAmount,
              "ETB",
              "am-ET"
            )}
          </p>
        </div>
      )}

      {equber && (
        <>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Select User:
            </label>
            <div className="relative">
              <select
                value={selectedUserIndex}
                onChange={handleUserChange}
                className="appearance-none w-full bg-gray-50 border border-gray-300 text-gray-700 py-2 px-3 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
              >
                {equber.users.map((user, index) => (
                  <option key={user.id} value={index}>
                    {user.user?.fullName || `User ${index + 1}`}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M7 10l5 5 5-5H7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-36">
              <p className="text-[#858D9D] w-32">Equber Name</p>
              <p className="text-[#5D6679]">{selectedUser?.fullName}</p>
            </div>
            <div className="flex gap-36">
              <p className="text-[#858D9D] w-32">Phone Number</p>
              <p className="text-[#5D6679]">{selectedUser?.phoneNumber}</p>
            </div>
            <div className="flex mb-5 gap-36">
              <p className="text-[#858D9D] w-32">Joined Date</p>
              <p className="text-[#5D6679]">
                {dayjs(selectedUser?.createdAt).format("MMM DD YYYY")}
              </p>
            </div>
            <div>
              <h3>Financial information {primaryAccount ? "(Primary)" : ""}</h3>
            </div>
            <div className="flex gap-36">
              <p className="text-[#858D9D] w-32">Account Name</p>
              <p className="text-[#5D6679]">{accountName}</p>
            </div>
            <div className="flex gap-36">
              <p className="text-[#858D9D] w-32">Account Number</p>
              <p className="text-[#5D6679]">{accountNumber}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 align-top">
            <div className="align-top text-start">
              {avatarImg ? (
                <img
                  src={imageUrl("avatar", avatarImg)}
                  alt={equber.users[selectedUserIndex].user.firstName}
                  className="w-16 h-16 object-cover"
                />
              ) : (
                <img
                  className="h-16 w-16"
                  src="https://imgs.search.brave.com/6NxPLF_oNh9O5A-VfVuQ_NqPrV2DqRZ9pcRhi3Fn3jQ/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/dmVjdG9yc3RvY2su/Y29tL2kvcHJldmll/dy0xeC8zNy81My9w/ZXJzb24tZ3JheS1w/aG90by1wbGFjZWhv/bGRlci1tYW4tdmVj/dG9yLTI0MzgzNzUz/LmpwZw"
                  alt=""
                />
              )}
            </div>
            <div className="flex justify-between gap-4">
              <p className="text-[#858D9D]">isVerified</p>
              {selectedUser?.isVerified ? (
                <TiTick className="text-green-500 text-xl" />
              ) : (
                <MdClose className="text-red-500 text-xl" />
              )}
            </div>
            <div className="text-end">
              {equber.users[selectedUserIndex].hasClaimed &&
                (markingPaid ? (
                  <button
                    className="bg-gray-300 text-gray-600 rounded-lg p-2 pl-4 pr-4 cursor-not-allowed"
                    disabled
                  >
                    Paid
                  </button>
                ) : (
                  <button
                    className="bg-[#149D52] text-white rounded-lg p-2 pl-4 pr-4 hover:bg-green-600 transition-colors"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Mark as paid
                  </button>
                ))}
            </div>
          </div>
        </>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <h2 className="text-lg font-bold mb-4">Enter Reference Number</h2>
            <input
              type="text"
              placeholder="Reference Number"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="border border-gray-300 p-2 rounded-md w-full mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-md"
                onClick={markAsPaid}
                disabled={!referenceNumber}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberProfile;
