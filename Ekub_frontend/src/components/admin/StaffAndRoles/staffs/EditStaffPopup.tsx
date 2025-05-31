/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import {  Staff, updateStaff,} from "../../../../store/features/admin/staff/staffSlice";

interface EditStaffPopupProps {
  staff: Staff;
  onClose: () => void;
}

const EditStaffPopup: React.FC<EditStaffPopupProps> = ({ staff, onClose }) => {
  const dispatch = useAppDispatch();
  const [resetPassword, setResetPassword]= useState(false)
  const roles = useAppSelector((state) => state.roles.roles);
  const [updatedStaff, setUpdatedStaff] = useState<Partial<Staff>>({
    firstName: staff.firstName,
    lastName: staff.lastName,
    email: staff.email,
    password:"*****",
    phoneNumber: staff.phoneNumber,
    avatar: staff.avatar,
    role: staff.role,
    state: staff.state,
  });
  
  const [changes, setChanges] = useState<Partial<Staff>>({
    firstName: staff.firstName,
    lastName: staff.lastName,
    email: staff.email,
    phoneNumber: staff.phoneNumber,
    avatar: staff.avatar,
    role: staff.role,
    password: staff.password,
    state: staff.state,
  });
  const chechResetPassword =()=>{
    setResetPassword(!resetPassword)
  }

  const handleInputChange = (key: keyof Staff, value: any) => {
   
    if (key === "role") {
      const selectedRole = roles.find((role) => role.id === value);

         // Construct updated state before setting
    const newUpdatedStaff = {
      ...updatedStaff,
      role: selectedRole,
    };

    const newChanges = {
      ...changes,
      role: selectedRole,
    };
    setUpdatedStaff(newUpdatedStaff);
    setChanges(newChanges);

    } else {
      setUpdatedStaff((prevState) => ({
        ...prevState,
        [key]: value,
      }));
      setChanges((prevChanges) => ({
        ...prevChanges,
        [key]: value,
      }));
    }
  };

  const handleUpdate = async () => {
    try {
      await dispatch(updateStaff({ id: staff.id, staffData: changes as Staff,resetPassword }));
      onClose();
    } catch (error) {
      console.error("Failed to update staff", error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      handleInputChange("avatar", file);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded shadow-lg w-1/3">
        <h2 className="text-xl mb-4">Edit Staff</h2>
        <label className="block mb-2">
          First Name:
          <input
            type="text"
            value={updatedStaff.firstName || ""}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded"
          />
        </label>
        <label className="block mb-2">
          Last Name:
          <input
            type="text"
            value={updatedStaff.lastName || ""}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded"
          />
        </label>
        <label className="block mb-2">
          Email:
          <input
            type="email"
            value={updatedStaff.email || ""}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded"
          />
        </label>
        <label className="block mb-2">
          Phone Number:
          <input
            type="text"
            value={updatedStaff.phoneNumber || ""}
            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded"
          />
        </label>
        
        <label className="block mb-2" htmlFor="avatar">
          Profile:
          <input
            type="file"
            name="avatar"
            id="avatar"
            onChange={handleFileChange}
            className="w-full px-2 py-1 border border-gray-300 rounded"
          />
        </label>
        <label className="block mb-2">
          Role:
          <select
            value={updatedStaff.role?.id || ""}
            onChange={(e) => {
              handleInputChange("role", e.target.value)}}
            className="w-full px-2 py-1 border border-gray-300 rounded"
          >
            <option value="">Select Role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </label>
       
        <button onClick={chechResetPassword}>Change password</button>
        {
          resetPassword && (
            <div className="flex items-center justify-between mb-4">
               <label className="block mb-2">
          Password:
          <input
            type="password"
            value={updatedStaff.password || ""}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded"
            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
            title="Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
          />
        </label>
              <button
                onClick={chechResetPassword}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          )
        }
        
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="state"
        >
          Status
        </label>
        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="state"
          name="state"
          value={updatedStaff.state}
          onChange={(e) => handleInputChange("state", e.target.value)}
          required
        >
          <option value="" disabled>
            Select State
          </option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
        <div className="flex justify-end">
          <button
            onClick={handleUpdate}
            className="mr-2 px-4 py-2 bg-primary text-white rounded hover:bg-green-500"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditStaffPopup;
