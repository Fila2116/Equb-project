import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  clearSuccessMessage,
  createBanner,
  NewBanner,
} from "../../../store/features/admin/banner/BannerSlice";
import ConnectionErrorPage from "../../../utils/ErrorPage";
interface CreateBannerProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateBanner: React.FC<CreateBannerProps> = ({ setOpen }) => {
  const { isLoading, successMessage, error } = useAppSelector(
    (state) => state.banners
  );
  const dispatch = useAppDispatch();
  const [values, setValues] = useState<NewBanner>({
    name: "",
    picture: "",
    state: "active",
    validFrom: new Date().toISOString().substr(0, 10),
    validUntil: new Date().toISOString().substr(0, 10),
    isEditing: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    // Clear success message after 3 seconds
    const timer = setTimeout(() => {
      dispatch(clearSuccessMessage());
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage, dispatch]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setValues({
      ...values,
      [name]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await dispatch(
        createBanner({
          bannerData: {
            ...values,
            picture: imageFile || values.picture,
          },
          setOpen,
        })
      );
    } catch (error) {
      console.error("Failed to create banner:", error);
      // Handle error
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
            htmlFor="title"
          >
            Title
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            name="name"
            type="text"
            value={values.name}
            onChange={handleInputChange}
            placeholder="Name"
            required
          />
        </div>
        {/* <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="link">
            Link
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="link"
            name="link"
            type="text"
            value={values.link}
            onChange={handleInputChange}
            placeholder="Link"
            required
          />
        </div> */}
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="status"
          >
            Status
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="state"
            name="state"
            value={values.state}
            onChange={handleInputChange}
          // required
          >
            <option value="" disabled>
              Select State
            </option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="startDate"
          >
            Start Date
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="validFrom"
            name="validFrom"
            type="date"
            value={values.validFrom}
            onChange={handleInputChange}
          // required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="endDate"
          >
            End Date
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="validUntil"
            name="validUntil"
            type="date"
            value={values.validUntil}
            onChange={handleInputChange}
          // required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="image"
          >
            Banner Image
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="picture"
            name="picture"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            placeholder="Banner Image"
            required
          />
        </div>
        {successMessage && (
          <div className="text-green-500">{successMessage}</div>
        )}
        <div className="flex items-center gap-5">
          <button
            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading && "opacity-50 cursor-not-allowed"
              }`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Banner"}
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

export default CreateBanner;
