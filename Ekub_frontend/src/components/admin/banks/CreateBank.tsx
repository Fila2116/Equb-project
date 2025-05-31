import React, { useState, useEffect } from "react";
import {useAppDispatch, useAppSelector} from "../../../store/store"
import { createBank, clearSuccessMessage } from "../../../store/features/admin/banks/banksSlice";
import { UnknownAction } from "@reduxjs/toolkit";
import ConnectionErrorPage from "../../../utils/ErrorPage";
interface CreateBankProps{
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateBank: React.FC<CreateBankProps> = ({setOpen}) => {
  const {isLoading, successMessage, error} = useAppSelector((state) => state.banks);
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    // Clear success message after 3 seconds
    const timer = setTimeout(() => {
      dispatch(clearSuccessMessage());
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage, dispatch]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
      await dispatch(
        createBank({
          bankData:{
            name,
          description,
          isEditing: false,
          },
 setOpen
          
        },
     
    ) as unknown as UnknownAction
      );
  };
  useEffect(()=>{
    if(!error){
      setName("");
      setDescription("");
    }
  },[error])
   if (error) {
     return <ConnectionErrorPage error={error}/>;
   }
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Bank Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bank Name"
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="description"
          >
            Description
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            required
          />
        </div>
        {successMessage && <div className="text-green-500">{successMessage}</div>}
        <div className="flex items-center justify-between">
          <button
            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              isLoading && "opacity-50 cursor-not-allowed"
            }`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Bank"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBank;