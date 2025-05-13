import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Car } from "@shared/schema";

const FeaturedCar = () => {
  const { data: featuredCar, isLoading } = useQuery<Car>({
    queryKey: ['/api/cars/5'],
  });
  
  const { toast } = useToast();
  
  const handleDownload = async () => {
    if (!featuredCar) return;
    
    try {
      const res = await apiRequest('GET', `/api/cars/${featuredCar.id}/download`, undefined);
      const data = await res.json();
      
      if (data.success) {
        toast({
          title: "Téléchargement démarré",
          description: `Le téléchargement de ${featuredCar.name} a commencé.`,
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur de téléchargement",
        description: "Une erreur est survenue lors du téléchargement.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <section className="py-20 relative bg-gradient-to-r from-dark via-dark/80 to-dark/30">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:w-1/2">
            <Skeleton className="h-6 w-32 bg-gray-700 mb-4" />
            <Skeleton className="h-10 w-64 bg-gray-700 mb-6" />
            <Skeleton className="h-20 w-full bg-gray-700 mb-8" />
            <div className="flex flex-wrap gap-4">
              {Array(4).fill(0).map((_, idx) => (
                <Skeleton key={idx} className="h-16 w-24 bg-gray-700" />
              ))}
            </div>
            <div className="mt-8">
              <Skeleton className="h-10 w-32 bg-gray-700" />
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  if (!featuredCar) return null;
  
  // Get specs from JSON object
  const specs = featuredCar.specs as Record<string, string> || {};
  
  return (
    <section className="py-20 relative" 
             style={{
               backgroundImage: "url('https://images.unsplash.com/photo-1619525515567-fda50fc02da5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=800')",
               backgroundSize: "cover",
               backgroundPosition: "center"
             }}>
      <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/80 to-dark/30"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:w-1/2">
          <span className="text-primary uppercase font-semibold tracking-wider">Voiture en Vedette</span>
          <h2 className="mt-2 text-3xl md:text-4xl font-montserrat font-bold text-white">{featuredCar.name}</h2>
          <p className="mt-4 text-lg text-gray-300">
            Découvrez l'expérience ultime avec notre {featuredCar.name}, maintenant disponible en téléchargement exclusif pour nos membres. Performance, précision et puissance combinées.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <div className="bg-darkgray/80 backdrop-blur-sm px-4 py-3 rounded-lg">
              <span className="block text-gray-400 text-sm">Puissance</span>
              <span className="text-white font-semibold">{specs.power || "520 HP"}</span>
            </div>
            <div className="bg-darkgray/80 backdrop-blur-sm px-4 py-3 rounded-lg">
              <span className="block text-gray-400 text-sm">0-100 km/h</span>
              <span className="text-white font-semibold">{specs.acceleration || "3.2 s"}</span>
            </div>
            <div className="bg-darkgray/80 backdrop-blur-sm px-4 py-3 rounded-lg">
              <span className="block text-gray-400 text-sm">Poids</span>
              <span className="text-white font-semibold">{specs.weight || "1,430 kg"}</span>
            </div>
            <div className="bg-darkgray/80 backdrop-blur-sm px-4 py-3 rounded-lg">
              <span className="block text-gray-400 text-sm">Conduite</span>
              <span className="text-white font-semibold">{specs.drive || "RWD"}</span>
            </div>
          </div>
          <div className="mt-8">
            <Button 
              onClick={handleDownload}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition duration-300"
            >
              <i className="fas fa-download mr-2"></i>Télécharger
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCar;
