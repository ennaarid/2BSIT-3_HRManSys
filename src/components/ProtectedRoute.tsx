
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useUserRole } from "../hooks/useUserRole";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isBlocked, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if authentication is complete
    if (!authLoading && !user) {
      toast.error("Please log in to access this page");
      navigate("/login");
      return;
    }
    
    // Check if user role is loaded and user is blocked
    if (!roleLoading && user && isBlocked) {
      toast.error("Your account has been blocked. Please contact an administrator.");
      navigate("/login");
    }
  }, [user, authLoading, isBlocked, roleLoading, navigate]);

  // Show loading while checking authentication or role
  if (authLoading || roleLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-green-500" />
      </div>
    );
  }

  // If user is authenticated and not blocked, render children
  if (user && !isBlocked) {
    return <>{children}</>;
  }

  // This should not be visible (redirect happens in the useEffect)
  return null;
};

export default ProtectedRoute;
