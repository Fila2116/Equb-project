import { useEffect, useState } from "react";
import {
  Banner,
  updateBanner,
} from "../../../store/features/admin/banner/BannerSlice";
import { useAppDispatch } from "../../../store/store";

interface EditBannerProps {
  banner: Banner;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditBanner: React.FC<EditBannerProps> = ({ banner, setOpen }) => {
  const dispatch = useAppDispatch();
  const [updatedBanner, setUpdatedBanner] = useState<Banner>({
    id: banner.id || "",
    name: banner.name || "",
    state: banner.state || "",
    picture: banner.picture || "",
    validFrom: banner.validFrom
      ? new Date(banner.validFrom).toISOString().split("T")[0]
      : "",
    validUntil: banner.validUntil
      ? new Date(banner.validUntil).toISOString().split("T")[0]
      : "",
    isEditing: banner.isEditing || false,
  });

  useEffect(() => {
    setUpdatedBanner((prevBanner) => ({
      ...prevBanner,
      id: banner.id || "",
      name: banner.name || "",
      state: banner.state || "",
      picture: banner.picture || "",
      validFrom: banner.validFrom
        ? new Date(banner.validFrom).toISOString().split("T")[0]
        : "",
      validUntil: banner.validUntil
        ? new Date(banner.validUntil).toISOString().split("T")[0]
        : "",
      isEditing: banner.isEditing || false,
    }));
  }, [banner]);

  const handleSubmit = () => {
    dispatch(updateBanner({ bannerData: updatedBanner, id: updatedBanner.id }));
    setOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUpdatedBanner((prevBanner) => ({
      ...prevBanner,
      [name]: value,
    }));
  };

  return (
    <div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="name"
        >
          Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="name"
          name="name"
          type="text"
          value={updatedBanner.name}
          onChange={handleInputChange}
          required
        />
      </div>

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
          value={updatedBanner.state}
          onChange={handleInputChange}
          required
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
          htmlFor="validFrom"
        >
          Valid From
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="validFrom"
          name="validFrom"
          type="date"
          value={updatedBanner.validFrom}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="validUntil"
        >
          Valid Until
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="validUntil"
          name="validUntil"
          type="date"
          value={updatedBanner.validUntil}
          onChange={handleInputChange}
          required
        />
      </div>

      {/* <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="picture">
            Picture URL
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="picture"
            name="picture"
            type="text"
            value={updatedBanner.picture}
            onChange={handleInputChange}
            required
          />
        </div> */}

      <div className="flex items-center justify-between">
        <button
          onClick={handleSubmit}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          Update Banner
        </button>
        <button
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="button"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditBanner;
