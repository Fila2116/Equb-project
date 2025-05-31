import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/store";
import {
  resetPassword,
  resetPasswordFormValues,
} from "../../store/features/admin/auth/authSlice";

function ResetPassword() {
  const [formValues, setFormValues] = useState<resetPasswordFormValues>({
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formValues.otp || !formValues.password || !formValues.confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (formValues.password !== formValues.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");

    // Dispatch reset password action
    const result = await dispatch(resetPassword(formValues));

    if (resetPassword.fulfilled.match(result)) {
      setSuccessMessage("Password reset successfully!");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } else {
      setError("Invalid OTP or error occurred.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold tracking-wide text-center mb-6 font-poppins text-gray-700">
          Reset Password
        </h2>
        {successMessage ? (
          <div className="text-green-600 text-center font-medium">{successMessage}</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OTP Code
              </label>
              <input
                type="text"
                name="otp"
                value={formValues.otp}
                onChange={handleInputChange}
                placeholder="Enter the OTP code"
                required
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                name="password"
                value={formValues.password}
                onChange={handleInputChange}
                placeholder="Enter new password"
                required
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                title="Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formValues.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"

                required
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-primary"
              />
            </div>

            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

            <button
              type="submit"
              className="w-full bg-primary text-white font-semibold py-2 rounded-md focus:outline-none hover:bg-btnHover"
            >
              Reset Password
            </button>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-sm text-gray-600 hover:text-primary hover:underline transition"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
