import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Server } from "@shared/schema";

interface ServerCardProps {
  server: Server;
}

const ServerCard = ({ server }: ServerCardProps) => {
  return (
    <Card className="gradient-card rounded-xl overflow-hidden shadow-xl border border-gray-800 transition duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(244,44,4,0.3)]">
      <div className="h-48 bg-lightgray overflow-hidden relative">
        <img 
          src={server.imageUrl || "https://pixabay.com/get/ge27d2d22d1bd66c58a848f5fb277ad1e9fbb23b545ffd07e606218a584cc506454b9e412e7b4df2444809338e4b0738e43085a0b444f62325a33b1541181219d_1280.jpg"} 
          alt={`${server.name} Server`} 
          className="w-full h-full object-cover"
        />
        <div className={`absolute top-3 right-3 ${server.isOnline ? 'bg-green-600' : 'bg-red-600'} text-white text-xs font-bold px-2 py-1 rounded-md flex items-center`}>
          <div className={`w-2 h-2 bg-white rounded-full mr-1 ${server.isOnline ? 'animate-pulse' : ''}`}></div>
          {server.isOnline ? 'ONLINE' : 'OFFLINE'}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark to-transparent h-24"></div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-montserrat font-semibold text-white">{server.name}</h3>
        <div className="flex items-center mt-2 text-gray-400">
          <i className="fas fa-users mr-2"></i>
          <span>{server.currentPlayers}/{server.maxPlayers} Joueurs</span>
        </div>
        <div className="flex items-center mt-1 text-gray-400">
          <i className="fas fa-map-marker-alt mr-2"></i>
          <span>{server.map}</span>
        </div>
        <div className="flex items-center mt-1 text-gray-400">
          <i className="fas fa-car mr-2"></i>
          <span>Voitures disponibles</span>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-primary font-medium">{server.trackCount} Pistes</span>
          <Link href={`/servers/${server.id}`}>
            <Button variant="outline" className="inline-flex items-center px-3 py-1.5 border border-primary text-sm font-medium rounded-md text-white bg-primary/10 hover:bg-primary hover:text-white transition duration-300">
              <i className="fas fa-link mr-2"></i>Détails
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default ServerCard;
