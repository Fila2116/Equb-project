/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { fetchUsers, clearError, updateUserApproval } from "../../../store/features/admin/user/usersSlice";
import Pagination from "../../layout/Pagination";
import { MdEdit } from "react-icons/md";
import ConnectionErrorPage from "../../../utils/ErrorPage";
import Loader from "../../../utils/Loader";

const RegisteredUsers: React.FC = () => {
  const dispatch = useAppDispatch();
  const { registered, totalPages, isLoading, error } = useAppSelector((state) => state.users);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    dispatch(fetchUsers({ page: currentPage, limit: itemsPerPage }) as any);
  }, [dispatch, currentPage, itemsPerPage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleEdit = (userId: string, decision: string) => {
    dispatch(updateUserApproval({ id: userId, decision }) as any);
  };

  // handle items perpage
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    dispatch(fetchUsers({ page: currentPage, limit: newItemsPerPage }) as any);
  };

   if (error) {
     return <ConnectionErrorPage error={error}/>;
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
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-xs border border-r">
                Email
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
                {registered && registered.length ? (
                  registered.map((user, index: number) => (
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
                        {user.email}
                      </td>
                      <td className="text-center relative">
                        <button
                          onClick={() => handleEdit(user.id, "approved")}
                          className="px-4 py-2 rounded hover:underline"
                        >
                          <MdEdit />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <th colSpan={4} className="py-6 text-center">
                      No Registered Users
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

export default RegisteredUsers;