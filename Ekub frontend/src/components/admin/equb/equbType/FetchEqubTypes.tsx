/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  fetchEqubTypes,
  updateEqubType,
  toggleEditMode,
  EqubType,
  clearSuccessMessage,
} from "../../../../store/features/admin/equb/equbTypeSlice";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import Pagination from "../../../layout/Pagination";
import withMainComponent from "../../../layout/withMainComponent";
import { MdAdd } from "react-icons/md";
import Popup from "../../../layout/Popup";
import CreateEqubType from "./CreateEqubType";
import { FaRegEdit } from "react-icons/fa";
import ConnectionErrorPage from "../../../../utils/ErrorPage";
import Loader from "../../../../utils/Loader";

const FetchEqubTypes: React.FC = () => {
  const dispatch = useAppDispatch();
  const { equbTypes, totalPages, isLoading, error, successMessage } =
    useAppSelector((state) => state.equbTypes);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [updatedEqubTypes, setUpdatedEqubTypes] = useState<{
    [key: string]: Partial<EqubType>;
  }>({});
  const [showPopup, setShowPopup] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    dispatch(fetchEqubTypes({ page: currentPage, limit: itemsPerPage }) as any);
  }, [dispatch, currentPage, itemsPerPage]);

  //for clearing sucess message
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearSuccessMessage());
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage, dispatch]);

  const handleEdit = (id: string) => {
    dispatch(toggleEditMode(id));
  };

  const handleUpdate = async (id: string) => {
    const updatedEqubType = updatedEqubTypes[id];
    if (updatedEqubType) {
      const currentEqubType = equbTypes.find((equbType) => equbType.id === id);
      if (!currentEqubType) {
        console.error(`Equb type with id ${id} not found`);
        return;
      }

      const equbTypeData = {
        name: updatedEqubType.name || currentEqubType.name,
        description: updatedEqubType.description || currentEqubType.description,
        interval: updatedEqubType.interval || currentEqubType.interval,
        isEditing: currentEqubType.isEditing,
      };
      try {
        await dispatch(updateEqubType({ id, equbTypeData }) as any);
        setUpdatedEqubTypes({});
      } catch (error) {
        console.error("Failed to update role", error);
      }
    }
  };

  const handleInputChange = (
    id: string,
    key: keyof EqubType,
    value: string
  ) => {
    setUpdatedEqubTypes((prevState) => ({
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
      fetchEqubTypes({ page: currentPage, limit: newItemsPerPage }) as any
    );
  };
  if (error) {
    return <ConnectionErrorPage error={error} />;
  }

  return (
    <div className="p-4 my-2 border-b mx-4">
      <h3 className=" items-center  my-1 font-medium text-black font-poppins text-2xl leading-9">
        Equb Types
      </h3>
      <div className="flex items-center w-full justify-end ">
        <button
          onClick={() => {
            setShowPopup(true);
          }}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-sm"
        >
          <MdAdd /> Add EqubType
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
              <th className="px-6 py-3 text-xs border border-r">Interval</th>
              <th className="px-6 py-3 text-xs border border-r">Description</th>
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
                {equbTypes.length > 0 ? (
                  equbTypes.map((equbType, index) => (
                    <tr
                      key={equbType.id}
                      className="bg-white border-b border-gray-300"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 text-xs border border-r">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 text-xs border border-r">
                        {equbType.isEditing ? (
                          <input
                            type="text"
                            value={
                              updatedEqubTypes[equbType.id]?.name ||
                              equbType.name
                            }
                            onChange={(e) =>
                              handleInputChange(
                                equbType.id,
                                "name",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          equbType.name
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-900 border border-r">
                        {equbType.isEditing ? (
                          <input
                            type="number"
                            value={
                              updatedEqubTypes[equbType.id]?.interval ||
                              equbType.interval
                            }
                            onChange={(e) =>
                              handleInputChange(
                                equbType.id,
                                "interval",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          equbType.interval
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-900 border border-r">
                        {equbType.isEditing ? (
                          <input
                            type="text"
                            value={
                              updatedEqubTypes[equbType.id]?.description ||
                              equbType.description
                            }
                            onChange={(e) =>
                              handleInputChange(
                                equbType.id,
                                "description",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          equbType.description
                        )}
                      </td>
                      <td className="text-center relative">
                        {equbType.isEditing ? (
                          <>
                            <button
                              onClick={() => handleUpdate(equbType.id)}
                              className="mr-2 px-4 py-2 bg-primary text-white rounded hover:bg-green-500"
                            >
                              Save
                            </button>
                            <button
                              onClick={() =>
                                dispatch(toggleEditMode(equbType.id))
                              }
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleEdit(equbType.id)}
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
                        No Equb Types
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
        <Popup title="Add Equb Type" open={showPopup} setOpen={setShowPopup}>
          <CreateEqubType />
        </Popup>
      )}
    </div>
  );
};

export default withMainComponent(FetchEqubTypes);
