import React, { useState, useEffect } from "react";
import {useAppDispatch, useAppSelector} from "../../../store/store"
import { createCompanyBank, clearSuccessMessage } from "../../../store/features/admin/banks/banksSlice";
import { UnknownAction } from "@reduxjs/toolkit";
import ConnectionErrorPage from "../../../utils/ErrorPage";

const CreateCompanyBank: React.FC = () => {
  const {isLoading, successMessage, error} = useAppSelector((state) => state.banks);
  const dispatch = useAppDispatch();
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

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
        createCompanyBank({
          accountName,
          accountNumber,
          isEditing: false
        }) as unknown as UnknownAction
      );
  };
  useEffect(()=>{
    if(!error){
      setAccountName("");
      setAccountNumber("");
    }
  },[error])

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
            Bank Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Bank Name"
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="description"
          >
            Account number
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Account No."
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

export default CreateCompanyBank;