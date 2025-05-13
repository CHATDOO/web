import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ServerIcon, 
  Car, 
  Home, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  ChevronRight, 
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const [location] = useLocation();
  const { /* user, */ logout } = useAuth();
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({
    servers: location.startsWith('/admin/servers'),
    cars: location.startsWith('/admin/cars'),
  });

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const isActive = (path: string) => {
    return location === path;
  };

  const isActiveSection = (section: string) => {
    return location.startsWith(section);
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gray-950 text-white py-3 px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href="/admin">
            <div className="font-bold text-xl cursor-pointer">
              LesAffranchis Admin
            </div>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white">
              <Home className="h-4 w-4 mr-2" />
              Site public
            </Button>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white">
                <Settings className="h-4 w-4 mr-2" />
                Options
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={logout} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex">
        <aside className="w-64 bg-gray-900 text-white min-h-[calc(100vh-3rem)]">
          <div className="p-4">
            <nav className="space-y-1">
              <Link href="/admin">
                <Button
                  variant={isActive('/admin') ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>

              <Collapsible
                open={openMenus.servers}
                onOpenChange={() => toggleMenu('servers')}
                className="w-full"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant={isActiveSection('/admin/servers') ? "secondary" : "ghost"}
                    className="w-full justify-between"
                  >
                    <div className="flex items-center">
                      <ServerIcon className="h-4 w-4 mr-2" />
                      Serveurs
                    </div>
                    {openMenus.servers ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1 mt-1">
                  <Link href="/admin/servers">
                    <Button
                      variant={isActive('/admin/servers') ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                    >
                      Liste des serveurs
                    </Button>
                  </Link>
                  <Link href="/admin/servers/add">
                    <Button
                      variant={isActive('/admin/servers/add') ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un serveur
                    </Button>
                  </Link>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible
                open={openMenus.cars}
                onOpenChange={() => toggleMenu('cars')}
                className="w-full"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant={isActiveSection('/admin/cars') ? "secondary" : "ghost"}
                    className="w-full justify-between"
                  >
                    <div className="flex items-center">
                      <Car className="h-4 w-4 mr-2" />
                      Voitures
                    </div>
                    {openMenus.cars ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1 mt-1">
                  <Link href="/admin/cars">
                    <Button
                      variant={isActive('/admin/cars') ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                    >
                      Liste des voitures
                    </Button>
                  </Link>
                  <Link href="/admin/cars/upload">
                    <Button
                      variant={isActive('/admin/cars/upload') ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Uploader une voiture
                    </Button>
                  </Link>
                </CollapsibleContent>
              </Collapsible>

              <Link href="/admin/users">
                <Button
                  variant={isActive('/admin/users') ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Utilisateurs
                </Button>
              </Link>
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{title}</h1>
            <Separator className="mt-2" />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;