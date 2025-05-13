import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils";

interface StatsData {
  serverCount: number;
  carCount: number;
  playerCount: number;
  availability: string;
}

const StatsSection = () => {
  const { data, isLoading, isError } = useQuery<StatsData>({
    queryKey: ['/api/stats'],
  });
  
  if (isLoading) {
    return (
      <div className="bg-darkgray py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {Array(4).fill(0).map((_, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <Skeleton className="h-10 w-16 bg-gray-700 mb-2" />
                <Skeleton className="h-5 w-32 bg-gray-700" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return null;
  }

  return (
    <div className="bg-darkgray py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-montserrat font-bold text-primary">{data.serverCount}</p>
            <p className="mt-2 text-offwhite">Serveurs Actifs</p>
          </div>
          <div>
            <p className="text-4xl font-montserrat font-bold text-primary">{formatNumber(data.carCount)}</p>
            <p className="mt-2 text-offwhite">Voitures</p>
          </div>
          <div>
            <p className="text-4xl font-montserrat font-bold text-primary">{formatNumber(data.playerCount)}</p>
            <p className="mt-2 text-offwhite">Membres</p>
          </div>
          <div>
            <p className="text-4xl font-montserrat font-bold text-primary">{data.availability}</p>
            <p className="mt-2 text-offwhite">Disponibilité</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
