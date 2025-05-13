import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import ServerCard from "@/components/ServerCard";
import CategoryFilter from "@/components/CategoryFilter";
import { Skeleton } from "@/components/ui/skeleton";
import { Server, SERVER_CATEGORIES } from "@shared/schema";

const ServerList = () => {
  const [category, setCategory] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  
  const { data: servers, isLoading, isError } = useQuery<Server[]>({
    queryKey: ['/api/servers', category],
  });
  
  if (isLoading) {
    return (
      <section id="servers" className="py-16 bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-white">Nos Serveurs <span className="text-primary">Assetto Corsa</span></h2>
            <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
              Explorez nos serveurs optimisés pour une expérience de course immersive avec des configurations variées pour tous les pilotes.
            </p>
          </div>
          
          <div className="flex mb-8 overflow-x-auto scrollbar-hide space-x-4">
            {Array(6).fill(0).map((_, idx) => (
              <Skeleton key={idx} className="h-10 w-20 bg-gray-700" />
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, idx) => (
              <Skeleton key={idx} className="h-80 w-full bg-gray-700 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (isError || !servers) {
    return (
      <div className="py-16 bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-white">Erreur de chargement</h2>
          <p className="mt-4 text-lg text-gray-300">
            Une erreur est survenue lors du chargement des serveurs. Veuillez réessayer plus tard.
          </p>
        </div>
      </div>
    );
  }
  
  const handleCategoryChange = (selectedCategory: string | null) => {
    setCategory(selectedCategory);
  };
  
  const displayedServers = showAll ? servers : servers.slice(0, 3);
  
  return (
    <section id="servers" className="py-16 bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-white">Nos Serveurs <span className="text-primary">Assetto Corsa</span></h2>
          <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
            Explorez nos serveurs optimisés pour une expérience de course immersive avec des configurations variées pour tous les pilotes.
          </p>
        </div>

        <CategoryFilter 
          categories={['Tous', ...SERVER_CATEGORIES] as const}
          selectedCategory={category === null ? 'Tous' : category}
          onChange={handleCategoryChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedServers.map((server) => (
            <ServerCard key={server.id} server={server} />
          ))}
          
          {/* View more servers button */}
          {servers.length > 3 && (
            <div className="col-span-full flex justify-center mt-8">
              <Button 
                variant="outline" 
                className="px-6 py-3 bg-lightgray hover:bg-lightgray/80 text-white rounded-md font-medium transition duration-300"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Voir moins de serveurs' : 'Voir plus de serveurs'} 
                <i className={`fas fa-chevron-${showAll ? 'up' : 'right'} ml-2`}></i>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ServerList;
