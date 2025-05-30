import React, { useState, useEffect } from "react";
import { FiWifiOff, FiAlertTriangle } from "react-icons/fi";

interface ErrorObject {
  statusCode: number;
  message: string;
}

interface ConnectionErrorPageProps {
  error: ErrorObject | null;
}

const ConnectionErrorPage: React.FC<ConnectionErrorPageProps> = ({ error }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const getErrorMessage = () => {
    if (!error) return "An unexpected error occurred.";
    switch (error.statusCode) {
      case 404:
        return "Oops! The page you're looking for can't be found.";
      case 500:
        return "Server error: something went wrong on our end. Please try again later!";
      case 403:
        return "Access denied: you don't have permission to view this resource.";
      default:
        return error.message || "An unexpected error occurred.";
    }
  };

  return (
    <div className="flex items-center justify-center  bg-gradient-to-br from-green-200 via-green-50 to-green-100 p-6">
      <div className="max-w- px-32 text-center bg-white p-10 rounded-3xl shadow-lg transition-all duration-500 ease-in-out transform hover:scale-105 animate-fade-in">
        {!isOnline ? (
          <div className="space-y-6">
            <FiWifiOff className="text-red-600 text-7xl animate-pulse mx-auto" />
            <h1 className="text-4xl font-bold text-red-600">
              No Internet Connection
            </h1>
            <p className="text-lg text-gray-700">
              It seems you're offline. Check your internet connection and try
              again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 mt-4 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 focus:outline-none transition ease-in-out duration-300"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <FiAlertTriangle className="text-yellow-500 text-7xl animate-bounce mx-auto" />
            <h1 className="text-4xl font-bold text-green-600">
              Error {error?.statusCode || ""}
            </h1>
            <p className="text-lg text-gray-800">{getErrorMessage()}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 mt-4 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 focus:outline-none transition ease-in-out duration-300"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionErrorPage;
