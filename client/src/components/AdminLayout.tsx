import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const [location, navigate] = useLocation();
  const { logout, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, navigate]);
  
  const handleLogout = async () => {
    await logout();
    navigate("/");
    toast({
      title: "Déconnecté",
      description: "Vous avez été déconnecté avec succès.",
    });
  };
  
  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-64 bg-[#1E1E1E] lg:min-h-screen p-4">
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <a className="text-primary font-montserrat font-bold text-xl">LesAffranchis</a>
            </Link>
            <Button
              variant="ghost"
              className="lg:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => navigate("/admin")}
            >
              <i className="fas fa-bars"></i>
            </Button>
          </div>
          
          <div className="font-medium text-white mb-4">Navigation</div>
          <ul className="space-y-2">
            <li>
              <Link href="/admin">
                <a className={cn(
                  "flex items-center px-3 py-2 rounded-md",
                  location === "/admin" 
                    ? "text-primary bg-[#2A2A2A]"
                    : "text-gray-300 hover:text-white hover:bg-[#2A2A2A]"
                )}>
                  <i className="fas fa-home mr-2"></i> Tableau de bord
                </a>
              </Link>
            </li>
            <li>
              <Link href="/admin/servers">
                <a className={cn(
                  "flex items-center px-3 py-2 rounded-md",
                  location === "/admin/servers" 
                    ? "text-primary bg-[#2A2A2A]"
                    : "text-gray-300 hover:text-white hover:bg-[#2A2A2A]"
                )}>
                  <i className="fas fa-server mr-2"></i> Serveurs
                </a>
              </Link>
            </li>
            <li>
              <Link href="/admin/cars">
                <a className={cn(
                  "flex items-center px-3 py-2 rounded-md",
                  location === "/admin/cars" 
                    ? "text-primary bg-[#2A2A2A]"
                    : "text-gray-300 hover:text-white hover:bg-[#2A2A2A]"
                )}>
                  <i className="fas fa-car mr-2"></i> Voitures
                </a>
              </Link>
            </li>
            <li>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-[#2A2A2A]"
              >
                <i className="fas fa-sign-out-alt mr-2"></i> Déconnexion
              </button>
            </li>
          </ul>
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-4">
          <div className="bg-[#1E1E1E] rounded-lg p-4">
            <h1 className="text-xl font-montserrat font-semibold text-white mb-6">{title}</h1>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
