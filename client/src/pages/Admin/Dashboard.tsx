import React from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../../components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, Car, Users, ActivityIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { formatNumber } from '@/lib/utils';

const Dashboard = () => {
  const { data: stats, isLoading: isLoadingStats } = useQuery({ 
    queryKey: ['/api/stats'],
    retry: false 
  });

  const { data: servers, isLoading: isLoadingServers } = useQuery({ 
    queryKey: ['/api/servers'],
    retry: false 
  });

  const { data: cars, isLoading: isLoadingCars } = useQuery({ 
    queryKey: ['/api/cars'],
    retry: false 
  });

  return (
    <AdminLayout title="Tableau de bord">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serveurs</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "..." : formatNumber(stats?.serverCount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Serveurs Assetto Corsa
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voitures</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "..." : formatNumber(stats?.carCount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Modèles disponibles
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Joueurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "..." : formatNumber(stats?.playerCount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Joueurs en ligne
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibilité</CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "..." : stats?.availability || "24/7"}
            </div>
            <p className="text-xs text-muted-foreground">
              Disponibilité des serveurs
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Serveurs récents</CardTitle>
            <CardDescription>
              Liste des derniers serveurs ajoutés
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingServers ? (
              <p>Chargement des serveurs...</p>
            ) : servers && servers.length > 0 ? (
              <div className="space-y-2">
                {servers.slice(0, 5).map((server) => (
                  <div key={server.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{server.name}</p>
                      <p className="text-sm text-muted-foreground">{server.category}</p>
                    </div>
                    <div className="text-sm text-right">
                      <p>{server.currentPlayers}/{server.maxPlayers} joueurs</p>
                      <p className={server.isOnline ? "text-green-500" : "text-red-500"}>
                        {server.isOnline ? "En ligne" : "Hors ligne"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Aucun serveur disponible</p>
            )}
            
            <div className="mt-4">
              <Link href="/admin/servers">
                <Button variant="outline" className="w-full">
                  Voir tous les serveurs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Voitures récentes</CardTitle>
            <CardDescription>
              Liste des dernières voitures ajoutées
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingCars ? (
              <p>Chargement des voitures...</p>
            ) : cars && cars.length > 0 ? (
              <div className="space-y-2">
                {cars.slice(0, 5).map((car) => (
                  <div key={car.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{car.name}</p>
                      <p className="text-sm text-muted-foreground">{car.category}</p>
                    </div>
                    <div className="text-sm text-right">
                      <p>{car.rating}/100 note</p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(car.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Aucune voiture disponible</p>
            )}
            
            <div className="mt-4">
              <Link href="/admin/cars">
                <Button variant="outline" className="w-full">
                  Voir toutes les voitures
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Gérez rapidement votre plateforme
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link href="/admin/servers/add">
              <Button>
                <Server className="mr-2 h-4 w-4" />
                Ajouter un serveur
              </Button>
            </Link>
            
            <Link href="/admin/cars/upload">
              <Button>
                <Car className="mr-2 h-4 w-4" />
                Upload une voiture
              </Button>
            </Link>
            
            <Button variant="outline" onClick={() => alert("Fonctionnalité à venir")}>
              <ActivityIcon className="mr-2 h-4 w-4" />
              Vérifier les serveurs
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;