/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {useAppDispatch, useAppSelector} from "../../../../store/store"
import { createEqubCategory, clearSuccessMessage } from "../../../../store/features/admin/equb/equbCategoriesSlice";

const CreateEqubCategory: React.FC = () => {
  const dispatch = useAppDispatch();
  const [equbCategoryData, setEqubCategoryData] = useState({name: "",description: "",hasReason: false,needsRequest: false,});
  const { isLoading, successMessage, error } = useAppSelector((state) => state.equbCategories);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
  
    if (type === 'checkbox') {
      setEqubCategoryData((prevData) => ({
        ...prevData,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setEqubCategoryData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSend = {
      ...equbCategoryData,
      hasReason: equbCategoryData.hasReason,
      needsRequest: equbCategoryData.needsRequest,
      isEditing: false,
    };
    dispatch(createEqubCategory(dataToSend) as any);
  };
  useEffect(()=>{
    if(!error){
    setEqubCategoryData({
        name: "",
        description: "",
        hasReason: false,
        needsRequest: false,
      });
    }
  },[error])

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearSuccessMessage());
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage, dispatch]);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Name:</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            name="name"
            value={equbCategoryData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Description:</label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            name="description"
            value={equbCategoryData.description}
            onChange={handleChange}
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="hasReason">Has Reason:</label>
          <input
            className="mr-2 leading-tight"
            id="hasReason"
            name="hasReason"
            type="checkbox"
            checked={equbCategoryData.hasReason}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="needsRequest">Needs Request:</label>
          <input
            className="mr-2 leading-tight"
            id="needsRequest"
            name="needsRequest"
            type="checkbox"
            checked={equbCategoryData.needsRequest}
            onChange={handleChange}
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        {successMessage && <div className="text-green-500">{successMessage}</div>}
        <div className="flex items-center justify-between">
        <button
          type="submit"
          className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading && "opacity-50 cursor-not-allowed"}`}
          disabled={isLoading}
          >
          {isLoading ? "Creating..." : "Create"}
        </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEqubCategory;