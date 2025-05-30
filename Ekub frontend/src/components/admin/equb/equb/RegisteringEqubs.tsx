/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import {
  Equb,
  fetchRegisteringEqubs,
  toggleEditMode as toggleEditEqubMode,
} from "../../../../store/features/admin/equb/equbSlice";
import Pagination from "../../../layout/Pagination";
import EditEqubPopup from "./EditEqub";
import { FaRegEdit } from "react-icons/fa";
import Popup from "../../../layout/Popup";
import ConnectionErrorPage from "../../../../utils/ErrorPage";
import Loader from "../../../../utils/Loader";
interface RegsteringEqubPopup {
  searchTerm: string;
  equbTypeFilter: "Daily" | "Weekly" | "Monthly" | "all";
  equbTypeCategory: "Finance" | "Special Finance" | "Finance and Other" | "all";
}

const RegisteringEqubs: React.FC<RegsteringEqubPopup> = ({
  searchTerm,
  equbTypeFilter,
  equbTypeCategory,
}) => {
  const dispatch = useAppDispatch();
  const { registering, totalPages, isLoading, error } = useAppSelector(
    (state) => state.equbs
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editEqub, setEditEqub] = useState<Equb | null>(null);
  const [showEditPopup, setShowEditPopup] = useState<boolean>(false);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    dispatch(
      fetchRegisteringEqubs({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
      }) as any
    );
  }, [dispatch, currentPage, itemsPerPage, searchTerm]);

  const handleEdit = (equb: Equb) => {
    setEditEqub(equb);
    dispatch(toggleEditEqubMode(equb.id));
    setShowEditPopup(true);
  };

  const handleClosePopup = () => {
    if (editEqub) {
      dispatch(toggleEditEqubMode(editEqub.id));
    }
    setEditEqub(null);
  };

  // handle items perpage
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    dispatch(
      fetchRegisteringEqubs({
        page: currentPage,
        limit: newItemsPerPage,
      }) as any
    );
  };
  const filteredEqubs = registering.filter((equb) => {
    const matchesSearch = equb.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType =
      equbTypeFilter === "all" || equb.equbType?.name === equbTypeFilter;
    const matchesCategory =
      equbTypeCategory === "all" ||
      equb.equbCategory?.name === equbTypeCategory;
    return matchesSearch && matchesType && matchesCategory;
  });
  if (error) {
    return <ConnectionErrorPage error={error} />;
  }
  return (
    <div className="min-w-fit my-2">
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg m-1 p-2 h-96">
        <table className="w-full text-sm text-left text-gray-800 min-h-30">
          <thead className="text-xs text-slate-500 bg-gray-50">
            <tr>
              <th scope="col" className=" px-6 py-3 text-xs border border-r">
                No
              </th>
              <th scope="col" className=" px-6 py-3 text-xs border border-r">
                Name
              </th>
              <th scope="col" className=" px-6 py-3 text-xs border border-r">
                Description
              </th>
              <th scope="col" className=" px-6 py-3 text-xs border border-r">
                Equb Type
              </th>
              <th scope="col" className=" px-6 py-3 text-xs border border-r">
                Equb Category
              </th>
              <th scope="col" className=" px-6 py-3 text-xs border border-r">
                Number of Equbers
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
                {filteredEqubs.length ? (
                  filteredEqubs.map((equb, index: number) => (
                    <tr
                      key={equb.id}
                      className="bg-white border-b bg-gray-90 border-gray-300 border border-r"
                    >
                      <th
                        scope="row"
                        className={`px-6 py-4 font-medium text-gray-900 text-xs border border-r`}
                      >
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </th>
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 text-xs border border-r"
                      >
                        {equb.name}
                      </th>
                      <td className="px-6 py-4 text-xs text-gray-900 border border-r">
                        {equb.description}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-900 border border-r">
                        {equb.equbType?.name}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-900 border border-r">
                        {equb.equbCategory?.name}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-900 border border-r">
                        {equb.numberOfEqubers}
                      </td>
                      <td className="text-center relative ">
                        <button
                          onClick={() => handleEdit(equb)}
                          className="px-4 py-2 rounded hover:underline text-primary"
                        >
                          <FaRegEdit />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr>
                      <th colSpan={6} className="py-6 text-center">
                        No Registering Equbs
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
      <Popup title="Edit Equb" open={showEditPopup} setOpen={setShowEditPopup}>
        {editEqub && (
          <EditEqubPopup equb={editEqub} setOpen={handleClosePopup} />
        )}
      </Popup>
    </div>
  );
};

export default RegisteringEqubs;
