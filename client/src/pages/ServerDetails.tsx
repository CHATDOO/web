import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CarList from "@/components/CarList";
import { Server } from "@shared/schema";
import { toast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";

const ServerDetails = () => {
  const { id } = useParams();
  const serverId = parseInt(id);
  
  const { data: server, isLoading, isError } = useQuery<Server>({
    queryKey: [`/api/servers/${serverId}`],
  });
  
  if (isLoading) {
    return (
      <div className="py-20 bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-64 bg-gray-700 mb-4" />
          <Skeleton className="h-6 w-full max-w-xl bg-gray-700 mb-6" />
          <div className="h-64 bg-gray-700 rounded-xl mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, idx) => (
              <Skeleton key={idx} className="h-20 w-full bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (isError || !server) {
    return (
      <div className="py-20 bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-montserrat font-bold text-white">Serveur non trouvé</h1>
          <p className="mt-4 text-lg text-gray-300">
            Le serveur que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Link href="/#servers">
            <Button className="mt-8">Voir tous les serveurs</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const handleJoinServer = () => {
    // In a real app, this would launch the game with the server connection
    toast({
      title: "Lien de connexion",
      description: `Utilisez ce lien dans Assetto Corsa: ${server.connectionLink}`,
    });
  };
  
  return (
    <>
      <Helmet>
        <title>{server.name} - LesAffranchis Assetto Corsa</title>
        <meta name="description" content={`Détails du serveur ${server.name}: ${server.description}. Rejoignez le serveur et téléchargez les voitures compatibles.`} />
        <meta property="og:title" content={`${server.name} - LesAffranchis Assetto Corsa`} />
        <meta property="og:description" content={server.description} />
        <meta property="og:type" content="website" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Helmet>
      
      <div className="py-20 bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-montserrat font-bold text-white">{server.name}</h1>
              <p className="mt-2 text-gray-300">{server.description}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button
                onClick={handleJoinServer}
                className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md"
              >
                <i className="fas fa-link mr-2"></i> Rejoindre le serveur
              </Button>
            </div>
          </div>
          
          <div className="rounded-xl overflow-hidden h-80 relative mb-10">
            <img 
              src={server.imageUrl} 
              alt={server.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark to-transparent h-32"></div>
            <div className={`absolute top-4 right-4 ${server.isOnline ? 'bg-green-600' : 'bg-red-600'} text-white text-sm font-bold px-3 py-1 rounded-md flex items-center`}>
              <div className={`w-2 h-2 bg-white rounded-full mr-2 ${server.isOnline ? 'animate-pulse' : ''}`}></div>
              {server.isOnline ? 'ONLINE' : 'OFFLINE'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-[#1E1E1E] p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Détails du serveur</h3>
              <div className="space-y-2 text-gray-300">
                <div className="flex justify-between">
                  <span>Map:</span>
                  <span className="text-white">{server.map}</span>
                </div>
                <div className="flex justify-between">
                  <span>Catégorie:</span>
                  <span className="text-white">{server.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nombre de pistes:</span>
                  <span className="text-white">{server.trackCount}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-[#1E1E1E] p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Statistiques</h3>
              <div className="space-y-2 text-gray-300">
                <div className="flex justify-between">
                  <span>Joueurs:</span>
                  <span className="text-white">{server.currentPlayers}/{server.maxPlayers}</span>
                </div>
                <div className="flex justify-between">
                  <span>État:</span>
                  <span className={`${server.isOnline ? 'text-green-500' : 'text-red-500'}`}>
                    {server.isOnline ? 'En ligne' : 'Hors ligne'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Latence:</span>
                  <span className="text-white">{Math.floor(Math.random() * 50) + 10} ms</span>
                </div>
              </div>
            </div>
            
            <div className="bg-[#1E1E1E] p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Comment se connecter</h3>
              <p className="text-gray-300 text-sm mb-4">
                Vous pouvez rejoindre ce serveur directement depuis Assetto Corsa en utilisant le lien de connexion ou en recherchant "LesAffranchis" dans la liste des serveurs.
              </p>
              <Button variant="outline" onClick={handleJoinServer} className="w-full">
                <i className="fas fa-copy mr-2"></i> Copier le lien
              </Button>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-montserrat font-bold text-white mb-6">Voitures disponibles sur ce serveur</h2>
            <CarList serverId={serverId} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ServerDetails;
