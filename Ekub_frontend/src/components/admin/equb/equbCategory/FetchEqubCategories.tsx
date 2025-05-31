/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import {
  EqubCategory,
  fetchEqubCategories,
  clearSuccessMessage,
  toggleEditMode,
  updateEqubCategory,
} from "../../../../store/features/admin/equb/equbCategoriesSlice";
import Pagination from "../../../layout/Pagination";
import withMainComponent from "../../../layout/withMainComponent";
import { MdAdd } from "react-icons/md";
import Popup from "../../../layout/Popup";
import CreateEqubCategory from "./CreateEqubCategory";
import { FaRegEdit } from "react-icons/fa";
import ConnectionErrorPage from "../../../../utils/ErrorPage";
import Loader from "../../../../utils/Loader";

const FetchEqubCategories: React.FC = () => {
  const dispatch = useAppDispatch();
  const { equbCategories, totalPages, isLoading, error, successMessage } =
    useAppSelector((state) => state.equbCategories);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [updatedEqubCategories, setUpdatedEqubCategories] = useState<{
    [key: string]: EqubCategory;
  }>({});
  const [showPopup, setShowPopup] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    dispatch(
      fetchEqubCategories({ page: currentPage, limit: itemsPerPage }) as any
    );
  }, [dispatch, currentPage, itemsPerPage]);

  // Function to clear success message
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearSuccessMessage());
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage, dispatch]);

  const handleEdit = (id: string) => {
    dispatch(toggleEditMode(id));
  };

  const handleInputChange = (
    id: string,
    key: keyof EqubCategory,
    value: string | boolean
  ) => {
    setUpdatedEqubCategories((prevState) => ({
      ...prevState,
      [id]: {
        ...prevState[id],
        [key]: value,
      },
    }));
  };

  const handleUpdate = async (id: string) => {
    const updatedEqubCategory = updatedEqubCategories[id];
    if (updatedEqubCategory) {
      const currentEqubCategory = equbCategories.find(
        (equbCategory) => equbCategory.id === id
      );
      if (!currentEqubCategory) {
        // console.log(`Equb category with id ${id} not found`);
        return;
      }
      const equbCategoryData = {
        name: updatedEqubCategory.name || currentEqubCategory.name,
        description:
          updatedEqubCategory.description || currentEqubCategory.description,
        hasReason:
          updatedEqubCategory.hasReason !== undefined
            ? updatedEqubCategory.hasReason
            : currentEqubCategory.hasReason,
        needsRequest:
          updatedEqubCategory.needsRequest !== undefined
            ? updatedEqubCategory.needsRequest
            : currentEqubCategory.needsRequest,
        isEditing: currentEqubCategory.isEditing,
      };
      try {
        await dispatch(
          updateEqubCategory({
            id,
            equbCategoryData: {
              ...equbCategoryData,
              hasReason: equbCategoryData.hasReason,
              needsRequest: equbCategoryData.needsRequest,
            },
          }) as any
        );
        setUpdatedEqubCategories({});
      } catch (error) {
        console.error("Failed to update equb category", error);
      }
    }
  };

  // handle items perpage
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    dispatch(
      fetchEqubCategories({ page: currentPage, limit: newItemsPerPage }) as any
    );
  };

  if (error) {
    return <ConnectionErrorPage error={error} />;
  }

  return (
    <div className="p-4 my-2 border-b mx-4">
      <h3 className="text-2xl uppercase items-center text-center my-1">
        Equb Categories
      </h3>
      <div className="flex items-center w-full justify-end ">
        <button
          onClick={() => setShowPopup(true)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-sm"
        >
          <MdAdd /> Add EqubCategory
        </button>
      </div>
      {successMessage && (
        <div className="text-green-500 items-center text-center">
          {successMessage}
        </div>
      )}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg m-1 p-2 h-96">
        <table className="w-full text-sm text-left text-gray-800 min-h-30">
          <thead className="text-xs text-slate-500 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs border border-r">No</th>
              <th className="px-6 py-3 text-xs border border-r">Name</th>
              <th className="px-6 py-3 text-xs border border-r">Description</th>
              <th className="px-6 py-3 text-xs border border-r">Has Reason</th>
              <th className="px-6 py-3 text-xs border border-r">
                Needs Request
              </th>
              <th className="px-6 py-3 text-xs border border-r">Actions</th>
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
                {equbCategories.length > 0 ? (
                  equbCategories.map((equbCategory, index) => (
                    <tr
                      key={equbCategory.id}
                      className="bg-white border-b border-gray-300"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 text-xs border border-r">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 text-xs border border-r">
                        {equbCategory.isEditing ? (
                          <input
                            type="text"
                            value={
                              updatedEqubCategories[equbCategory.id]?.name ||
                              equbCategory.name
                            }
                            onChange={(e) =>
                              handleInputChange(
                                equbCategory.id,
                                "name",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          equbCategory.name
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-900 border border-r">
                        {equbCategory.isEditing ? (
                          <input
                            type="text"
                            value={
                              updatedEqubCategories[equbCategory.id]
                                ?.description || equbCategory.description
                            }
                            onChange={(e) =>
                              handleInputChange(
                                equbCategory.id,
                                "description",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          equbCategory.description
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-900 border border-r">
                        {equbCategory.isEditing ? (
                          <input
                            type="checkbox"
                            checked={
                              updatedEqubCategories[equbCategory.id]
                                ?.hasReason !== undefined
                                ? updatedEqubCategories[equbCategory.id]
                                    ?.hasReason
                                : equbCategory.hasReason
                            }
                            onChange={(e) =>
                              handleInputChange(
                                equbCategory.id,
                                "hasReason",
                                e.target.checked
                              )
                            }
                          />
                        ) : equbCategory.hasReason ? (
                          "Yes"
                        ) : (
                          "No"
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-900 border border-r">
                        {equbCategory.isEditing ? (
                          <input
                            type="checkbox"
                            checked={
                              updatedEqubCategories[equbCategory.id]
                                ?.needsRequest !== undefined
                                ? updatedEqubCategories[equbCategory.id]
                                    ?.needsRequest
                                : equbCategory.needsRequest
                            }
                            onChange={(e) =>
                              handleInputChange(
                                equbCategory.id,
                                "needsRequest",
                                e.target.checked
                              )
                            }
                          />
                        ) : equbCategory.needsRequest ? (
                          "Yes"
                        ) : (
                          "No"
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {equbCategory.isEditing ? (
                          <>
                            <button
                              onClick={() => handleUpdate(equbCategory.id)}
                              className="mr-2 px-4 py-2 bg-primary text-white rounded hover:bg-green-500"
                            >
                              Save
                            </button>
                            <button
                              onClick={() =>
                                dispatch(toggleEditMode(equbCategory.id))
                              }
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleEdit(equbCategory.id)}
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
                        No Equb Category
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
      {showPopup && (
        <Popup
          title="Add Equb Category"
          open={showPopup}
          setOpen={setShowPopup}
        >
          <CreateEqubCategory />
        </Popup>
      )}
    </div>
  );
};

export default withMainComponent(FetchEqubCategories);
