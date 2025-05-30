/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Branch,
  fetchBranches,
  updateBranch,
  toggleEditMode,
  clearSuccessMessage,
} from "../../../store/features/admin/branch/branchSlice";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import Pagination from "../../layout/Pagination";
import withMainComponent from "../../layout/withMainComponent";
import { MdAdd } from "react-icons/md";
import Popup from "../../layout/Popup";
import CreateBranch from "./CreateBranch";
import { FaRegEdit } from "react-icons/fa";
import ConnectionErrorPage from "../../../utils/ErrorPage";
import Loader from "../../../utils/Loader";

const FetchBranches: React.FC = () => {
  const dispatch = useAppDispatch();
  const { branches, totalPages, isLoading, error, successMessage } =
    useAppSelector((state) => state.branches);
  const [currentPage, setCurrentPage] = useState(1);
  const [updatedBranchs, setUpdatedBranchs] = useState<{
    [key: string]: Partial<Branch>;
  }>({});
  const [showPopup, setShowPopup] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    dispatch(fetchBranches({ page: currentPage, limit: itemsPerPage }) as any);
  }, [dispatch, currentPage, itemsPerPage]);

  const handleEdit = (id: string) => {
    dispatch(toggleEditMode(id));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearSuccessMessage());
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage, dispatch]);

  const handleUpdate = async (id: string) => {
    const updatedBranch = updatedBranchs[id];
    if (updatedBranch) {
      const currentBranch = branches.find((branch) => branch.id === id);
      if (!currentBranch) {
        console.error(`Branch with id ${id} not found`);
        return;
      }
      const branchData = {
        name: updatedBranch.name || currentBranch.name,
        city: updatedBranch.city || currentBranch.city,
        phoneNumber: updatedBranch.phoneNumber || currentBranch.phoneNumber,
        isEditing: currentBranch.isEditing,
      };
      await dispatch(updateBranch({ id, branchData }) as any);
      setUpdatedBranchs({});
    }
  };

  const handleInputChange = (id: string, key: keyof Branch, value: string) => {
    setUpdatedBranchs((prevState) => ({
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
    dispatch(
      fetchBranches({ page: currentPage, limit: newItemsPerPage }) as any
    );
  };
  if (error) {
    return <ConnectionErrorPage error={error} />;
  }

  return (
    <div className="p-4 my-2  rounded-sm mx-4 ">
      <div className="flex justify-between items-center my-3">
        <h3 className="text-xl font-medium  w-full">Branch management</h3>
        <div className="flex items-center w-full justify-end ">
          <button
            onClick={() => setShowPopup(true)}
            className="flex items-center gap-2 bg-primary hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-sm"
          >
            <MdAdd color="#fff" /> Add Branch
          </button>
        </div>
      </div>

      {successMessage && (
        <p className="text-green-500 items-center text-center">
          {successMessage}
        </p>
      )}
      <div className=" bg-white shadow-lg rounded-xl p-8 mt-6">
        <div className="relative overflow-x-auto  m-1 p-2 h-96">
          <div className="mb-6">
            <h2 className="font-semibold text-base">All branch</h2>
          </div>
          <table className="w-full text-sm text-left text-gray-800 min-h-30">
            <thead className="text-xs text-slate-500 bg-transparent">
              <tr className=" border-b">
                <th scope="col" className="px-6 py-3 text-xs ">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-xs ">
                  City
                </th>
                <th scope="col" className="px-6 py-3 text-xs ">
                  Phone number
                </th>
                <th scope="col" className="px-6 py-3 text-xs ">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr className="px-2 border-b border-gray-400">
                  <th colSpan={6} className="text-center">
                    <Loader />
                  </th>
                </tr>
              ) : (
                <>
                  {branches.length > 0 ? (
                    branches.map((branch) => (
                      <tr
                        key={branch.id}
                        className="bg-white  border-b border-gray-200 "
                      >
                        <td
                          scope="row"
                          className="px-6 py-4 whitespace-nowrap text-xs text-gray-900  "
                        >
                          {branch.isEditing ? (
                            <input
                              type="text"
                              value={
                                updatedBranchs[branch.id]?.name || branch.name
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  branch.id,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            />
                          ) : (
                            branch.name
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs ">
                          {branch.isEditing ? (
                            <textarea
                              value={
                                updatedBranchs[branch.id]?.city || branch.city
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  branch.id,
                                  "city",
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            />
                          ) : (
                            branch.city
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs ">
                          {branch.isEditing ? (
                            <textarea
                              value={
                                updatedBranchs[branch.id]?.phoneNumber ||
                                branch.phoneNumber
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  branch.id,
                                  "phoneNumber",
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            />
                          ) : branch.phoneNumber ? (
                            branch.phoneNumber
                          ) : (
                            <span className="text-xs text-gray-400 italic text-center">
                              Not set
                            </span>
                          )}
                        </td>
                        <td className="text-center relative">
                          {branch.isEditing ? (
                            <>
                              <button
                                onClick={() => handleUpdate(branch.id)}
                                className="mr-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                              >
                                Save
                              </button>
                              <button
                                onClick={() =>
                                  dispatch(toggleEditMode(branch.id))
                                }
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleEdit(branch.id)}
                              className="px-4 py-2 rounded hover:underline text-primary"
                            >
                              <FaRegEdit />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr>
                        <th colSpan={6} className="py-6 text-center">
                          No Branchs
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
      </div>

      <Popup title="Add Branch" open={showPopup} setOpen={setShowPopup}>
        <CreateBranch />
      </Popup>
    </div>
  );
};

export default withMainComponent(FetchBranches);
