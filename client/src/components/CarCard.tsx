import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Car } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CarCardProps {
  car: Car;
}

const CarCard = ({ car }: CarCardProps) => {
  const { toast } = useToast();
  
  const handleDownload = async () => {
    try {
      const res = await apiRequest('GET', `/api/cars/${car.id}/download`, undefined);
      const data = await res.json();
      
      if (data.success) {
        toast({
          title: "Téléchargement démarré",
          description: `Le téléchargement de ${car.name} a commencé.`,
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

  // Convert rating (0-50) to stars (0-5)
  const starRating = Math.round((car.rating / 10) * 2) / 2;
  
  return (
    <Card className="bg-dark rounded-xl overflow-hidden shadow-lg border border-gray-800 transition duration-300 hover:scale-103">
      <div className="h-48 overflow-hidden">
        <img 
          src={car.imageUrl || "https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"} 
          alt={car.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-montserrat font-semibold text-white">{car.name}</h3>
        <div className="mt-2 flex justify-between items-center">
          <span className="text-sm text-gray-400">{car.category}</span>
          <div className="flex items-center">
            <span className="text-sm text-gray-400 mr-2">{(starRating).toFixed(1)}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <i 
                  key={star}
                  className={`fas ${
                    star <= starRating
                      ? 'fa-star'
                      : star - 0.5 <= starRating
                      ? 'fa-star-half-alt'
                      : 'fa-star text-gray-600'
                  } text-yellow-500 text-xs`}
                ></i>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Button 
            onClick={handleDownload}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-primary text-sm font-medium rounded-md text-white bg-primary/10 hover:bg-primary transition duration-300"
          >
            <i className="fas fa-download mr-2"></i>Télécharger
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CarCard;
