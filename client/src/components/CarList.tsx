import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import CarCard from "@/components/CarCard";
import CategoryFilter from "@/components/CategoryFilter";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, CAR_CATEGORIES } from "@shared/schema";

interface CarListProps {
  serverId?: number;
  limit?: number;
}

const CarList = ({ serverId, limit }: CarListProps) => {
  const [category, setCategory] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  
  const endpoint = serverId 
    ? `/api/cars?serverId=${serverId}${category ? `&category=${category}` : ''}` 
    : `/api/cars${category ? `?category=${category}` : ''}`;
  
  const { data: cars, isLoading, isError } = useQuery<Car[]>({
    queryKey: [endpoint],
  });
  
  if (isLoading) {
    return (
      <section id="cars" className="py-16 bg-darkgray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex mb-8 overflow-x-auto scrollbar-hide space-x-4">
            {Array(7).fill(0).map((_, idx) => (
              <Skeleton key={idx} className="h-10 w-20 bg-gray-700" />
            ))}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, idx) => (
              <Skeleton key={idx} className="h-60 w-full bg-gray-700 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (isError || !cars) {
    return (
      <div className="py-16 bg-darkgray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-white">Erreur de chargement</h2>
          <p className="mt-4 text-lg text-gray-300">
            Une erreur est survenue lors du chargement des voitures. Veuillez réessayer plus tard.
          </p>
        </div>
      </div>
    );
  }
  
  const handleCategoryChange = (selectedCategory: string | null) => {
    setCategory(selectedCategory);
  };
  
  let displayedCars = cars;
  if (limit && !showAll) {
    displayedCars = cars.slice(0, limit);
  }
  
  return (
    <section id="cars" className="py-16 bg-darkgray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!serverId && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-white">Notre <span className="text-primary">Collection</span> de Voitures</h2>
            <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
              Téléchargez et pilotez nos voitures soigneusement modélisées avec des performances réalistes pour Assetto Corsa.
            </p>
          </div>
        )}

        <CategoryFilter 
          categories={['Toutes', ...CAR_CATEGORIES] as const}
          selectedCategory={category === null ? 'Toutes' : category}
          onChange={handleCategoryChange}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
          
          {/* View more cars button */}
          {limit && cars.length > limit && (
            <div className="col-span-full flex justify-center mt-8">
              <Button 
                variant="outline" 
                className="px-6 py-3 bg-lightgray hover:bg-lightgray/80 text-white rounded-md font-medium transition duration-300"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Voir moins de voitures' : 'Voir plus de voitures'} 
                <i className={`fas fa-chevron-${showAll ? 'up' : 'right'} ml-2`}></i>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CarList;
