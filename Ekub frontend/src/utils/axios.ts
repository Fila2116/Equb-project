import axios from "axios";
import setAuthToken from "./setAuthToken";

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
});

let isRefreshing = false;
let failedQueue: Array<any> = [];

// Function to process queued requests during token refresh
const processQueue = (error: any, token: string | null = null) => {
  // console.log("Processing queued requests...");
  failedQueue.forEach((prom) => {
    if (token) {
      // console.log("Resolving queued request with new token:", token);
      prom.resolve(token);
    } else {
      // console.log(
      //   "Rejecting queued request due to error:",
      //   error?.message || error
      // );
      prom.reject(error);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // console.log("Response received:", response);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error(
      "Error encountered:",
      error.response?.status,
      error.response?.data
    );

    // Check for 401 Unauthorized and not already retried
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      // console.log("401 Unauthorized detected. Attempting token refresh...");
      originalRequest._retry = true;

      if (isRefreshing) {
        // console.log("Token refresh already in progress. Queuing request...");
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            // console.log("Retrying request with refreshed token.");
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch((err) => {
            // console.error("Error processing queued request:", err);
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          console.warn("Refresh token not found. Logging out...");
          throw new Error("Refresh token is missing.");
        }

        // console.log("Sending request to refresh token...");
        // console.log(
        //   "refresh request to endpoint:",
        //   `${process.env.REACT_APP_BASE_URL}/user/auth/refresh-token`
        // );
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/user/auth/refresh-token`,
          {}, // Pass refresh token in headers
          { headers: { Authorization: `Bearer ${refreshToken}` } }
        );

        // console.log("Token refresh response:", response);

        if (response.status !== 200 || !response.data?.data?.accessToken) {
          // console.error("Invalid refresh token response:", response.data);
          throw new Error("Failed to refresh token.");
        }

        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;

        // // console.log("Tokens refreshed successfully:", {
        //   accessToken,
        //   newRefreshToken,
        // });
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        setAuthToken(accessToken);

        processQueue(null, accessToken);
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError: any) {
        console.error(
          "Token refresh failed:",
          refreshError.response?.status,
          refreshError.response?.data
        );

        console.warn("Refresh token expired or invalid. Logging out...");
        const { store } = await import("../store/store");
        const { logout } = await import(
          "../store/features/admin/auth/authSlice"
        );
        store.dispatch(logout());

        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        // console.log("Token refresh process completed.");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
