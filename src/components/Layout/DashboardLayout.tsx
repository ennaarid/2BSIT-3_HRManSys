
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import {
  Users,
  BarChart2,
  Grid,
  FileText,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarItem = ({ icon, label, href, active }: SidebarItemProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
        active && "bg-gray-100 text-gray-900"
      )}
    >
      {icon}
      {label}
    </Link>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { signOut, user } = useAuth();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white p-4 shadow-lg transition-transform md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900">HR Management</h2>
          </div>

          <nav className="flex-1 space-y-1">
            <SidebarItem
              icon={<Users size={20} />}
              label="Employees"
              href="/dashboard"
              active={location.pathname === "/dashboard"}
            />
            <SidebarItem
              icon={<FileText size={20} />}
              label="Job History"
              href="/dashboard/job-history"
              active={location.pathname === "/dashboard/job-history"}
            />
            <SidebarItem
              icon={<Grid size={20} />}
              label="Departments"
              href="/dashboard/departments"
              active={location.pathname === "/dashboard/departments"}
            />
            <SidebarItem
              icon={<BarChart2 size={20} />}
              label="Jobs"
              href="/dashboard/jobs"
              active={location.pathname === "/dashboard/jobs"}
            />
          </nav>

          <div className="pt-4 mt-auto border-t">
            <div className="text-sm font-medium mb-2">
              {user?.email}
            </div>
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2"
              onClick={() => signOut()}
            >
              <LogOut size={16} />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen transition-all md:ml-64",
          isSidebarOpen ? "ml-64" : "ml-0"
        )}
      >
        <div className="container mx-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
