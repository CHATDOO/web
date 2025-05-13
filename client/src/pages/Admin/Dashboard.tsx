import React from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../../components/AdminLayout';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  ServerIcon, 
  Car, 
  Users, 
  Activity,
  Gauge, 
  Plus,
  Settings, 
  Download,
  Loader2
} from 'lucide-react';

const Dashboard = () => {
  // Fetch stats data
  const { data: stats = {}, isLoading: isLoadingStats } = useQuery({ 
    queryKey: ['/api/stats'],
    retry: false 
  });

  // Fetch servers
  const { data: servers = {}, isLoading: isLoadingServers } = useQuery({ 
    queryKey: ['/api/servers'],
    retry: false 
  });

  // Fetch cars
  const { data: cars = {}, isLoading: isLoadingCars } = useQuery({ 
    queryKey: ['/api/cars'],
    retry: false 
  });

  const statCards = [
    {
      title: 'Serveurs actifs',
      value: stats.serverCount || 0,
      description: 'Serveurs Assetto Corsa enregistrés',
      icon: <ServerIcon className="h-5 w-5 text-primary" />,
      color: 'bg-blue-500/20',
      change: '+2 cette semaine',
      link: '/admin/servers'
    },
    {
      title: 'Voitures disponibles',
      value: stats.carCount || 0,
      description: 'Fichiers voitures prêts au téléchargement',
      icon: <Car className="h-5 w-5 text-primary" />,
      color: 'bg-yellow-500/20',
      change: '+5 ce mois',
      link: '/admin/cars'
    },
    {
      title: 'Joueurs en ligne',
      value: stats.playerCount || 0,
      description: 'Joueurs actifs sur tous les serveurs',
      icon: <Users className="h-5 w-5 text-primary" />,
      color: 'bg-green-500/20',
      change: '+12 aujourd\'hui',
      link: '/admin/servers'
    },
    {
      title: 'Disponibilité',
      value: stats.availability || '99.8%',
      description: 'Taux de disponibilité des serveurs',
      icon: <Activity className="h-5 w-5 text-primary" />,
      color: 'bg-purple-500/20',
      change: 'Stable',
      link: '/admin/servers'
    }
  ];

  // Chart data
  const playerData = [
    { name: 'Lun', joueurs: 32 },
    { name: 'Mar', joueurs: 45 },
    { name: 'Mer', joueurs: 38 },
    { name: 'Jeu', joueurs: 50 },
    { name: 'Ven', joueurs: 70 },
    { name: 'Sam', joueurs: 85 },
    { name: 'Dim', joueurs: 65 }
  ];

  const downloadData = [
    { name: 'GT3', téléchargements: 145 },
    { name: 'Drift', téléchargements: 98 },
    { name: 'Rallye', téléchargements: 75 },
    { name: 'JDM', téléchargements: 120 },
    { name: 'Supercars', téléchargements: 60 }
  ];

  const pieData = [
    { name: 'GT3', value: 35 },
    { name: 'Drift', value: 25 },
    { name: 'Rallye', value: 15 },
    { name: 'JDM', value: 15 },
    { name: 'Autre', value: 10 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD'];

  return (
    <AdminLayout title="Tableau de bord">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-medium">{card.title}</CardTitle>
                <div className={`p-2 rounded-md ${card.color}`}>
                  {card.icon}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
              <CardDescription className="mt-1">{card.description}</CardDescription>
            </CardContent>
            <CardFooter className="pt-0 justify-between">
              <div className="text-xs text-muted-foreground">{card.change}</div>
              <Link href={card.link}>
                <Button variant="ghost" size="sm">Détails</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activité des joueurs (7 derniers jours)</CardTitle>
            <CardDescription>Nombre moyen de joueurs en ligne par jour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={playerData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))' 
                    }} 
                  />
                  <Line type="monotone" dataKey="joueurs" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribution des voitures</CardTitle>
            <CardDescription>Par catégorie</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle>Derniers serveurs</CardTitle>
              <CardDescription>Serveurs récemment ajoutés</CardDescription>
            </div>
            <Link href="/admin/servers/add">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoadingServers ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : servers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun serveur trouvé
              </div>
            ) : (
              <Table>
                <TableBody>
                  {servers.slice(0, 5).map((server: any) => (
                    <TableRow key={server.id}>
                      <TableCell>
                        <div className="font-medium">{server.name}</div>
                        <div className="text-sm text-muted-foreground">{server.address}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{server.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${server.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span>{server.isOnline ? 'En ligne' : 'Hors ligne'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/servers/edit/${server.id}`}>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/admin/servers" className="w-full">
              <Button variant="outline" className="w-full">Voir tous les serveurs</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle>Dernières voitures</CardTitle>
              <CardDescription>Voitures récemment ajoutées</CardDescription>
            </div>
            <Link href="/admin/cars/upload">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoadingCars ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucune voiture trouvée
              </div>
            ) : (
              <Table>
                <TableBody>
                  {cars.slice(0, 5).map((car: any) => (
                    <TableRow key={car.id}>
                      <TableCell>
                        <div className="font-medium">{car.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Ajouté le {new Date(car.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{car.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Gauge className="h-4 w-4 text-muted-foreground" />
                          <span>{car.rating || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => window.open(car.downloadUrl, '_blank')}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/admin/cars" className="w-full">
              <Button variant="outline" className="w-full">Voir toutes les voitures</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Téléchargements par catégorie</CardTitle>
          <CardDescription>Nombre de téléchargements par catégorie de voiture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={downloadData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))' 
                  }} 
                />
                <Bar dataKey="téléchargements" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default Dashboard;