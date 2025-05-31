/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { fetchAllEqubs } from "../../../../store/features/admin/equb/equbSlice";
import Pagination from "../../../layout/Pagination";
import ConnectionErrorPage from "../../../../utils/ErrorPage";
import Loader from "../../../../utils/Loader";

const FetchAllEqubs: React.FC = () => {
  const dispatch = useAppDispatch();
  const { allEqubs, totalPages, isLoading, task, error, successMessage } =
    useAppSelector((state) => state.equbs);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    dispatch(fetchAllEqubs({ page: currentPage, limit: itemsPerPage }) as any);
  }, [dispatch, currentPage, itemsPerPage]);

  // handle items perpage
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    dispatch(
      fetchAllEqubs({ page: currentPage, limit: newItemsPerPage }) as any
    );
  };
   if (error) {
     return <ConnectionErrorPage error={error}/>;
   }

  return (
    <div className="min-w-fit my-2">
      {successMessage && (
        <div className="text-green-500 items-center text-center">
          {successMessage}
        </div>
      )}
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
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && task === "fetch-equbs" ? (
              <tr>
                <th colSpan={6} className="text-center">
                  <Loader/>
                </th>
              </tr>
            ) : (
              <>
                {allEqubs.length ? (
                  allEqubs.map((equb, index: number) => (
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
    </div>
  );
};

export default FetchAllEqubs;
