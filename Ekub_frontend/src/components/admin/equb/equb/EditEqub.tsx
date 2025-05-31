/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import {
  Equb,
  updateEqub,
} from "../../../../store/features/admin/equb/equbSlice";
import { fetchEqubTypes } from "../../../../store/features/admin/equb/equbTypeSlice";
import { fetchEqubCategories } from "../../../../store/features/admin/equb/equbCategoriesSlice";
import ConnectionErrorPage from "../../../../utils/ErrorPage";
import { formatCurrencyWithSymbolAfter } from "../../../../utils/currencyFormatter";
// import { fetchBranches } from "../../../../store/features/admin/branch/branchSlice";

interface EditEqubProps {
  equb: Equb;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditEqub: React.FC<EditEqubProps> = ({ equb, setOpen }) => {
  const dispatch = useAppDispatch();
  // const [updatedEqub, setUpdatedEqub] = useState<Equb>({id:'',name:'',groupLimit:0,serviceCharge:description: '',equbTypeId: '',equbCategoryId: '',numberOfEqubers:0,equbAmount:0, isEditing: false,branchId:'',startDate:''});
  const popupRef = useRef<HTMLDivElement>(null);

  const [updatedEqub, setUpdatedEqub] = useState<Equb>({
    id: "",
    name: "",
    description: "",
    equbTypeId: "",
    equbCategoryId: "",
    numberOfEqubers: 0,
    isEditing: false,
    branchId: "",
    startDate: "",
    endDate:"",
    equbAmount: 0,
    groupLimit: 0,
    serviceCharge: 0,
    other: "",
  });
  const equbTypes = useAppSelector((state) => state.equbTypes.equbTypes);
  const equbCategories = useAppSelector(
    (state) => state.equbCategories.equbCategories
  );
  // const branches = useAppSelector((state) => state.branches.branches);
  const { isLoading, error, successMessage } = useAppSelector(
    (state) => state.equbs
  );

  useEffect(() => {
    dispatch(fetchEqubTypes({ page: 1, limit: 10 }) as any);
    dispatch(fetchEqubCategories({ page: 1, limit: 10 }) as any);
    // dispatch(fetchBranches({ page: 1, limit: 10 }) as any);
  }, [dispatch]);
  useEffect(() => {
    setUpdatedEqub({
      id: equb.id || "",
      name: equb.name || "",
      description: equb.description || "",
      equbTypeId: equb.equbType?.id || "",
      equbCategoryId: equb.equbCategory?.id || "",
      numberOfEqubers: equb.numberOfEqubers || 0,
      isEditing: false,
      branchId: equb.branch?.id || "",
      startDate: equb.startDate || "",
      endDate: equb.endDate || "",
      groupLimit: equb.groupLimit || 0,
      serviceCharge: equb.serviceCharge || 0,
      equbAmount: equb.equbAmount || 0,
      other: equb.other || "",
    });
  }, [equb]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // console.log("Updated Equb Data:", updatedEqub);
    dispatch(
      updateEqub({ id: equb.id, equbData: { ...updatedEqub, id: equb.id } })
    );
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [setOpen]);

  useEffect(() => {
    if (successMessage) {
      setOpen(false);
    }
  }, [successMessage, setOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setUpdatedEqub((prevData) => ({
        ...prevData,
        [name]:
          type === "number" || name === "serviceCharge"
            ? parseFloat(value)
            : value,
      }));
    } else {
      // if(name==='branchId'){
      //   const branch = branches.find(br=>br.id === value);
      //   setUpdatedEqub((prevData) => ({
      //     ...prevData,
      //     branch,
      //     branchId:value
      //   }));
      // }
      if (name === "equbTypeId") {
        const equbType = equbTypes.find((equbType) => equbType.id === value);
        setUpdatedEqub((prevData) => ({
          ...prevData,
          equbType,
          equbTypeId: value,
        }));
      } else if (name === "equbCategoryId") {
        const equbCategory = equbCategories.find(
          (equbCtg) => equbCtg.id === value
        );
        setUpdatedEqub((prevData) => ({
          ...prevData,
          equbCategory,
          equbCategoryId: value,
        }));
      } else {
        setUpdatedEqub((prevData) => ({
          ...prevData,
          [name]: value,
        }));
      }
    }
  };
  if (error) return <ConnectionErrorPage error={error} />;
  return (
    <div ref={popupRef}>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-8 my-2">
          <div className="mb-4 w-1/2">
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
              value={updatedEqub.name || ""}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4 w-1/2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="equbCategoryId"
            >
              Equb Category:
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="equbCategoryId"
              name="equbCategoryId"
              value={updatedEqub.equbCategoryId}
              onChange={handleChange}
            >
              <option value="">Select Equb Category</option>
              {equbCategories.map((equbCategory) => (
                <option key={equbCategory.id} value={equbCategory.id}>
                  {equbCategory.name}
                </option>
              ))}
            </select>
          </div>
          {/* <div className="mb-4 w-1/2">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="branchId">Choose branch:</label>
        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="branchId"
          name="branchId"
          value={updatedEqub.branchId}
          onChange={handleChange}
          required
        >
          <option value="">Select branch</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>{branch.name}</option>
          ))}
        </select>
      </div> */}
        </div>
        {equb?.equbCategory?.name! === "Finance and Other" && (
          <div className="mb-4 w-1/2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="name"
            >
              Other
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="other"
              type="text"
              name="other"
              placeholder="Add Your other"
              value={updatedEqub.other}
              onChange={handleChange}
              required
            />
          </div>
        )}
        <div className="flex gap-8 my-2">
          <div className="mb-4 w-1/2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="equbTypeId"
            >
              Equb Type:
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="equbTypeId"
              name="equbTypeId"
              value={updatedEqub.equbTypeId}
              onChange={handleChange}
            >
              <option value="">Select Equb Type</option>
              {equbTypes.map((equbType) => (
                <option key={equbType.id} value={equbType.id}>
                  {equbType.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4 w-1/2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="startDate"
            >
              Start date:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="startDate"
              type="date"
              name="startDate"
              value={updatedEqub.startDate ? updatedEqub.startDate.slice(0, 10) : ''}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4 w-1/2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="endDate"
            >
              End date:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="endDate"
              type="date"
              name="endDate"
              value={updatedEqub.endDate ? updatedEqub.endDate.slice(0, 10) : ''}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex gap-8 my-2">
          <div className="mb-4 w-1/2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="numberOfEqubers"
            >
              Number of Equbers:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="numberOfEqubers"
              type="number"
              name="numberOfEqubers"
              value={updatedEqub.numberOfEqubers}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4 w-1/2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="serviceCharge"
            >
              Service Charge:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="serviceCharge"
              type="number"
              step="0.01"
              name="serviceCharge"
              value={updatedEqub.serviceCharge || 0}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="flex gap-8 my-2">
          <div className="mb-4 w-1/2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="numberOfEqubers"
            >
              Group Limit:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="groupLimit"
              type="number"
              name="groupLimit"
              value={updatedEqub.groupLimit}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4 w-1/2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="numberOfEqubers"
            >
              Equb amount:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="equbAmount"
              type="number"
              name="equbAmount"
              value={updatedEqub.equbAmount}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="mb-4">
          {/* {updatedEqub && updatedEqub.numberOfEqubers && updatedEqub.equbAmount}{" "} */}
          <h6 className="font-semibold text-base">
            Lottery Amount :{" "}
            <span className="text-primary font-bold">
              {/* {updatedEqub.equbAmount! * updatedEqub.numberOfEqubers!} ETB */}
              {formatCurrencyWithSymbolAfter(
                updatedEqub.equbAmount! * updatedEqub.numberOfEqubers!,
                "ETB",
                "am-ET"
              )}
            </span>{" "}
          </h6>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="description"
          >
            Description:{" "}
            <span className="text-xs text-gray-400 italic font-thin">
              (Optional)
            </span>
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            name="description"
            value={updatedEqub.description || ""}
            onChange={handleChange}
          ></textarea>
        </div>

        {successMessage && (
          <div className="text-green-500">{successMessage}</div>
        )}
        <div className="flex items-center gap-4 mt-12 mb-6">
          <button
            type="submit"
            className={`bg-primary hover:bg-green-800 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline ${isLoading && "opacity-50 cursor-not-allowed"
              }`}
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Equb"}
          </button>
          <button
            type="button"
            className={`bg-slate-600  text-white font-normal py-2 px-4 rounded-md focus:outline-none focus:shadow-outline ${isLoading && "opacity-50 cursor-not-allowed"
              }`}
            onClick={() => {
              setOpen(false);
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEqub;
