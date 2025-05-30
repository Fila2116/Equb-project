import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { clearSuccessMessage } from "../../../store/features/admin/branch/branchSlice";
import {
  NewBranch,
  createBranch,
} from "../../../store/features/admin/branch/branchSlice";
import ConnectionErrorPage from "../../../utils/ErrorPage";

const CreateBranch: React.FC = () => {
  const { isLoading, successMessage, error } = useAppSelector(
    (state) => state.banks
  );
  const dispatch = useAppDispatch();
  const [values, setValues] = useState<NewBranch>({
    name: "",
    city: "",
    phoneNumber: "",
    isEditing: false,
  });

  useEffect(() => {
    // Clear success message after 3 seconds
    const timer = setTimeout(() => {
      dispatch(clearSuccessMessage());
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setValues({
      ...values,
      [name]: value,
    });
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await dispatch(createBranch(values));
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
            htmlFor="name"
          >
            Branch Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            name="name"
            value={values.name}
            onChange={(e) => handleInputChange(e)}
            placeholder="Branch Name"
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="description"
          >
            City
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="city"
            name="city"
            type="text"
            value={values.city}
            onChange={(e) => handleInputChange(e)}
            placeholder="City"
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="description"
          >
            Phone Number
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="phoneNumber"
            name="phoneNumber"
            type="text"
            value={values.phoneNumber}
            onChange={(e) => handleInputChange(e)}
            placeholder="phoneNumber"
            required
          />
        </div>
        {successMessage && (
          <div className="text-green-500">{successMessage}</div>
        )}
        <div className="flex items-center justify-between">
          <button
            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              isLoading && "opacity-50 cursor-not-allowed"
            }`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Branch"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBranch;
