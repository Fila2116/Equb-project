import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import setAuthToken from "../../utils/setAuthToken";
import { fetchUser } from "../../store/features/admin/auth/authSlice";

if (localStorage.token) {
  setAuthToken(localStorage.token);
}
const Dashboard: React.FC = () => {
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  if (!isAuthenticated && token == null) {
    // console.log("User not authenticated");
    return <Navigate to="/" />;
  }

  return (
    <div className="dashboard-container ">
      <Sidebar />
      <main className="dashboard-content overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
