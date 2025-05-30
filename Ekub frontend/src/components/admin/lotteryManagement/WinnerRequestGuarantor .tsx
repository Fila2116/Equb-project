import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  fetchEquber,
  updateMarkAsPaid,
} from "../../../store/features/admin/equber/equberSlice";
import { TiTick } from "react-icons/ti";
import { MdClose } from "react-icons/md";
import dayjs from "dayjs";
import { imageUrl } from "../../../utils/imageUrl";

function WinnerRequestGuarantor() {
  const { equber } = useAppSelector((state) => state.equbers);
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();

  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");

  // Fetch Equber Data on Component Mount
  useEffect(() => {
    if (id) {
      dispatch(fetchEquber(id));
    }
  }, [id, dispatch]);

  // Update `isMarkingPaid` State when User Selection Changes
  // useEffect(() => {
  //   const isPaid = equber?.users?.[selectedUserIndex]?.hasClaimed ?? false;
  //   // setIsMarkingPaid(isPaid);
  // }, [equber, selectedUserIndex]);

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUserIndex(Number(event.target.value));
  };

  const markAsPaid = () => {
    if (equber?.users?.[selectedUserIndex]?.id) {
      dispatch(
        updateMarkAsPaid({
          id: equber.users[selectedUserIndex].id!,
          reference: referenceNumber,
        })
      ).then(() => {
        // setIsMarkingPaid(true);
        setIsModalOpen(false);
      });
    }
  };

  const renderGuarantorInfo = () => {
    const user = equber?.users?.[selectedUserIndex];
    const guarantor = user?.guaranteeUser || user?.guarantee;

    if (!guarantor) {
      return (
        <div className="flex flex-col items-center justify-center h-80">
          <svg
            className="w-16 h-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6M12 6h.01M12 20.02v.01M20 12.02a8 8 0 11-16 0 8 8 0 0116 0z"
            ></path>
          </svg>
          <p className="text-gray-500 text-xl font-semi bold">
            No Guarantee Available
          </p>
          <p className="text-gray-400">
            Once a guarantee is available, it will be displayed here.
          </p>
        </div>
      );
    }

    const avatarImg = guarantor?.picture;
    const formattedDate = dayjs(guarantor.createdAt).format("MMM DD YYYY");

    return (
      <div className="flex justify-between p-6">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between gap-36 align-baseline">
            <p className="text-[#858D9D]">Guarantor Name</p>
            <p className="text-[#5D6679]">{guarantor.fullName || guarantor.firstName}</p>
          </div>
          <div className="flex gap-36">
            <p className="text-[#858D9D]">Phone Number</p>
            <p className="text-[#5D6679]">{guarantor.phoneNumber}</p>
          </div>
          <div className="flex justify-between mb-5">
            <p className="text-[#858D9D]">Joined Date</p>
            <p className="text-[#5D6679]">{formattedDate}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 align-top">
          <div className="align-top text-start">
            {avatarImg ? (
              <img
                src={imageUrl("guarantee", avatarImg)}
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
          <div className="flex justify-between mb-20">
            <p className="text-[#858D9D]">isVerified</p>
            {user?.user?.isVerified ? (
              <TiTick className="text-green-500 text-xl" />
            ) : (
              <MdClose className="text-red-500 text-xl" />
            )}
          </div>
          {/* <div className="text-end">
            {isMarkingPaid ? (
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
                Mark as Paid
              </button>
            )}
          </div> */}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col p-6">
      <div className="mb-4 outline-none">
        <label className="text-gray-700">Select User:</label>
        <select
          value={selectedUserIndex}
          onChange={handleUserChange}
          className="ml-2 border p-2 rounded"
        >
          {equber?.users?.map((user, index) => (
            <option key={user.id} value={index}>
              {user.user?.fullName || `User ${index + 1}`}
            </option>
          ))}
        </select>
      </div>
      {renderGuarantorInfo()}
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

export default WinnerRequestGuarantor;
