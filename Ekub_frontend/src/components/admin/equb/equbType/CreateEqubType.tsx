/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import {
  createEqubType,
  clearSuccessMessage,
} from "../../../../store/features/admin/equb/equbTypeSlice";
import ConnectionErrorPage from "../../../../utils/ErrorPage";

const CreateEqubType: React.FC = () => {
  const dispatch = useAppDispatch();
  const [equbTypeData, setEqubTypeData] = useState({
    name: "",
    description: "",
    interval: 0,
    isEditing: false,
  });
  const { isLoading, successMessage, error } = useAppSelector(
    (state) => state.equbTypes
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setEqubTypeData((prevData) => ({
        ...prevData,
        [name]: parseInt(value),
      }));
    } else {
      setEqubTypeData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createEqubType(equbTypeData) as any);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearSuccessMessage());
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage, dispatch]);

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
            Name:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            name="name"
            value={equbTypeData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="description"
          >
            Description:
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            name="description"
            value={equbTypeData.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="interval"
          >
            Interval:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="interval"
            type="number"
            name="interval"
            value={equbTypeData.interval}
            onChange={handleChange}
            required
          />
        </div>
        {successMessage && (
          <div className="text-green-500">{successMessage}</div>
        )}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              isLoading && "opacity-50 cursor-not-allowed"
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

export default CreateEqubType;
