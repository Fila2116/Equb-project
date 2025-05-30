import React, { useEffect, useState } from "react";
import {
  createStaff,
  clearSuccessMessage,
} from "../../../../store/features/admin/staff/staffSlice";
import { fetchRoles } from "../../../../store/features/admin/roles/rolesSlice";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import ConnectionErrorPage from "../../../../utils/ErrorPage";

interface CreateStaffProps {
  setShowPopup: (show: boolean) => void;
}

const CreateStaff: React.FC<CreateStaffProps> = ({ setShowPopup }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error, successMessage } = useAppSelector(
    (state) => state.staffs
  );
  const roles = useAppSelector((state) => state.roles.roles);
  const [staffData, setStaffData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    roleId: "",
    avatar: null,
    isEditing: false,
    password: "",
  });

  // console.log(`staffData`, staffData);

  useEffect(() => {
    dispatch(fetchRoles({ page: 1, limit: 10 }));
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [dispatch, successMessage]);

  useEffect(() => {
    if (successMessage) {
      // Handle success message logic here
      setShowPopup(false);
    }
  }, [successMessage]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    setStaffData({
      ...staffData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault();
    const role = roles.find((role) => role.id === staffData.roleId);
    if (role) {
      dispatch(
        createStaff({
          ...staffData,
          role,
        })
      );
    }
  };

  if (error) {
    return <ConnectionErrorPage error={error} />;
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="firstName"
          >
            First Name:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            id="firstName"
            name="firstName"
            value={staffData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="lastName"
          >
            Last Name:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            id="lastName"
            name="lastName"
            value={staffData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="email"
            id="email"
            name="email"
            value={staffData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="phoneNumber"
          >
            Phone Number:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            value={staffData.phoneNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password:
          </label>

          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="password"
            id="password"
            name="password"
            value={staffData.password}
            onChange={handleChange}
            required
            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
            title="Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="avatar"
          >
            Profile:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="file"
            id="avatar"
            name="avatar"
            onChange={handleChange}
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="roleId"
          >
            Role:
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="roleId"
            name="roleId"
            value={staffData.roleId}
            onChange={handleChange}
            required
          >
            <option value="">Select Role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        {successMessage && (
          <p className="text-green-500 text-center">{successMessage}</p>
        )}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className={`bg-primary hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading && "opacity-50 cursor-not-allowed"
              }`}
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateStaff;
