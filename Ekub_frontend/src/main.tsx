import ReactDOM from "react-dom/client";
import React from "react";
import App from "./App.tsx";
import ForgotPassword from "./components/auth/forgetPassword.tsx";
import ResetPassword from "./components/auth/resetPassword.tsx";

import "./index.css";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PageNotFound from "./components/layout/PageNotFound.tsx";
import Dashboard from "./components/layout/Dashboard.tsx";
import FetchBanner from "./components/admin/banner/FetchBanner.tsx";
// import FetchBanks from "./components/admin/banks/FetchBanks.tsx";
import Equbs from "./components/admin/equb/equb/Equbs.tsx";
import DashboardPage from "./components/admin/dashboard/DashboardPage.tsx";
import FetchEqubCategories from "./components/admin/equb/equbCategory/FetchEqubCategories.tsx";
import FetchEqubTypes from "./components/admin/equb/equbType/FetchEqubTypes.tsx";
import Users from "./components/admin/users/Users.tsx";
import StaffAndRole from "./components/admin/StaffAndRoles/StaffAndRole.tsx";
import ProtectedRoute from "./components/layout/ProtectedRoute.tsx";
import FetchBrances from "./components/admin/branch/FetchBrances.tsx";
import Banks from "./components/admin/banks/Banks.tsx";
import UserProfile from "./components/admin/users/UserProfile.tsx";
import LotteryManagement from "./components/admin/lotteryManagement/LotteryManagement.tsx";
import LotteryDetail from "./components/admin/lotteryManagement/LotteryDetail.tsx";
import MemberProfile from "./components/admin/lotteryManagement/MemberProfile.tsx";
import Payments from "./components/admin/payment/Payment.tsx";
import LiveEqubSet from "./components/admin/lotteryManagement/LiveEqubSet.tsx";
import WinnerRequest from "./components/admin/lotteryManagement/WinnerRequest.tsx";
import FinanceAndOther from "./components/admin/financeAndOther/FinanceAndOther.tsx";
import { Toaster } from "sonner";
import FetchSettings from "./components/admin/settings/FetchSettings.tsx";
import Withdraws from "./components/admin/notification/index.tsx";
import FetchCompanyProfile from "./components/admin/companyProfile/FetchCompanyProfile.tsx";
import BrandingTheme from "./components/admin/brandingTheme/BrandingTheme.tsx";



const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <PageNotFound />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
    errorElement: <PageNotFound />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
    errorElement: <PageNotFound />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    children: [
      {
        path: "/dashboard/home",
        element: <DashboardPage />,
      },
      {
        path: "/dashboard/lottoryManagement",
        element: <LotteryManagement />,
      },
      {
        path: "/dashboard/brandingTheme",
        element: <BrandingTheme />,
      },
      {
        path: "/dashboard/lotterydetail/:id",
        element: <LotteryDetail />,
      },
      {
        path: "/dashboard/liveequbset",
        element: <LiveEqubSet />,
      },
      {
        path: "/dashboard/payment",
        element: <Payments />,
      },

      {
        path: "/dashboard/memberprofile/:id",
        element: <MemberProfile />,
      },
      {
        path: "/dashboard/winnerrequest/:id",
        element: <WinnerRequest />,
      },

      {
        path: "/dashboard/banks",
        element: <Banks />,
      },
      {
        path: "/dashboard/companyProfile",
        element: <FetchCompanyProfile />,
      },
      {
        path: "/dashboard/notifications",
        element: <Withdraws />,
      },
      {
        path: "/dashboard/banners",
        element: <FetchBanner />,
      },
      {
        path: "/dashboard/branches",
        element: <FetchBrances />,
      },
      {
        path: "/dashboard/settings",
        element: <FetchSettings />,
      },
      {
        path: "/dashboard/staffAndRoles",
        element: (
          <ProtectedRoute requiredPermissions={"staff"}>
            <StaffAndRole />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/equb",
        element: (
          <ProtectedRoute requiredPermissions={"equb"}>
            <Equbs />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/equb/types",
        element: (
          <ProtectedRoute requiredPermissions={"equb_type"}>
            <FetchEqubTypes />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/equb/category",
        element: (
          <ProtectedRoute requiredPermissions={"equb_category"}>
            <FetchEqubCategories />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/users",
        element: (
          <ProtectedRoute requiredPermissions={"user"}>
            <Users />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/financeAndOther",
        element: (
          <ProtectedRoute requiredPermissions={"user"}>
            <FinanceAndOther />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/users/:id",
        element: (
          <ProtectedRoute requiredPermissions={"user"}>
            <UserProfile />
          </ProtectedRoute>
        ),
      },

    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <Toaster position="top-right" offset={65} style={{ zIndex: 100 }} />
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
