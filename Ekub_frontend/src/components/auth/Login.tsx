import { useEffect, useState } from "react";
import {
  fetchUser,
  loginUser,
} from "../../store/features/admin/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { useNavigate } from "react-router-dom";
import { LuLock, LuMail } from "react-icons/lu";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
// import ConnectionErrorPage from "../../utils/ErrorPage";

const Login = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard/home");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Use Geolocation API to get the user's location
    //   try {
    //   const permission = await navigator.permissions.query({ name: 'geolocation' });

    //   if (permission.state === 'granted') {
    //     // Location already granted
    //     navigator.geolocation.getCurrentPosition(async (position) => {
    //       const latitude = pologinUsersition.coords.latitude;
    //       const longitude = position.coords.longitude;
    //       await dispatch(loginUser({ email, password, latitude, longitude }));
    //     });
    //   } else if (permission.state === 'prompt') {
    //     // Ask for location
    //     navigator.geolocation.getCurrentPosition(
    //       async (position) => {
    //         const latitude = position.coords.latitude;
    //         const longitude = position.coords.longitude;
    //         await dispatch(loginUser({ email, password, latitude, longitude }));
    //       },
    //       async () => {
    //         // User denied when prompted
    //         await dispatch(loginUser({ email, password }));
    //       }
    //     );
    //   } else {
    //     // "denied" state
    //     await dispatch(loginUser({ email, password }));
    //   }
    // } catch (error) {
    //   // Fallback in case of errors
    //   await dispatch(loginUser({ email, password }));
    // }
    await dispatch(loginUser({ email, password }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-medium tracking-wider text-center mb-4 font-poppins">
          Login
        </h2>
        <form onSubmit={handleLogin}>
          <div className="mb-5 relative">
            <LuMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              required
              className="peer w-full px-10 py-2 rounded-md border placeholder-transparent border-gray-300 focus:outline-none focus-within:border-primary"
            />
            <label
              htmlFor="email"
              className={`absolute left-10 px-1 -top-0 bg-white transform -translate-y-1/2 text-gray-400 transition-all duration-200 ease-in-out 
              peer-placeholder-shown:top-1/2 
              peer-placeholder-shown:text-base 
              peer-placeholder-shown:text-gray-400 
              peer-focus:-top-0
              peer-focus:text-base 
              peer-focus:text-primary 
              ${email && "top-2 text-base text-gray-400"}`}
            >
              Email
            </label>
          </div>
          <div className="mb-4 relative">
            <LuLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              required
              className="peer w-full px-10 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
            </button>
            <label
              htmlFor="password"
              className={`absolute left-10 px-1 -top-0 bg-white transform -translate-y-1/2 text-gray-400 transition-all duration-200 ease-in-out 
              peer-placeholder-shown:top-1/2 
              peer-placeholder-shown:text-base 
              peer-placeholder-shown:text-gray-400 
              peer-focus:-top-0 
              peer-focus:text-base 
              peer-focus:text-primary 
              ${password && "top-2 text-base text-gray-400"}`}
            >
              Password
            </label>
          </div>
          <div className="mb-2 min-h-4">
            {error && <div className="text-red-500 text-xs">{error}</div>}
          </div>
          <button
            type="submit"
            id="log-btn"
            disabled={isLoading}
            className="w-full bg-primary text-white font-semibold py-2 rounded-md focus:outline-none hover:bg-btnHover"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
          {/* Forgot Password Link */}
          <div className="mt-4 text-center">
            <a
              href="/forgot-password"
              className="text-sm text-primary hover:underline hover:text-btnHover transition-colors duration-200"
            >
              Forgot your password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
