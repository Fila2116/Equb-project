import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { clearSuccessMessage } from "../../../store/features/admin/CompanyProfile/companyProfileSlice";
import {
  NewCompanyProfile,
  createCompanyProfile,
} from "../../../store/features/admin/CompanyProfile/companyProfileSlice";
import ConnectionErrorPage from "../../../utils/ErrorPage";

const CreateCompanyProfile: React.FC = () => {
  const { isLoading, successMessage, error } = useAppSelector(
    (state) => state.companyProfile
  );
  const dispatch = useAppDispatch();

  const [values, setValues] = useState<NewCompanyProfile>({
    country: "",
    city: "",
    address: "",
    email: "",
    tel: "",
    isEditing: false,
  });

  const [formErrors, setFormErrors] = useState({
    country: "",
    city: "",
    address: "",
    email: "",
    tel: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearSuccessMessage());
    }, 3000);
    return () => clearTimeout(timer);
  }, [successMessage, dispatch]);

  const validate = () => {
    const errors: any = {};
    if (!values.country.trim()) errors.country = "Country is required";
    if (!values.city.trim()) errors.city = "City is required";
    if (!values.address.trim()) errors.address = "Address is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!values.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(values.email)) {
      errors.email = "Invalid email format";
    }

    const phoneRegex = /^[0-9]{7,15}$/;
    if (!values.tel.trim()) {
      errors.tel = "Phone number is required";
    } else if (!phoneRegex.test(values.tel)) {
      errors.tel = "Phone number must be 7–15 digits";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    await dispatch(createCompanyProfile(values));
    window.location.reload();

  };

  if (error) {
    return <ConnectionErrorPage error={error} />;
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {["country", "city", "address", "email", "tel"].map((field) => (
          <div className="mb-4" key={field}>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor={field}
            >
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                formErrors[field as keyof typeof formErrors] ? "border-red-500" : ""
              }`}
              id={field}
              name={field}
              type="text"
              value={
                typeof values[field as keyof NewCompanyProfile] === "boolean"
                  ? ""
                  : String(values[field as keyof NewCompanyProfile] ?? "")
              }
              onChange={handleInputChange}
              placeholder={field}
            />
            {formErrors[field as keyof typeof formErrors] && (
              <p className="text-red-500 text-xs italic">
                {formErrors[field as keyof typeof formErrors]}
              </p>
            )}
          </div>
        ))}

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
            {isLoading ? "Creating..." : "Create Company Profile"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCompanyProfile;
