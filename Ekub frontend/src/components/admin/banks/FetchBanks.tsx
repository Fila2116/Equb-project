/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Bank,
  fetchBanks,
  updateBank,
  toggleEditMode,
  DeleteBankList,
} from "../../../store/features/admin/banks/banksSlice";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import Pagination from "../../layout/Pagination";

import { FaRegEdit } from "react-icons/fa";
import ConnectionErrorPage from "../../../utils/ErrorPage";
import Loader from "../../../utils/Loader";
import { MdDelete } from "react-icons/md";

const FetchBanks: React.FC = () => {
  const dispatch = useAppDispatch();
  const { banks, totalPages, isLoading, error } = useAppSelector(
    (state) => state.banks
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [updatedBanks, setUpdatedBanks] = useState<{
    [key: string]: Partial<Bank>;
  }>({});

  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [deleteBankId, setDeleteBankId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchBanks({ page: currentPage, limit: itemsPerPage }) as any);
  }, [dispatch, currentPage, itemsPerPage]);

  const handleEdit = (id: string) => {
    dispatch(toggleEditMode(id));
  };

  const handleUpdate = async (id: string) => {
    const updatedBank = updatedBanks[id];
    if (updatedBank) {
      const currentBank = banks.find((bank) => bank.id === id);
      if (!currentBank) {
        console.error(`Bank with id ${id} not found`);
        return;
      }
      const bankData = {
        name: updatedBank.name || currentBank.name,
        description: updatedBank.description || currentBank.description,
        isEditing: currentBank.isEditing,
      };
      await dispatch(updateBank({ id, bankData }) as any);
      setUpdatedBanks({});
    }
  };
  const handleDelete = async (id: string) => {
    setDeleteBankId(id);
  };

  const handleInputChange = (id: string, key: keyof Bank, value: string) => {
    setUpdatedBanks((prevState) => ({
      ...prevState,
      [id]: {
        ...prevState[id],
        [key]: value,
      },
    }));
  };
  // handle items perpage
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    dispatch(fetchBanks({ page: currentPage, limit: newItemsPerPage }) as any);
  };

  const confirmDelete = async () => {
    if (deleteBankId) {
      setIsDeleting(true);
      try {
        await dispatch(DeleteBankList({ id: deleteBankId }) as any);
        dispatch(fetchBanks({ page: currentPage, limit: itemsPerPage }) as any);
        setIsDeleting(false);
        setDeleteBankId(null)
      } catch (error) {
        setIsDeleting(false);
        setDeleteBankId(null);
      }
    }
  };
  if (error) {
    return <ConnectionErrorPage error={error} />;
  }

  return (
    <div className="my-2 shadow  bg-white p-8">
      <div className="flex justify-between items-center  ">
        <h3 className="text-xl font-medium  w-full">All banks</h3>
        {/* <div className="flex items-center w-full justify-end ">
        
      </div> */}
      </div>

      <div className="relative overflow-x-auto  sm:rounded-lg mt-4 h-96">
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
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-xs border border-r">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <th colSpan={6} className="text-center">
                  <Loader />
                </th>
              </tr>
            ) : (
              <>
                {banks.length > 0 ? (
                  banks.map((bank, index) => (
                    <tr
                      key={bank.id}
                      className="bg-white border-b border-gray-300 border border-r"
                    >
                      <td className="px-6 py-4 text-xs border border-r">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td
                        scope="row"
                        className="px-6 py-4 whitespace-nowrap text-xs text-gray-900 border border-r "
                      >
                        {bank.isEditing ? (
                          <input
                            type="text"
                            value={updatedBanks[bank.id]?.name || bank.name}
                            onChange={(e) =>
                              handleInputChange(bank.id, "name", e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          bank.name
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs border border-r">
                        {bank.isEditing ? (
                          <textarea
                            value={
                              updatedBanks[bank.id]?.description ||
                              bank.description
                            }
                            onChange={(e) =>
                              handleInputChange(
                                bank.id,
                                "description",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          bank.description
                        )}
                      </td>
                      <td className="text-center relative">
                        {bank.isEditing ? (
                          <>
                            <button
                              onClick={() => handleUpdate(bank.id)}
                              className="mr-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => dispatch(toggleEditMode(bank.id))}
                              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(bank.id)}
                              className="px-4 py-2 rounded hover:underline text-primary"
                            >
                              <FaRegEdit size={20} />
                            </button>
                            <button
                              onClick={() => handleDelete(bank.id)}
                              className="px-4 py-2 rounded hover:underline text-red-600 mx-2 transition duration-300 ease-in-out transform hover:scale-110"
                            >
                              <MdDelete size={20} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr>
                      <th colSpan={6} className="py-6 text-center">
                        No Banks
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

      {deleteBankId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-4">Are you sure you want to delete this bank?</p>
            <div className="flex justify-end">
              <button
                onClick={() => setDeleteBankId(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FetchBanks;
