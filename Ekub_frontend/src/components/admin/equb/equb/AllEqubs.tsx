/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { MdDelete } from "react-icons/md";

// import { CiFlag1 } from "react-icons/ci";

import { useAppDispatch, useAppSelector } from "../../../../store/store";
import {
  closeEqub,
  deleteEqub,
  Equb,
  fetchAllEqubs,
} from "../../../../store/features/admin/equb/equbSlice";
import Pagination from "../../../layout/Pagination";
import { FaRegEdit } from "react-icons/fa";
// import { IoSearchSharp } from "react-icons/io5";
import Popup from "../../../layout/Popup";
import EditEqub from "./EditEqub";
import ConnectionErrorPage from "../../../../utils/ErrorPage";
import Loader from "../../../../utils/Loader";
// import RegisteredUsers from "../../users/registeredUsers";
// import RunningEqubs from "./RunningEqubs";
// import ClosedEqubs from "./ClosedEqubs";
// import RegisteringEqubs from "./RegisteringEqubs";
interface AllEqubsProps {
  searchTerm: string;
  equbTypeFilter: "Daily" | "Weekly" | "Monthly" | "all";
  equbTypeCategory: "Finance" | "Special Finance" | "Finance and Other" | "all";
}

// const register = () => <div></div>

const FetchAllEqubs: React.FC<AllEqubsProps> = ({
  searchTerm,
  equbTypeFilter,
  equbTypeCategory,
}) => {
  // const [status, setStatus] = useState("all");
  const dispatch = useAppDispatch();
  const { allEqubs, totalPages, isLoading, error } = useAppSelector(
    (state) => state.equbs
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editEqub, setEditEqub] = useState<Equb | null>(null);
  const [showEditPopup, setShowEditPopup] = useState<boolean>(false);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [closePopup, setClosePopup] = useState(false);
  const [equbToClose, setEqubToClose] = useState<string | null>(null);
  const [deletePopup, setDeletePopup] = useState(false);
  const [equbTodelete, setEqubToDelete] = useState<string | null>(null);

  // console.log("equbTypeFilter", equbTypeFilter);
  // console.log("equbTypeCategory", equbTypeCategory);

  useEffect(() => {
    dispatch(
      fetchAllEqubs({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        equbCategory: equbTypeCategory,
        equbType: equbTypeFilter,
      }) as any
    );
  }, [
    dispatch,
    currentPage,
    itemsPerPage,
    searchTerm,
    equbTypeCategory,
    equbTypeFilter,
  ]);

  const handleEdit = (equb: Equb) => {
    setEditEqub(equb);
    setShowEditPopup(true);
  };

  const handleClose = (id: string) => {
    setEqubToClose(id);
    setClosePopup(true);
  };
  const handleDelete = (id: string) => {
    setEqubToDelete(id);
    setDeletePopup(true);
  };

  const confirmCloseEqub = () => {
    if (equbToClose) {
      dispatch(closeEqub({ id: equbToClose }));
      dispatch(
        fetchAllEqubs({
          page: currentPage,
          limit: itemsPerPage,
          equbCategory: equbTypeCategory,
          equbType: equbTypeFilter,
        }) as any
      );
      setClosePopup(false);
      setEqubToClose(null);
    }
  };
  const confirmDeleteEqub = async () => {
    if (equbTodelete) {
      await dispatch(deleteEqub({ id: equbTodelete }));
      await dispatch(
        fetchAllEqubs({ page: currentPage, limit: itemsPerPage }) as any
      );
      setDeletePopup(false);
      setEqubToDelete(null);
    }
  };

  // const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setStatus(e.target.value);
  // };

  // handle items perpage
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    dispatch(
      fetchAllEqubs({ page: currentPage, limit: newItemsPerPage }) as any
    );
  };

  // // Filter the equbs by search term and selected equb type
  // const filteredEqubs = allEqubs.filter((equb) => {
  //   const matchesSearch = equb.name
  //     ?.toLowerCase()
  //     .includes(searchTerm.toLowerCase());
  //   const matchesType =
  //     equbTypeFilter === "all" || equb.equbType?.name === equbTypeFilter;
  //   const matchesCategory =
  //     equbTypeCategory === "all" ||
  //     equb.equbCategory?.name === equbTypeCategory;
  //   return matchesSearch && matchesType && matchesCategory;
  // });
  if (error) {
    return <ConnectionErrorPage error={error} />;
  }

  return (
    <div className="min-w-fit my-2 bg-white p-8 rounded-lg">
      {}
      {/* <div className="flex justify-between mb-3 ">
        <div className="flex flex-col gap-y-2">
          <h1 className="font-bold size-[22px] w-32">All Equbs</h1>
          <p className="text-[#16C098]">All Active Equbs</p>
        </div>
        {
          <div className="relative h-[30px] rounded-lg p-1  ">
           
            <CiFlag1 className=" absolute top-4 left-3" />
            <select
              name=""
              id=""
              value={status}
              className="rounded-lg hover:outline-none outline-none border-[1px] bg-[#F9FBFF] h-[38px] pl-8"
              onChange={(e) => handleSelect(e)}
            >
              <option value=""> status </option>
              <option value="all">All Equbs </option>
              <option value="register">Regestering</option>
              <option value="running"> Running</option>
              <option value="close"> Closed</option>
            </select>
            
          </div>
        }
        <div className="relative  ">
          <IoSearchSharp className="absolute top-3 left-3 text-gray-400 " />
          <input
            type="text"
            placeholder="Search"
            className="pl-10 rounded-lg bg-[#F9FBFF] h-[38px]  outline-none border-[1px]"
          />
        </div>
        <div className="relative  ">
          <p className="absolute top-2  left-3 text-gray-400">Sort By:</p>
          <select
            name=""
            id=""
            className="pl-20 rounded-lg bg-[#F9FBFF] h-[38px]  outline-none border-[1px]"
          >
            <option value="">Newest</option>
          </select>
        </div>
      </div> */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg m-1 p-2 ">
        <table className="w-full text-sm text-left text-gray-800 min-h-30">
          <thead className="text-xs text-slate-500 bg-gray-50">
            <tr>
              <th scope="col" className=" px-6 py-3 text-xs border border-r">
                Equb Name
              </th>
              <th scope="col" className=" px-6 py-3 text-xs border border-r">
                Equb Type
              </th>
              <th scope="col" className=" px-6 py-3 text-xs border border-r">
                Equb Category
              </th>
              <th scope="col" className=" px-6 py-3 text-xs border border-r">
                Start Date
              </th>
              <th scope="col" className=" px-6 py-3 text-xs border border-r">
                End Date
              </th>
              <th scope="col" className=" px-6 py-3 text-xs border border-r">
               Next Round Date
              </th>
              <th scope="col" className=" px-6 py-3 text-xs border border-r">
                Branch
              </th>
              <th scope="col" className=" px-6 py-3 text-xs border border-r">
                Close Equb
              </th>
              <th scope="col" className=" px-6 py-3 text-xs border border-r">
                Status
              </th>
              <th scope="col" className=" px-6 py-3 text-xs border border-r">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <th colSpan={7} className="text-center">
                  <Loader />
                </th>
              </tr>
            ) : (
              <>
                {allEqubs.length ? (
                  allEqubs.map((equb) => (
                    <tr
                      key={equb.id}
                      className="bg-white border-b bg-gray-90 border-gray-300 border border-r"
                    >
                      <th
                        scope="row"
                        className={`px-6 py-4 font-medium text-gray-900 text-xs border border-r`}
                      >
                        {equb.name}
                      </th>
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 text-xs border border-r"
                      >
                        {equb.equbType?.name}
                      </th>
                      <td className="px-6 py-4 text-xs text-gray-900 border border-r">
                        {equb.equbCategory?.name}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-900 border border-r">
                        {equb.startDate
                          ? dayjs(equb.startDate).format("MMM DD YYYY")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-900 border border-r">
                        {equb.endDate
                          ? dayjs(equb.endDate).format("MMM DD YYYY")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-900 border border-r">
                        {equb.nextRoundDate
                          ? dayjs(equb.nextRoundDate).format("MMM DD YYYY")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-900 border border-r">
                        {equb.branch?.name}
                      </td>
                      <td className="text-center relative">
                        <button
                          onClick={() => handleClose(equb.id)}
                          className={`px-4 py-2 rounded ${
                            equb.status === "completed"
                              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                              : "bg-red-500 text-white hover:bg-red-700 transition duration-300 ease-in-out transform hover:scale-110 shadow-lg"
                          }`}
                          disabled={equb.status === "completed"}
                        >
                          {equb.status === "completed" ? "Closed" : "Close"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-900 border border-r">
                        <button
                          className={`rounded-sm py-1 px-3 border-green-500 ${
                            equb.status === "started"
                              ? "bg-ActiveBtn bg-opacity-40 text-[#008767]"
                              : equb.status === "registering"
                              ? "bg-RegisteringBtn text-[#008767]"
                              : "bg-InActiveBtn text-[#DF0404]"
                          }`}
                        >
                          {equb.status}
                        </button>
                      </td>
                      <td className="text-center relative flex ">
                        <button
                          onClick={() => handleEdit(equb)}
                          className="px-4 py-2 rounded hover:underline text-primary mx-2 transition duration-300 ease-in-out transform hover:scale-110"
                        >
                          <FaRegEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(equb.id)}
                          className="px-4 py-2 rounded hover:underline text-red-600 mx-2 transition duration-300 ease-in-out transform hover:scale-110"
                        >
                          <MdDelete size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr>
                      <th colSpan={6} className="py-6 text-center">
                        No Equbs
                      </th>
                    </tr>
                  </>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        itemsPerPage={itemsPerPage}
      />
      {showEditPopup && editEqub && (
        <Popup
          title="Edit Equb"
          open={showEditPopup}
          setOpen={setShowEditPopup}
        >
          <EditEqub equb={editEqub} setOpen={setShowEditPopup} />
        </Popup>
      )}
      {closePopup && (
        <Popup title="Close Equb" open={closePopup} setOpen={setClosePopup}>
          <div className="flex flex-col gap-4">
            <h1 className="text-center text-xl font-bold">
              Are you sure you want to close this Equb?
            </h1>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setClosePopup(false)}
                className="bg-green-500 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmCloseEqub}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </Popup>
      )}
      {deletePopup && (
        <Popup title="Delete Equb" open={deletePopup} setOpen={setDeletePopup}>
          <div className="flex flex-col gap-4">
            <h1 className="text-center text-xl ">
              Are you sure you want to delete this Equb? All information related
              to this Equb will be deleted. Please be careful.
            </h1>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeletePopup(false)}
                className="bg-green-500 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteEqub}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </Popup>
      )}
      {/* {renderComponents()} */}
    </div>
  );
};

export default FetchAllEqubs;

// {
//   deleteBankId && (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50">
//       <div className="bg-white p-6 rounded-lg shadow-lg">
//         <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
//         <p className="mb-4">Are you sure you want to delete this bank?</p>
//         <div className="flex justify-end">
//           <button
//             onClick={() => setDeleteBankId(null)}
//             className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={confirmDelete}
//             className="bg-red-500 text-white px-4 py-2 rounded"
//             disabled={isDeleting}
//           >
//             {isDeleting ? "Deleting..." : "Delete"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
