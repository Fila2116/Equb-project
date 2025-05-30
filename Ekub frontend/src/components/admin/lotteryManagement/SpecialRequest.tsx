import { Link, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { useEffect, useState } from "react";
// import {
//   clearSuccessMessage,
//   fetchAllEqubers,
// } from "../../../store/features/admin/equber/equberSlice";

import {
  fetchLotteryRequests,
  clearSuccessMessage,
} from "../../../store/features/admin/equb/equbSlice";
import ItemsRequest from "./ItemsRequest";
import Popup from "../../layout/Popup";
import Pagination from "../../layout/Pagination";
import ConnectionErrorPage from "../../../utils/ErrorPage";
import Loader from "../../../utils/Loader";

interface SpecialRequestProps {
  searchQuery: string;
  sortBy: string;
}

function SpecialRequest({ searchQuery, sortBy }: SpecialRequestProps) {
  const dispatch = useAppDispatch();
  const [showCreatePopup, setShowCreatePopup] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // const { allEquber } = useAppSelector((state) => state.equbers);
  const {
    lotteryRequests,
    totalPages,
    task,
    isLoading,
    error,
    successMessage,
  } = useAppSelector((state) => state.equbs);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const { id } = useParams<{ id: string }>();

  // console.log("special request id", id);
  useEffect(() => {
    if (id) {
      // dispatch(fetchAllEqubers(id));
      dispatch(
        fetchLotteryRequests({
          equbId: id,
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery,
          sortBy,
        })
      );
    }
  }, [id, dispatch, currentPage, itemsPerPage, searchQuery, sortBy]);

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    if (!id) return;
    dispatch(
      fetchLotteryRequests({
        equbId: id,
        page: currentPage,
        limit: itemsPerPage,
      }) as any
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearSuccessMessage());
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage, dispatch]);

  // Filter lottery requests based on the searchQuery
  // const filteredRequests = lotteryRequests.filter((request) =>
  //   request.equber.users[0].user.fullName
  //     .toLowerCase()
  //     .includes(searchQuery.toLowerCase())
  // );
  // const shouldShowFiltered = searchQuery.trim().length > 0;
  // const displayEqubers = shouldShowFiltered
  //   ? filteredRequests
  //   : lotteryRequests;

  if (error) {
    return <ConnectionErrorPage error={error} />;
  }
  return (
    <div>
      {/* <h1>Data for ID: {id}</h1> */}
      <div className="p-4 my-2  rounded-sm mx-4 ">
        {/* <div className="flex justify-between items-center my-3">
        <h3 className="text-xl font-medium  w-full">Banner management</h3>
        <div className="flex items-center w-full justify-end ">
          <button
            onClick={() => setShowCreatePopup(true)}
            className="flex items-center gap-2 bg-primary hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-sm"
          >
            <MdAdd color="#fff" /> Add Banner
          </button>
        </div>
      </div> */}

        {/* {error && (
        <p className="text-red-500 items-center text-center">{error}</p>
      )} */}
        {/* {successMessage && (
        <p className="text-green-500 items-center text-center">
          {successMessage}
        </p>
      )} */}
        <div className=" bg-white shadow-lg rounded-xl p-8 mt-6">
          <div className="relative overflow-x-auto  m-1 p-2 h-96">
            <div className="mb-6">
              {/* <h2 className="font-semibold text-base">All Members</h2> */}
            </div>
            <table className="w-full text-sm text-left text-gray-800 min-h-30">
              <thead className="text-xs text-[#B5B7C0] bg-transparent">
                <tr className=" border-b">
                  <th scope="col" className="px-6 py-3 text-xs ">
                    Full Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs ">
                    Round
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs ">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs ">
                    Requested Item
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs ">
                    Expected Amount
                  </th>
                  {/* <th scope="col" className="px-6 py-3 text-xs ">
                    Status
                  </th> */}
                  <th scope="col" className="px-6 py-3 text-xs ">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading && task === "fetch-lottery-requests" ? (
                  <tr className="px-2 border-b border-gray-400">
                    <th colSpan={8} className="text-center">
                      <Loader />
                    </th>
                  </tr>
                ) : (
                  <>
                    {successMessage && (
                      <tr>
                        <th className="text-green-500 items-center text-center">
                          {successMessage}
                        </th>
                      </tr>
                    )}
                    {lotteryRequests.length > 0 ? (
                      lotteryRequests.map((request) => {
                        const date = new Date(request.equber.createdAt);
                        const formattedDate = date.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        });

                        return (
                          <tr
                            className="bg-white  border-b border-gray-200 "
                            key={request.id}
                          >
                            <td
                              scope="row"
                              className="px-6 py-4 whitespace-nowrap text-xs text-gray-900 font-medium "
                            >
                              {/* {equber.users[0].user?.fullName} */}
                              <div className="flex items-center gap-2">
                                <span>
                                  {request.equber.users[0].user.fullName}
                                </span>
                                <span>{request.equber.lotteryNumber}</span>
                              </div>

                              {/* Kebede Abebe */}
                            </td>
                            <td className="px-4 py-2 border-b font-medium">
                              {/* {equber.totalPaid} */}
                              {request.equber.winRound}
                              {/* 3 */}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                              {/* {equber.financePoint} */}
                              {formattedDate}
                              {/* 2/3/2024 */}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                              <p
                                onClick={() => {
                                  setSelectedItem(request);
                                  setShowCreatePopup(true);
                                }}
                                className="flex items-center gap-2 cursor-pointer bg-primary hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-sm"
                              >
                                View
                              </p>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                              {/* {equber.adminPoint} */}
                              {request.amount}
                              {/* 100,000 br */}
                            </td>
                            {/* <td className="px-6 py-4 whitespace-nowrap text-xs ">
                              {/* {equber.totalEligibilityPoint} */}
                            {/* {request.equber.state || "Active"} */}
                            {/* </td> */}
                            <td className="text-center relative">
                              {/* open */}
                              <Link
                                to={`/dashboard/memberprofile/${request.equber.id}`}
                              >
                                <button className="px-4 py-2 rounded hover:underline text-primary font-medium">
                                  open
                                </button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No Special Requests Found.
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
          {/* <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          itemsPerPage={itemsPerPage}
        /> */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemsPerPage={itemsPerPage}
          />
        </div>
        {selectedItem && (
          <Popup
            title="Request Information"
            open={showCreatePopup}
            setOpen={setShowCreatePopup}
          >
            <ItemsRequest
              amount={selectedItem.amount}
              description={selectedItem.description}
              item={selectedItem.itemName}
            />
          </Popup>
        )}

        {/* <Popup
          title="Request information"
          open={showCreatePopup}
          setOpen={setShowCreatePopup}
        >
          <ItemsRequest />
        </Popup> */}
        {/* {editBanner &&
       <Popup title="Edit Banner" open={showEditPopup} setOpen={setShowEditPopup}>
        <EditBanner banner={editBanner} setOpen={setShowEditPopup} />
      </Popup>
      } */}
      </div>
    </div>
  );
}

export default SpecialRequest;
