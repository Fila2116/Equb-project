import React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../store/store";
import { hasPermission } from "../../utils/hasPermission";
import { toast } from "sonner";
interface ProtectedRouteProps {
  children: JSX.Element;
  requiredPermissions: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions,
}) => {
  const { user, isLoading } = useAppSelector((state) => state.auth);
  // console.log("user:", user);
  // console.log("isLoading:", isLoading);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (
    !user ||
    !user.role ||
    !hasPermission(user.role.permissions, requiredPermissions)
  ) {
    toast.error("You're not allowed to perform the current operation");
    return <Navigate to="/dashboard/home" />;
  }

  return children;
};

export default ProtectedRoute;
