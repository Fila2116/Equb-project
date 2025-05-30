/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  clearError,
  fetchUsers,
} from "../../../store/features/admin/user/usersSlice";
import Pagination from "../../layout/Pagination";
import { Link } from "react-router-dom";
import ConnectionErrorPage from "../../../utils/ErrorPage";
import Loader from "../../../utils/Loader";

const ApprovedUsers: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, totalPages, isLoading, error } = useAppSelector(
    (state) => state.users
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    dispatch(fetchUsers({ page: currentPage, limit: itemsPerPage }) as any);
  }, [dispatch, currentPage, itemsPerPage]);

  // For clearing error message
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // handle items perpage
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    dispatch(fetchUsers({ page: currentPage, limit: newItemsPerPage }) as any);
  };
  if (error) {
    return <ConnectionErrorPage error={error} />;
  }

  return (
    <div className="min-w-fit my-2">
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
                Joined Date
              </th>
              <th scope="col" className="px-6 py-3 text-xs border border-r">
                Joined Equbs
              </th>
              <th scope="col" className="px-6 py-3 text-xs border border-r">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <th colSpan={4} className="text-center">
                  <Loader />
                </th>
              </tr>
            ) : (
              <>
                {users && users.length ? (
                  users.map((user, index: number) => (
                    <tr
                      key={user.id}
                      className="bg-white border-b bg-gray-90 border-gray-300 border border-r"
                    >
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 text-xs border border-r"
                      >
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </th>
                      <td className="px-6 py-4 text-xs text-gray-900 border border-r">
                        {user.fullName}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-900 border border-r">
                        {user.phoneNumber}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-900 border border-r">
                        {user.createdAt}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-900 border border-r">
                        {user.joinedEqubs?.length}
                      </td>
                      <td className="text-center relative">
                        <Link
                          to={`/dashboard/users/${user.id}`}
                          className="px-4 py-2 rounded hover:underline text-green-500 "
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <th colSpan={4} className="py-6 text-center">
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
    </div>
  );
};

export default ApprovedUsers;
