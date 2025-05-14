
import { ReactNode, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  LayoutDashboard,
  Clock,
  Building,
  Briefcase,
  Database,
  Menu,
  LogOut,
  X,
  UserCog,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import { useIsMobile } from "@/hooks/use-mobile";

type Props = {
  children: ReactNode;
};

const DashboardLayout = ({ children }: Props) => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  useEffect(() => {
    // Close sidebar on mobile when route changes
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };
  
  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Employees", href: "/dashboard/employees", icon: Users },
    { name: "Job History", href: "/dashboard/job-history", icon: Clock },
    { name: "Departments", href: "/dashboard/departments", icon: Building },
    { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
    { name: "Database", href: "/dashboard/database", icon: Database },
  ];
  
  const adminMenuItems = [
    { name: "User Management", href: "/dashboard/user-management", icon: UserCog },
    { name: "Deleted Records", href: "/dashboard/deleted-records", icon: Trash2 },
  ];
  
  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between bg-white p-4 border-b lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
          <span className="sr-only">Toggle Menu</span>
        </Button>
        <div className="font-bold text-lg">HR Database</div>
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-hr-blue text-white">
            {userInitials}
          </AvatarFallback>
        </Avatar>
      </div>
      
      {/* Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-64 bg-white shadow-md z-30 transform transition-transform duration-300 ease-in-out",
          isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-center border-b">
            <h1 className="text-xl font-bold text-center">HR Database</h1>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100",
                    location.pathname === item.href && "bg-gray-100 font-medium"
                  )}
                  onClick={isMobile ? () => setSidebarOpen(false) : undefined}
                >
                  <item.icon className="h-5 w-5 mr-3 text-gray-500" />
                  {item.name}
                </Link>
              ))}

              {isAdmin && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admin
                  </div>
                  
                  {adminMenuItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100",
                        location.pathname === item.href && "bg-gray-100 font-medium"
                      )}
                      onClick={isMobile ? () => setSidebarOpen(false) : undefined}
                    >
                      <item.icon className="h-5 w-5 mr-3 text-gray-500" />
                      {item.name}
                    </Link>
                  ))}
                </>
              )}
            </nav>
          </div>
          
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-hr-blue text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium truncate max-w-[120px]">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title="Sign out"
              >
                <LogOut className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <main
        className={cn(
          "transition-all duration-300 ease-in-out",
          sidebarOpen ? "lg:ml-64" : "",
          isMobile ? "mt-16 p-4" : "p-8"
        )}
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
