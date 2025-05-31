import { useEffect, useState } from "react";
import withMainComponent from "../../layout/withMainComponent";
import CreateBanner from "./CreateBanner";
import Popup from "../../layout/Popup";
import Pagination from "../../layout/Pagination";
import { MdAdd } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  fetchBanners,
  clearSuccessMessage,
  Banner,
  DeleteBanner,

} from "../../../store/features/admin/banner/BannerSlice";
import { MdDelete } from "react-icons/md";
import dayjs from "dayjs";
import { FaRegEdit } from "react-icons/fa";
import EditBanner from "./EditBanner";
import { imageUrl } from "../../../utils/imageUrl";
import ConnectionErrorPage from "../../../utils/ErrorPage";
import Loader from "../../../utils/Loader";

const FetchBanner: React.FC = () => {
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [showCreatePopup, setShowCreatePopup] = useState<boolean>(false);
  const [showEditPopup, setShowEditPopup] = useState<boolean>(false);
  const [deleteBannerId, setDeleteBannerId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
  const dispatch = useAppDispatch();
  const { banners, totalPages, isLoading, error, successMessage } =
    useAppSelector((state) => state.banners);
  const [currentPage, setCurrentPage] = useState(1);

  const [itemsPerPage, setItemsPerPage] = useState(5);
  useEffect(() => {
    dispatch(fetchBanners({ page: currentPage, limit: itemsPerPage }) as any);
  }, [dispatch, currentPage, itemsPerPage]);

  // useEffect(() => {
  //   dispatch(fetchBanners());
  // }, [dispatch]);

  // useEffect(() => {
  //   if (successMessage) {
  //     dispatch(fetchBanners()); // Refetch banners when a new one is created successfully
  //     dispatch(clearSuccessMessage()); // Clear the success message
  //   }
  // }, [successMessage, dispatch]);
  const handleEdit = (banner: Banner) => {
    // dispatch(toggleEditMode(id));
    setEditBanner(banner);
    setShowEditPopup(true);
  };
  const handleDelete = async (id: string) => {
    setDeleteBannerId(id);
  };
    const confirmDelete = async () => {
      if (deleteBannerId) {
        setIsDeleting(true);
        try {
          await dispatch(DeleteBanner({ id: deleteBannerId }) as any);
          // toast.success("Banner deleted successfully");
          dispatch(
            fetchBanners({ page: currentPage, limit: itemsPerPage }) as any
          );
          setIsDeleting(false);
          setDeleteBannerId(null)
        } catch (error) {
          setIsDeleting(false);
          setDeleteBannerId(null);
        }
      }
    };
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearSuccessMessage());
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage, dispatch]);

  // handle items perpage
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    dispatch(
      fetchBanners({ page: currentPage, limit: newItemsPerPage }) as any
    );
  };
  if (error) {
    return <ConnectionErrorPage error={error} />;
  }

  return (
    <div className="p-4 my-2  rounded-sm mx-4 ">
      <div className="flex justify-between items-center my-3">
        <h3 className=" w-full font-medium text-black font-poppins text-2xl leading-9">
          Banner management
        </h3>
        <div className="flex items-center w-full justify-end ">
          <button
            onClick={() => setShowCreatePopup(true)}
            className="flex items-center gap-2 bg-primary hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-sm"
          >
            <MdAdd color="#fff" /> Add Banner
          </button>
        </div>
      </div>
      {successMessage && (
        <p className="text-green-500 items-center text-center">
          {successMessage}
        </p>
      )}
      <div className=" bg-white shadow-lg rounded-xl p-8 mt-6">
        <div className="relative overflow-x-auto  m-1 p-2 ">
          <div className="mb-6">
            <h2 className="font-semibold text-base">All Banner</h2>
          </div>
          <table className="w-full text-sm text-left text-gray-800 min-h-30">
            <thead className="text-xs text-slate-500 bg-transparent">
              <tr className=" border-b">
                <th scope="col" className="px-6 py-3 text-xs ">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-xs ">
                  picture
                </th>
                <th scope="col" className="px-6 py-3 text-xs ">
                  Valid From
                </th>
                <th scope="col" className="px-6 py-3 text-xs ">
                  Valid Until
                </th>
                <th scope="col" className="px-6 py-3 text-xs ">
                  state
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
                  {banners.length > 0 ? (
                    banners.map((banner) => (
                      <tr
                        key={banner.id}
                        className="bg-white  border-b border-gray-200 "
                      >
                        <td
                          scope="row"
                          className="px-6 py-4 whitespace-nowrap text-xs text-gray-900  "
                        >
                          {banner.name}
                        </td>
                        <td className="px-4 py-2 border-b">
                          {banner.picture &&
                            typeof banner.picture === "string" ? (
                            <img
                              src={imageUrl("banner", banner.picture)}
                              alt={banner.name}
                              className="w-16 h-16 object-cover"
                            />
                          ) : (
                            "No Image"
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-xs ">
                          <span>
                            {dayjs(banner.validFrom).format("MMM DD YYYY")}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-xs ">
                          <span>
                            {dayjs(banner.validUntil).format("MMM DD YYYY")}
                          </span>
                        </td>

                        <td
                          className={`px-6 py-4 whitespace-nowrap font-medium text-sm ${banner.state === "active"
                              ? "text-green-600"
                              : "text-red-600"
                            }`}
                        >
                          {banner.state}
                        </td>

                        <td className="text-center relative">
                          <button
                            onClick={() => handleEdit(banner)}
                            className="px-4 py-2 rounded hover:underline text-primary"
                          >
                            <FaRegEdit />
                          </button>
                        </td>
                        <td className="text-center">
                        <button
                          onClick={() => handleDelete(banner.id)}
                          className="px-4 py-2 rounded hover:underline text-red-600 mx-2 transition duration-300 ease-in-out transform hover:scale-110"
                        >
                          <MdDelete size={20} />
                        </button>
                        </td>
                     
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr>
                        <th colSpan={6} className="py-6 text-center">
                          No Banners
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

      <Popup
        title="Add Banner"
        open={showCreatePopup}
        setOpen={setShowCreatePopup}
      >
        <CreateBanner setOpen={setShowCreatePopup} />
      </Popup>
      {editBanner && (
        <Popup
          title="Edit Banner"
          open={showEditPopup}
          setOpen={setShowEditPopup}
        >
          <EditBanner banner={editBanner} setOpen={setShowEditPopup} />
        </Popup>
      )}
         {deleteBannerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-4">Are you sure you want to delete this banner?</p>
            <div className="flex justify-end">
              <button
                onClick={() => setDeleteBannerId(null)}
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

export default withMainComponent(FetchBanner);
