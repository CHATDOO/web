import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Server, Car } from "@shared/schema";

interface StatsData {
  serverCount: number;
  carCount: number;
  playerCount: number;
  availability: string;
}

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery<StatsData>({
    queryKey: ['/api/stats'],
  });

  const { data: servers, isLoading: serversLoading } = useQuery<Server[]>({
    queryKey: ['/api/servers'],
  });

  const { data: cars, isLoading: carsLoading } = useQuery<Car[]>({
    queryKey: ['/api/cars'],
  });

  // Prepare data for category distribution chart
  const getServerCategoryData = () => {
    if (!servers) return [];
    
    const categories: Record<string, number> = {};
    
    servers.forEach(server => {
      categories[server.category] = (categories[server.category] || 0) + 1;
    });
    
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  // Prepare data for car category distribution chart
  const getCarCategoryData = () => {
    if (!cars) return [];
    
    const categories: Record<string, number> = {};
    
    cars.forEach(car => {
      categories[car.category] = (categories[car.category] || 0) + 1;
    });
    
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  // Prepare data for player distribution chart
  const getPlayerData = () => {
    if (!servers) return [];
    
    return servers.map(server => ({
      name: server.name,
      players: server.currentPlayers,
      capacity: server.maxPlayers
    }));
  };

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <>
      <Helmet>
        <title>Tableau de Bord Admin - LesAffranchis</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Helmet>
      
      <AdminLayout title="Tableau de Bord">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Serveurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16 bg-gray-700" />
              ) : (
                <div className="text-2xl font-bold text-white flex items-center">
                  {stats?.serverCount} <i className="fas fa-server text-primary ml-2"></i>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Voitures
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16 bg-gray-700" />
              ) : (
                <div className="text-2xl font-bold text-white flex items-center">
                  {stats?.carCount} <i className="fas fa-car text-primary ml-2"></i>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Membres
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16 bg-gray-700" />
              ) : (
                <div className="text-2xl font-bold text-white flex items-center">
                  {stats?.playerCount} <i className="fas fa-users text-primary ml-2"></i>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Disponibilité
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16 bg-gray-700" />
              ) : (
                <div className="text-2xl font-bold text-white flex items-center">
                  {stats?.availability} <i className="fas fa-clock text-primary ml-2"></i>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Distribution des serveurs par catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              {serversLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <Skeleton className="h-64 w-64 rounded-full bg-gray-700" />
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getServerCategoryData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getServerCategoryData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Distribution des voitures par catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              {carsLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <Skeleton className="h-64 w-64 rounded-full bg-gray-700" />
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getCarCategoryData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getCarCategoryData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Occupation des serveurs</CardTitle>
          </CardHeader>
          <CardContent>
            {serversLoading ? (
              <div className="h-80 w-full bg-gray-700 rounded-lg animate-pulse" />
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getPlayerData()}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#ccc' }}
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis tick={{ fill: '#ccc' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#333' }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="players" name="Joueurs actuels" stackId="a" fill="hsl(var(--chart-1))" />
                    <Bar dataKey="capacity" name="Capacité totale" stackId="a" fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Serveurs actifs</CardTitle>
            </CardHeader>
            <CardContent>
              {serversLoading ? (
                <div className="space-y-2">
                  {Array(3).fill(0).map((_, idx) => (
                    <Skeleton key={idx} className="h-10 w-full bg-gray-700" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {servers && servers.filter(server => server.isOnline).slice(0, 5).map(server => (
                    <div key={server.id} className="flex items-center justify-between border-b border-gray-700 pb-2">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        <span className="text-white">{server.name}</span>
                      </div>
                      <div className="text-gray-400">
                        {server.currentPlayers}/{server.maxPlayers} Joueurs
                      </div>
                    </div>
                  ))}
                  {servers && servers.filter(server => server.isOnline).length === 0 && (
                    <div className="text-gray-400 text-center py-4">
                      Aucun serveur actif pour le moment
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Voitures populaires</CardTitle>
            </CardHeader>
            <CardContent>
              {carsLoading ? (
                <div className="space-y-2">
                  {Array(3).fill(0).map((_, idx) => (
                    <Skeleton key={idx} className="h-10 w-full bg-gray-700" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {cars && cars.sort((a, b) => b.rating - a.rating).slice(0, 5).map(car => (
                    <div key={car.id} className="flex items-center justify-between border-b border-gray-700 pb-2">
                      <span className="text-white">{car.name}</span>
                      <div className="flex items-center text-yellow-500">
                        {(car.rating / 10).toFixed(1)}
                        <i className="fas fa-star ml-1 text-sm"></i>
                      </div>
                    </div>
                  ))}
                  {cars && cars.length === 0 && (
                    <div className="text-gray-400 text-center py-4">
                      Aucune voiture disponible
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
};

export default Dashboard;
