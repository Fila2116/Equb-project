/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Role,
  fetchRoles,
  clearSuccessMessage,
  fetchPermissions,
  updateRole,
} from "../../../../store/features/admin/roles/rolesSlice";
import { IoSearch } from "react-icons/io5";
import { RootState } from "../../../../store/store";
import Pagination from "../../../layout/Pagination";
import Select from "react-select";
import Popup from "../../../layout/Popup";
import { MdAdd } from "react-icons/md";
import CreateRoles from "../roles/CreateRoles";
import { FaRegEdit } from "react-icons/fa";
import ConnectionErrorPage from "../../../../utils/ErrorPage";
import Loader from "../../../../utils/Loader";

const FetchRoles: React.FC = () => {
  const dispatch = useDispatch();
  const { roles, isLoading, error, successMessage, permissions } = useSelector(
    (state: RootState) => state.roles
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isPermissionsPopupOpen, setIsPermissionsPopupOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(
      fetchRoles({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
      }) as any
    );
    dispatch(fetchPermissions() as any);
  }, [dispatch, currentPage, itemsPerPage, searchQuery]);

  useEffect(() => {
    if (selectedRole?.id) {
      dispatch(
        updateRole({ id: selectedRole.id, roleData: selectedRole }) as any
      );
    }
  }, [dispatch, selectedRole]);

  // Function to clear success message
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearSuccessMessage());
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage, dispatch]);

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsPopupOpen(true);
  };

  // console.log("selectedRole", selectedRole);

  const handlePopupInputChange = (
    key: keyof Role,
    value: string | string[]
  ) => {
    if (selectedRole) {
      setSelectedRole({
        ...selectedRole,
        [key]: value,
      });
    }
  };

  // View the permissions
  const handlePermissionsPopupOpen = (role: Role) => {
    setSelectedPermissions(role.permissions);
    setIsPermissionsPopupOpen(true);
  };

  // Handle items per page
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    dispatch(fetchRoles({ page: currentPage, limit: newItemsPerPage }) as any);
  };

  // Filter roles based on search query
  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate total pages for filtered roles
  const totalFilteredPages = Math.ceil(filteredRoles.length / itemsPerPage);

  // Slice data for current page
  const currentRoles = filteredRoles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  if (error) {
    return <ConnectionErrorPage error={error} />;
  }

  return (
    <div className="p-4 my-2 mx-4 bg-white">
      <div className="flex items-center w-full justify-end bg-white ">
        <button
          onClick={() => setShowPopup(true)}
          className="flex items-center gap-2 bg-[#149D52] hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-sm -mt-24"
        >
          <MdAdd /> Add Role
        </button>
      </div>
      <div className="flex justify-between bg-white ">
        <div>
          <h3 className="text-2xl font-bold font-poppins size-[22px] w-32 mb-2">
            All Roles
          </h3>
          <p className="text-[#16C098]">All Members</p>
        </div>
        <div className="flex">
          <div className="flex items-center relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on new search
              }}
              className=" ml-2 p-1 pl-6 border border-gray-300   focus:outline-none rounded-lg"
            />
            <IoSearch className="absolute  left-3 opacity-60" />
          </div>
          {/* <input
            type="text"
            placeholder="Sort by"
            className="ml-2  h-[33px] pl-1 mt-2.5  border border-gray-300   focus:outline-none rounded"
          /> */}
        </div>
      </div>

      {successMessage && (
        <p className="text-green-500 items-center text-center">
          {successMessage}
        </p>
      )}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg m-1 p-2 h-96">
        <table className="w-full text-sm text-left text-gray-800 min-h-30">
          <thead className="text-xs text-slate-500 bg-tomoca bg-gray-50">
            <tr>
              <th scope="col" className=" px-6 py-3 text-xs border border-r">
                No
              </th>
              <th scope="col" className=" px-6 py-3 text-xs border border-r">
                Name
              </th>
              <th scope="col" className=" px-6 py-3 text-xs border border-r">
                Permissions
              </th>
              <th scope="col" className=" px-6 py-3 text-xs border border-r">
                Role
              </th>
              <th scope="col" className=" px-6 py-3 text-xs border border-r">
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
                {currentRoles.length ? (
                  currentRoles.map((role, index) => (
                    <tr
                      key={role.id}
                      className="bg-white border-b bg-gray-90 border-gray-300 border border-r"
                    >
                      <td
                        scope="row"
                        className={`px-6 py-4 font-medium text-gray-900 text-xs border border-r`}
                      >
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 text-xs border border-r"
                      >
                        {role.name}
                      </td>
                      <td
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 text-xs flex flex-col justify-start items-start"
                      >
                        <p className="font-medium">
                          {role.permissions.includes("all")
                            ? "All permissions"
                            : `${role.permissions.length}`}
                        </p>
                        <button
                          className="text-[#14B400] font-medium text-sm"
                          onClick={() => handlePermissionsPopupOpen(role)}
                        >
                          View
                        </button>
                      </td>
                      <td
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 text-xs border border-r"
                      >
                        {role.description}
                      </td>
                      <td className="text-center relative ">
                        <button
                          onClick={() => handleEdit(role)}
                          className="px-4 py-2 rounded hover:underline text-primary"
                        >
                          <FaRegEdit />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <th colSpan={6} className="py-6 text-center">
                      No Roles
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
        totalPages={totalFilteredPages}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        itemsPerPage={itemsPerPage}
      />
      {/* Create popup */}
      {showPopup && (
        <Popup title="Add new role" open={showPopup} setOpen={setShowPopup}>
          <CreateRoles />
        </Popup>
      )}
      {/* Popup to view permissions */}
      {isPermissionsPopupOpen && (
        <Popup
          title="Permissions"
          open={isPermissionsPopupOpen}
          setOpen={setIsPermissionsPopupOpen}
        >
          <div className="grid grid-cols-3 gap-4">
            {selectedPermissions.map((permission, index) => (
              <button
                key={index}
                className="bg-[#16A34A] text-white text-base font-medium py-2 px-4 rounded-md shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
              >
                {permission}
              </button>
            ))}
          </div>
        </Popup>
      )}
      {/* Popup for editing */}
      {isPopupOpen && (
        <Popup title="Edit Role" open={isPopupOpen} setOpen={setIsPopupOpen}>
          <div className="space-y-4 p-4">
            {/* Role Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name:
              </label>
              <input
                type="text"
                value={selectedRole?.name || ""}
                onChange={(e) => handlePopupInputChange("name", e.target.value)}
                className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
              />
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Permissions:
              </label>
              <Select
                isMulti
                value={selectedRole?.permissions.map((permission) => ({
                  value: permission,
                  label: permission,
                }))}
                options={permissions.map((permission) => ({
                  value: permission,
                  label: permission,
                }))}
                onChange={(selectedOptions) =>
                  handlePopupInputChange(
                    "permissions",
                    selectedOptions.map((option) => option.value)
                  )
                }
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description:
              </label>
              <input
                type="text"
                value={selectedRole?.description || ""}
                onChange={(e) =>
                  handlePopupInputChange("description", e.target.value)
                }
                className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setIsPopupOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleEdit(selectedRole!);
                  setIsPopupOpen(false); // Close the popup after saving
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring focus:ring-green-300"
              >
                Save
              </button>
            </div>
          </div>
        </Popup>
      )}
    </div>
  );
};

export default FetchRoles;
