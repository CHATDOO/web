import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Determine if we're in the admin section
  const isAdminRoute = location.startsWith("/admin");

  return (
    <>
      <nav className={cn(
        "fixed w-full z-50 navbar-blur border-b transition-all duration-300",
        isScrolled || isAdminRoute ? "bg-darkgray/90 border-gray-800" : "bg-transparent border-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/">
                  <a className="text-primary font-montserrat font-bold text-2xl">LesAffranchis</a>
                </Link>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-6">
                <Link href="/">
                  <a className={cn(
                    "px-3 py-2 text-sm font-medium",
                    location === "/" ? "text-white border-b-2 border-primary" : "text-gray-300 hover:text-white"
                  )}>
                    Accueil
                  </a>
                </Link>
                <Link href="/#servers">
                  <a className={cn(
                    "px-3 py-2 text-sm font-medium text-gray-300 hover:text-white",
                    location.includes("/servers") && "text-white border-b-2 border-primary"
                  )}>
                    Serveurs
                  </a>
                </Link>
                <Link href="/cars">
                  <a className={cn(
                    "px-3 py-2 text-sm font-medium text-gray-300 hover:text-white",
                    location === "/cars" && "text-white border-b-2 border-primary"
                  )}>
                    Voitures
                  </a>
                </Link>
                <a href="#about" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
                  À Propos
                </a>
              </div>
            </div>
            <div className="flex items-center">
              {isAuthenticated && isAdmin ? (
                <Link href="/admin">
                  <Button variant="outline" className="border-primary text-white bg-transparent hover:bg-primary/10 glow-effect">
                    <i className="fas fa-tachometer-alt mr-2"></i> Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/admin/login">
                  <Button variant="outline" className="border-primary text-white bg-transparent hover:bg-primary/10 glow-effect">
                    <i className="fas fa-user mr-2"></i> Admin
                  </Button>
                </Link>
              )}
              <div className="ml-3 md:hidden">
                <button 
                  type="button" 
                  className="bg-lightgray p-2 rounded-md text-gray-300 hover:text-white"
                  onClick={toggleMenu}
                >
                  <i className="fas fa-bars"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={`md:hidden bg-darkgray ${isMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/">
              <a className={cn(
                "block px-3 py-2 text-base font-medium",
                location === "/" ? "text-white border-l-4 border-primary" : "text-gray-300 hover:text-white"
              )}>
                Accueil
              </a>
            </Link>
            <Link href="/#servers">
              <a className={cn(
                "block px-3 py-2 text-base font-medium text-gray-300 hover:text-white",
                location.includes("/servers") && "text-white border-l-4 border-primary"
              )}>
                Serveurs
              </a>
            </Link>
            <Link href="/cars">
              <a className={cn(
                "block px-3 py-2 text-base font-medium text-gray-300 hover:text-white",
                location === "/cars" && "text-white border-l-4 border-primary"
              )}>
                Voitures
              </a>
            </Link>
            <a href="#about" className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium">
              À Propos
            </a>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
