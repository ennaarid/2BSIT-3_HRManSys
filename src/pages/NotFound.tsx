
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const isAuthenticated = localStorage.getItem("isAuthenticated");
  const homeRoute = isAuthenticated ? "/dashboard" : "/login";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-hr-blue mb-4">404</h1>
        <p className="text-xl text-hr-darkSlate mb-6">Oops! Page not found</p>
        <p className="text-hr-slate mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Button asChild className="bg-hr-blue hover:bg-blue-700">
          <Link to={homeRoute}>Back to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
