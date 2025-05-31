import { useState } from "react";
import { LuMail } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/store";
import {
  forgetPassword,
  forgetPasswordFormValues,
} from "../../store/features/admin/auth/authSlice";


function ForgotPassword() {
  const [identifier, setIdentifier] = useState<forgetPasswordFormValues>({
    emailOrPhoneNumber: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setIdentifier({
      ...identifier,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!identifier.emailOrPhoneNumber.trim()) {
      setError("Please enter your email or phone number.");
      return;
    }

    setError("");

    try {
      // Dispatch the forgetPassword action and wait for the result
      const resultAction = await dispatch(forgetPassword(identifier));

      // Check if the action was fulfilled and inspect the payload
      if (forgetPassword.fulfilled.match(resultAction)) {
        const response = resultAction.payload as any;

        // If backend responds with a failure status, show the message
        if (response.status === "fail") {
          setError(response );
          return;
        }

        // If success, proceed to show success message
        setSubmitted(true);
        console.log("Password reset request sent for:", identifier);

      } else if (forgetPassword.rejected.match(resultAction)) {
        const response = resultAction.payload as any;
        setError(response);
        return;
      }
    } catch (err) {
      setError("Unexpected error occurred.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold tracking-wide text-center mb-6 font-poppins text-gray-700">
          Forgot Password
        </h2>
        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-5 relative">
              <LuMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="emailOrPhoneNumber"
                type="text"
                name="emailOrPhoneNumber"
                value={identifier.emailOrPhoneNumber}
                onChange={(e) => handleInputChange(e)}
                placeholder=" "
                required
                className="peer w-full px-10 py-2 rounded-md border placeholder-transparent border-gray-300 focus:outline-none focus-within:border-primary"
              />
              <label
                htmlFor="identifier"
                className={`absolute left-10 px-1 -top-0 bg-white transform -translate-y-1/2 text-gray-400 transition-all duration-200 ease-in-out 
                peer-placeholder-shown:top-1/2 
                peer-placeholder-shown:text-base 
                peer-placeholder-shown:text-gray-400 
                peer-focus:-top-0 
                peer-focus:text-base 
                peer-focus:text-primary 
                ${identifier && "top-2 text-base text-gray-400"}`}
              >
                Email or Phone Number
              </label>
            </div>
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
            <button
              type="submit"
              className="w-full bg-primary text-white font-semibold py-2 rounded-md focus:outline-none hover:bg-btnHover"
            >
              Send OTP
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
        ) : (
          <div className="text-center text-gray-700">
            <p className="text-lg font-medium mb-2">Check Your Inbox</p>
            <p className="text-sm">
              If an account exists with that email or phone, a OTP has been sent.
            </p>
            <button
              onClick={() => navigate("/reset-password")}
              className="mt-6 inline-block text-primary hover:underline"
            >
              Reset Password
            </button>

          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
