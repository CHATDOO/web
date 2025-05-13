import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const HeroSection = () => {
  return (
    <div className="relative pt-16 pb-32 overflow-hidden" 
         style={{
           backgroundImage: "url('https://images.unsplash.com/photo-1567774520610-6d619895340c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')",
           backgroundSize: "cover",
           backgroundPosition: "center"
         }}>
      <div className="absolute inset-0 bg-gradient-to-b from-dark/70 to-dark/90"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div className="text-center sm:text-left max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-montserrat font-bold text-white leading-tight">
            <span className="block">Serveurs</span>
            <span className="block text-primary">Assetto Corsa</span>
            <span className="block">Premium</span>
          </h1>
          <p className="mt-6 text-xl text-offwhite max-w-2xl mx-auto sm:mx-0">
            Rejoignez LesAffranchis pour une expérience de simulation de course inégalée. Téléchargez nos voitures et connectez-vous à nos serveurs.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row sm:justify-start justify-center gap-4">
            <Link href="/#servers">
              <Button className="px-8 py-6 text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition duration-300 shadow-lg shadow-primary/20">
                Nos Serveurs
              </Button>
            </Link>
            <Link href="/cars">
              <Button className="px-8 py-6 text-base font-medium rounded-md text-white bg-secondary hover:bg-secondary/90 transition duration-300 shadow-lg shadow-secondary/20">
                Nos Voitures
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Animated scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <i className="fas fa-chevron-down text-white text-2xl"></i>
      </div>
    </div>
  );
};

export default HeroSection;
