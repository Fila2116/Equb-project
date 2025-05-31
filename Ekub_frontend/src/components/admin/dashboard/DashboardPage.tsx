/* eslint-disable react-refresh/only-export-components */
import withMainComponent from "../../layout/withMainComponent";
import { LuClock, LuUsers } from "react-icons/lu";
import Equbs from "./equb/Equbs";
import { FiCheckSquare } from "react-icons/fi";
import { FiBarChart } from "react-icons/fi";
import { Piechart } from "./Piechart";
import { BarChart } from "./BarChart";
import NavLink from "./NavLink";

import { hasPermission } from "../../../utils/hasPermission";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { useEffect } from "react";
import { fetchEqubStats } from "../../../store/features/admin/equb/equbSlice";
import { fetchUsers } from "../../../store/features/admin/user/usersSlice";
import ConnectionErrorPage from "../../../utils/ErrorPage";

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { stats, isLoading, error } = useAppSelector((state) => state.equbs);

  const { user } = useAppSelector((state) => state.auth);

  // console.log("Equbs stats", stats?.totalEqubers);
  // Fetch users if the user has 'user' permission
  useEffect(() => {
    // Safely access the permissions from the authenticated user's role
    const permissions = user?.role?.permissions;

    // Only dispatch fetchUsers if 'user' permission is granted
    if (permissions && hasPermission(permissions, "user")) {
      dispatch(fetchUsers({ page: 1, limit: 5 }) as any);
    }
  }, [dispatch]);

  // Fetch users and equb stats if the user has 'equb' permission
  useEffect(() => {
    // Safely access the permissions from the authenticated user's role
    const permissions = user?.role?.permissions;

    // If the user has 'equb' permission, fetch equb stats
    if (permissions && hasPermission(permissions, "equb")) {
      dispatch(fetchEqubStats());
    }
  }, [dispatch]);

  // useEffect(() => {
  //   dispatch(fetchRunningEqubs({ page: 1, limit: 10 }) as any);
  //   dispatch(fetchAllEqubs({ page: 1, limit: 10 }) as any);
  //   dispatch(fetchClosedEqubs({ page: 1, limit: 10 }) as any);
  // }, [dispatch]);
  if (!user || !user.role) {
    return null;
  }

  if (error) {
    return <ConnectionErrorPage error={error} />;
  }

  // console.log(`running`, running);
  return (
    <div className="bg-[#F5F7FA] min-h-screen px-10 pt-10 font-poppins">
      <h1 className="text-lg font-semibold mb-6">Dashboard</h1>
      {isLoading ? (
        <div role="status" className="flex flex-col md:flex-row gap-4 md:gap-8">
          <div className="shadow-sm w-1/2 md:w-1/4 bg-slate-100 py-2 rounded h-32"></div>
          <div className="shadow-sm w-1/2 md:w-1/4 bg-slate-100 py-2 rounded h-32"></div>
          <div className="shadow-sm w-1/2 md:w-1/4 bg-slate-100 py-2 rounded h-32"></div>
          <div className="shadow-sm w-1/2 md:w-1/4 bg-slate-100 py-2 rounded h-32"></div>
        </div>
      ) : (

        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {hasPermission(user?.role?.permissions, "equb") && (
            <NavLink
              to={"/dashboard/equb/?tab=all"}
              title="All Equbs"
              count={stats?.totalEqubs || 0}
              change="+11.6%↝"
              Icon={FiBarChart}
            />)}
          {hasPermission(user?.role?.permissions, "user") && (
            <NavLink
              to={"/dashboard/users/?tab=registered"}
              title="All Equbers"
              count={stats?.totalEqubers || 0}
              change="+2.4%↝"
              Icon={LuUsers}
            />
          )}
          {hasPermission(user?.role?.permissions, "equb") && (
            <NavLink
              to={"/dashboard/equb/?tab=running"}
              title="Active Equbs"
              count={stats?.activeCount || 0}
              change="+5.3%↝"
              Icon={FiCheckSquare}
            />
          )}
          {hasPermission(user?.role?.permissions, "equb") && (
            <NavLink
              to={"/dashboard/equb/?tab=closed"}
              title="Closed Equbs"
              count={stats?.closedCount || 0}
              change="+2.7%↝"
              Icon={LuClock}
            />
          )}
        </div>

      )}

      <div className="my-4 flex justify-between items-center w-full">
        {hasPermission(user?.role?.permissions, "equb") && (
          <div className="w-2/5 mr-2">
            <Piechart
              active={stats?.percentages.active}
              registering={stats?.percentages.registering}
              closed={stats?.percentages.closed}
            />
          </div>
        )}

        <div className="w-3/5 ">
          <BarChart />
        </div>
      </div>
      <div className="mt-16">
        {hasPermission(user?.role?.permissions, "equb") && <Equbs />}
      </div>
    </div>
  );
};

export default withMainComponent(DashboardPage);
