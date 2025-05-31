import React, { useEffect, useState } from "react";
import {
  CompanyProfile,
  fetchCompanyProfile,
  DeleteCompanyProfile,
  updateCompanyProfile,
  toggleEditMode,
  clearSuccessMessage,
} from "../../../store/features/admin/CompanyProfile/companyProfileSlice";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import withMainComponent from "../../layout/withMainComponent";
import { MdAdd, MdDelete } from "react-icons/md";
import Popup from "../../layout/Popup";
import CreateCompanyProfile from "./CreateCompanyProfile";
import { FaRegEdit } from "react-icons/fa";
import ConnectionErrorPage from "../../../utils/ErrorPage";
import Loader from "../../../utils/Loader";

const FetchCompanyProfiles: React.FC = () => {
  const dispatch = useAppDispatch();
  const { companyProfile, isLoading, error, successMessage } =
    useAppSelector((state) => state.companyProfile);
  const [updatedCompanyProfiles, setUpdatedCompanyProfiles] = useState<{
    [key: string]: Partial<CompanyProfile>;
  }>({});
  const [validationErrors, setValidationErrors] = useState<{ [id: string]: { [key in keyof CompanyProfile]?: string } }>({});
  const [showPopup, setShowPopup] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteCompanyProfileId, setDeleteCompanyProfileId] = useState<string | null>(null);
  useEffect(() => {
    dispatch(fetchCompanyProfile() as any);
  }, [dispatch]);

  const handleEdit = (id: string) => {
    dispatch(toggleEditMode(id));
  };
  const handleDelete = async (id: string) => {
    setDeleteCompanyProfileId(id);
  };
  const confirmDelete = async () => {
    if (deleteCompanyProfileId) {
      setIsDeleting(true);
      try {
        await dispatch(DeleteCompanyProfile({ id: deleteCompanyProfileId }) as any);
        // toast.success("CompanyProfiledeleted successfully");
        dispatch(
          fetchCompanyProfile() as any
        );
        setIsDeleting(false);
        setDeleteCompanyProfileId(null)
      } catch (error) {
        setIsDeleting(false);
        setDeleteCompanyProfileId(null);
      }
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearSuccessMessage());
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage, dispatch]);

  const handleUpdate = async (id: string) => {
    const updatedCompanyProfile = updatedCompanyProfiles[id];
    if (updatedCompanyProfile) {
      const currentCompanyProfile = companyProfile.find((companyProfile) => companyProfile.id === id);
      if (!currentCompanyProfile) {
        console.error(`CompanyProfile with id ${id} not found`);
        return;
      }
      const companyProfileData = {
        country: updatedCompanyProfile.country || currentCompanyProfile.country,
        city: updatedCompanyProfile.city || currentCompanyProfile.city,
        address: updatedCompanyProfile.address || currentCompanyProfile.address,
        email: updatedCompanyProfile.email || currentCompanyProfile.email,
        tel: updatedCompanyProfile.tel || currentCompanyProfile.tel,
        isEditing: currentCompanyProfile.isEditing,
      };
      await dispatch(updateCompanyProfile({ id, companyProfileData }) as any);
      setUpdatedCompanyProfiles({});
    }
  };
  //Input Validation Here

  const validateField = (field: any, value: any) => {
    switch (field) {
      case 'country':
      case 'city':
      case 'address':
        return value.trim() === '' ? 'This field is required.' : '';
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Invalid email format.';
      case 'tel':
        return /^[0-9]{10,15}$/.test(value) ? '' : 'Invalid Telephone number.';
      default:
        return '';
    }
  };

  const handleInputChange = (id: string, key: keyof CompanyProfile, value: string) => {
    setUpdatedCompanyProfiles((prevState) => ({
      ...prevState,
      [id]: {
        ...prevState[id],
        [key]: value,
      },
    }));
    // Run validation
    const errorMsg = validateField(key, value);
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [id]: {
        ...prevErrors[id],
        [key]: errorMsg,
      },
    }));
  };



  if (error) {
    return <ConnectionErrorPage error={error} />;
  }

  return (
    <div className="p-4 my-2  rounded-sm mx-4 ">
      <div className="flex justify-between items-center my-3">
        <h3 className="text-xl font-medium  w-full">Company Profile</h3>
         {companyProfile.length ==0 &&(
        <div className="flex items-center w-full justify-end ">
          <button
            onClick={() => setShowPopup(true)}
            className="flex items-center gap-2 bg-primary hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-sm"
          >
            <MdAdd color="#fff" /> Add CompanyProfile
          </button>
        </div>
         )}
      </div>

      {successMessage && (
        <p className="text-green-500 items-center text-center">
          {successMessage}
        </p>
      )}
      <div className=" bg-white shadow-lg rounded-xl p-8 mt-6">
        <div className="relative overflow-x-auto  m-1 p-2 h-96">
          <table className="w-full text-sm text-left text-gray-800 min-h-30">
            <thead className="text-xs text-slate-500 bg-transparent">
              <tr className=" border-b">
                <th scope="col" className="px-6 py-3 text-xs ">
                  Country
                </th>
                <th scope="col" className="px-6 py-3 text-xs ">
                  City
                </th>
                <th scope="col" className="px-6 py-3 text-xs ">
                  Address
                </th>
                <th scope="col" className="px-6 py-3 text-xs ">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-xs ">
                  Tel
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
                  {companyProfile.length > 0 ? (
                    companyProfile.map((companyProfile) => (
                      <tr key={companyProfile.id} className="bg-white border-b border-gray-200">
                        {/* Country */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                          {companyProfile.isEditing ? (
                            <>
                              <input
                                type="text"
                                value={updatedCompanyProfiles[companyProfile.id]?.country || companyProfile.country}
                                onChange={(e) => handleInputChange(companyProfile.id, "country", e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded"
                              />
                              {validationErrors[companyProfile.id]?.country && (
                                <p className="text-red-500 text-xs mt-1">
                                  {validationErrors[companyProfile.id]?.country}
                                </p>
                              )}
                            </>
                          ) : (
                            companyProfile.country
                          )}
                        </td>

                        {/* City */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                          {companyProfile.isEditing ? (
                            <>
                              <input
                                type="text"
                                value={updatedCompanyProfiles[companyProfile.id]?.city || companyProfile.city}
                                onChange={(e) => handleInputChange(companyProfile.id, "city", e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded"
                              />
                              {validationErrors[companyProfile.id]?.city && (
                                <p className="text-red-500 text-xs mt-1">
                                  {validationErrors[companyProfile.id]?.city}
                                </p>
                              )}
                            </>
                          ) : (
                            companyProfile.city
                          )}
                        </td>

                        {/* Address */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                          {companyProfile.isEditing ? (
                            <>
                              <textarea
                                value={updatedCompanyProfiles[companyProfile.id]?.address || companyProfile.address}
                                onChange={(e) => handleInputChange(companyProfile.id, "address", e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded"
                              />
                              {validationErrors[companyProfile.id]?.address && (
                                <p className="text-red-500 text-xs mt-1">
                                  {validationErrors[companyProfile.id]?.address}
                                </p>
                              )}
                            </>
                          ) : companyProfile.address ? (
                            companyProfile.address
                          ) : (
                            <span className="text-xs text-gray-400 italic text-center">Not set</span>
                          )}
                        </td>

                        {/* Email */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                          {companyProfile.isEditing ? (
                            <>
                              <input
                                type="email"
                                value={updatedCompanyProfiles[companyProfile.id]?.email || companyProfile.email}
                                onChange={(e) => handleInputChange(companyProfile.id, "email", e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded"
                              />
                              {validationErrors[companyProfile.id]?.email && (
                                <p className="text-red-500 text-xs mt-1">
                                  {validationErrors[companyProfile.id]?.email}
                                </p>
                              )}
                            </>
                          ) : companyProfile.email ? (
                            companyProfile.email
                          ) : (
                            <span className="text-xs text-gray-400 italic text-center">Not set</span>
                          )}
                        </td>

                        {/* Telephone */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                          {companyProfile.isEditing ? (
                            <>
                              <input
                                type="tel"
                                value={updatedCompanyProfiles[companyProfile.id]?.tel || companyProfile.tel}
                                onChange={(e) => handleInputChange(companyProfile.id, "tel", e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded"
                              />
                              {validationErrors[companyProfile.id]?.tel && (
                                <p className="text-red-500 text-xs mt-1">
                                  {validationErrors[companyProfile.id]?.tel}
                                </p>
                              )}
                            </>
                          ) : companyProfile.tel ? (
                            companyProfile.tel
                          ) : (
                            <span className="text-xs text-gray-400 italic text-center">Not set</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="text-center relative">
                          {companyProfile.isEditing ? (
                            <>
                              <button
                                onClick={() => handleUpdate(companyProfile.id)}
                                className="mr-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => dispatch(toggleEditMode(companyProfile.id))}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleEdit(companyProfile.id)}
                              className="px-4 py-2 rounded hover:underline text-primary"
                            >
                              <FaRegEdit />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(companyProfile.id)}
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
                          No CompanyProfiles
                        </th>
                      </tr>
                    </>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

      </div>

      <Popup title="Add Company Profile" open={showPopup} setOpen={setShowPopup}>
        <CreateCompanyProfile />
      </Popup>
      {deleteCompanyProfileId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-4">Are you sure you want to delete this company profile?</p>
            <div className="flex justify-end">
              <button
                onClick={() => setDeleteCompanyProfileId(null)}
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

export default withMainComponent(FetchCompanyProfiles);
