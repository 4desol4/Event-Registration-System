import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, Role } from "../context/AuthContext";
import { ShieldAlert } from "lucide-react";

interface Props {
  children: ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-white dark:bg-brand-dark-950" />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white dark:bg-brand-dark-950 px-6 text-center">
        <ShieldAlert size={32} className="text-brand-dark-300" />
        <p className="text-brand-dark-500 dark:text-brand-dark-300">
          You don't have permission to view this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
