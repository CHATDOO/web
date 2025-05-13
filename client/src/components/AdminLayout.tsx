import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Server, Car, LogOut, User, Settings } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const { logout } = useAuth();
  const [location, setLocation] = useLocation();

  // Determine active section
  const activePath = location.split('/')[2] || 'dashboard';

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Button variant="ghost" className="flex items-center mr-6">
              <ChevronLeft className="mr-2 h-4 w-4" />
              <span className="font-bold">Retour au site</span>
            </Button>
          </Link>
          <h1 className="text-lg font-semibold flex-1">
            Administration LesAffranchis
          </h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Déconnexion</span>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 container px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-3">
            <nav className="flex flex-col space-y-1">
              <Link href="/admin">
                <Button
                  variant={activePath === 'dashboard' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Tableau de bord</span>
                </Button>
              </Link>
              <Link href="/admin/servers">
                <Button
                  variant={activePath === 'servers' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  <Server className="mr-2 h-4 w-4" />
                  <span>Serveurs</span>
                </Button>
              </Link>
              <Link href="/admin/cars">
                <Button
                  variant={activePath === 'cars' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  <Car className="mr-2 h-4 w-4" />
                  <span>Voitures</span>
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button
                  variant={activePath === 'users' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Utilisateurs</span>
                </Button>
              </Link>
            </nav>
          </aside>

          {/* Main content */}
          <main className="col-span-12 lg:col-span-9 bg-card rounded-lg border shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            <Separator className="mb-6" />
            {children}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-4 bg-card mt-auto">
        <div className="container flex justify-between items-center px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} LesAffranchis
          </p>
          <p className="text-sm text-muted-foreground">
            Admin Panel v1.0
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;