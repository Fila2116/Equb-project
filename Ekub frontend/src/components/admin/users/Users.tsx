import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  clearError,
  deleteUser,
  fetchUsers,
} from "../../../store/features/admin/user/usersSlice";
import Pagination from "../../layout/Pagination";
import { Link } from "react-router-dom";
import { IoSearchSharp } from "react-icons/io5";
import withMainComponent from "../../layout/withMainComponent";
import dayjs from "dayjs";
import { TiTick } from "react-icons/ti";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdClose, MdDelete } from "react-icons/md";
import ConnectionErrorPage from "../../../utils/ErrorPage";
import Loader from "../../../utils/Loader";
import Popup from "../../layout/Popup";

const Users: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, totalPages, isLoading, error } = useAppSelector(
    (state) => state.users
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [deletePopup, setDeletePopup] = useState(false);
  const [equbTodelete, setEqubToDelete] = useState<string | null>(null);

  // console.log("user", users);
  // console.log("endDate", endDate);

  useEffect(() => {
    dispatch(
      fetchUsers({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        startDate: startDate
          ? dayjs(startDate).format("YYYY-MM-DD")
          : undefined,
        endDate: endDate ? dayjs(endDate).format("YYYY-MM-DD") : undefined,
      }) as any
    );
  }, [dispatch, currentPage, itemsPerPage, searchTerm, startDate, endDate]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    dispatch(fetchUsers({ page: currentPage, limit: newItemsPerPage }) as any);
  };

  const handleDelete = (id: string) => {
    setEqubToDelete(id);
    setDeletePopup(true);
  };

  const confirmDeleteEqub = async () => {
    if (!equbTodelete) return;

    try {
      // Dispatch the delete action
      await dispatch(deleteUser({ id: equbTodelete }));

      // Refetch the updated list of users
      await dispatch(
        fetchUsers({
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          startDate: startDate
            ? dayjs(startDate).format("YYYY-MM-DD")
            : undefined,
          endDate: endDate ? dayjs(endDate).format("YYYY-MM-DD") : undefined,
        }) as any
      );

      // Close the delete confirmation popup and reset the selected user
      setDeletePopup(false);
      setEqubToDelete(null);
    } catch (error) {
      console.error("Error deleting the equb:", error);
    }
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };
  setStartDate
  const handleStatusFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStatusFilter(event.target.value);
  };

  const filteredUsers = users
    .filter((user: any) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (user: any) =>
        statusFilter === "" ||
        (statusFilter === "Verified" && user.isVerified) ||
        (statusFilter === "Unverified" && !user.isVerified)
    )
    .filter((user: any) => {
      if (startDate && endDate) {
        const userDate = dayjs(user.createdAt);
        return (
          userDate.isAfter(dayjs(startDate)) &&
          userDate.isBefore(dayjs(endDate))
        );
      }
      return true;
    });

  if (error) {
    return <ConnectionErrorPage error={error} />;
  }
  

  return (
    <div className="min-w-fit my-2">
      <h2 className="text-2xl font-medium text-black font-poppins ml-3 leading-9">
        Customers
      </h2>
      <div className="flex justify-between items-center p-4 border-b border-gray-300">
        <div className="flex items-center">
          <p className="text-[#7E7E7E] text-sm mr-2">Date range:</p>
          <DatePicker
            selected={startDate}
            onChange={handleDateChange}
            startDate={startDate!}
            endDate={endDate!}
            selectsRange
            className="p-2 rounded-md border border-gray-300 outline-none"
            placeholderText="Select date range"
          />
        </div>

        <div className="flex items-center">
          <p className="text-[#7E7E7E] text-sm mr-2">Status:</p>
          <select
            className="p-2 pl-3 pr-10 rounded-md border border-gray-300 outline-none"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="">All</option>
            <option value="Verified">Verified</option>
            <option value="Unverified">Unverified</option>
          </select>
        </div>

        <div className="relative">
          <IoSearchSharp
            className="absolute top-3 left-3 text-gray-400 opacity-60"
            size={20}
          />
          <input
            className="w-64 p-2 pl-10 rounded-md border border-gray-300 outline-none "
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg m-1 p-2 h-96">
        <table className="w-full text-sm text-left text-gray-800 min-h-30">
          <thead className="text-xs text-slate-500 bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-xs border border-r">
                No
              </th>
              <th scope="col" className="px-6 py-3 text-xs border border-r">
                Full Name
              </th>
              <th scope="col" className="px-6 py-3 text-xs border border-r">
                Phone Number
              </th>
              <th scope="col" className="px-6 py-3 text-xs border border-r">
                Email 
              </th>
              <th scope="col" className="px-6 py-3 text-xs border border-r">
                Joined Date
              </th>
              <th scope="col" className="px-6 py-3 text-xs border border-r">
                Joined Equbs
              </th>
              <th scope="col" className="px-6 py-3 text-xs border border-r">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-xs border border-r">
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
                {filteredUsers && filteredUsers.length ? (
                  filteredUsers.map((user: any, index: number) => (
                    <tr
                      key={user.id}
                      className="bg-white border-b border-gray-300"
                    >
                      <th scope="row" className="px-6 py-4 text-xs border">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </th>
                      <td className="px-6 py-4 text-xs">{user.fullName}</td>
                      <td className="px-6 py-4 text-xs">{user.phoneNumber}</td>
                      <td className="px-6 py-4 text-xs">{user.email!=""?user.email:"-"}</td>
                      <td className="px-6 py-4 text-xs">
                        {dayjs(user.createdAt).format("MMM DD YYYY")}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {user.joinedEqubs?.length}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {user.isVerified ? (
                          <TiTick className="text-green-500 text-xl" />
                        ) : (
                          <MdClose className="text-red-500 text-xl" />
                        )}
                      </td>
                      <td
                        className="text-center flex items-center
                        justify-center"
                      >
                        <Link
                          to={`/dashboard/users/${user.id}`}
                          className="px-4 py-2 text-green-500 hover:underline"
                        >
                          Open
                        </Link>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="px-4 py-2 rounded hover:underline text-red-600 mx-2 transition duration-300 ease-in-out transform hover:scale-110"
                        >
                          <MdDelete size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <th colSpan={7} className="py-6 text-center">
                      No Users
                    </th>
                  </tr>
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

      {deletePopup && (
        <Popup
          title="Customer User"
          open={deletePopup}
          setOpen={setDeletePopup}
        >
          <div className="flex flex-col gap-4">
            <h1 className="text-center text-xl ">
              Are you sure you want to delete this user? All information related
              to this user will be deleted. Please be careful.
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
    </div>
  );
};

export default withMainComponent(Users);
