import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../../components/AdminLayout';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Car, Plus, Search, MoreVertical, Edit, Download, Trash2, Loader2, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { CAR_CATEGORIES } from '../../shared/constants';

const CarManagement = () => {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);
  const [previewCar, setPreviewCar] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch cars data
  const { data: cars = [], isLoading, refetch } = useQuery({ 
    queryKey: ['/api/cars'],
    retry: false 
  });

  // Filter cars
  const filteredCars = cars.filter((car: any) => {
    let matchesSearch = true;
    let matchesCategory = true;

    if (searchQuery) {
      matchesSearch = car.name.toLowerCase().includes(searchQuery.toLowerCase());
    }

    if (categoryFilter) {
      matchesCategory = car.category === categoryFilter;
    }

    return matchesSearch && matchesCategory;
  });

  // Delete car
  const handleDelete = async () => {
    if (!selectedCarId) return;

    try {
      const response = await fetch(`/api/cars/${selectedCarId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Voiture supprimée',
          description: 'La voiture a été supprimée avec succès',
        });
        refetch();
      } else {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la suppression de la voiture',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la suppression de la voiture',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedCarId(null);
    }
  };

  const confirmDelete = (carId: number) => {
    setSelectedCarId(carId);
    setDeleteDialogOpen(true);
  };

  const openPreview = (car: any) => {
    setPreviewCar(car);
    setPreviewOpen(true);
  };

  const downloadCar = (car: any) => {
    if (car.downloadUrl) {
      window.open(car.downloadUrl, '_blank');
    } else {
      toast({
        title: 'Erreur',
        description: 'Lien de téléchargement non disponible',
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminLayout title="Gestion des voitures">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une voiture..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Toutes catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes catégories</SelectItem>
              {CAR_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Link href="/admin/cars/upload">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Uploader une voiture
          </Button>
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-950 rounded-md border shadow-sm">
        <Table>
          <TableCaption>Liste des voitures ({filteredCars.length})</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Note</TableHead>
              <TableHead className="hidden md:table-cell">Date d'ajout</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Chargement des voitures...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCars.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  Aucune voiture trouvée
                </TableCell>
              </TableRow>
            ) : (
              filteredCars.map((car: any) => (
                <TableRow key={car.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Car className="h-4 w-4 mr-2 text-muted-foreground" />
                      {car.name}
                    </div>
                    {car.serverId && (
                      <div className="text-xs text-muted-foreground">
                        Serveur ID: {car.serverId}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{car.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${car.rating}%` }}></div>
                      <span className="ml-2 text-sm">{car.rating}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {car.uploadedAt 
                      ? new Date(car.uploadedAt).toLocaleDateString()
                      : 'Inconnue'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openPreview(car)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir les détails
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => downloadCar(car)}>
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLocation(`/admin/cars/edit/${car.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => confirmDelete(car.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Car Preview Dialog */}
      <AlertDialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Détails de la voiture</AlertDialogTitle>
          </AlertDialogHeader>
          
          {previewCar && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                {previewCar.imageUrl ? (
                  <img 
                    src={previewCar.imageUrl} 
                    alt={previewCar.name} 
                    className="w-full h-auto rounded-md object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 rounded-md flex items-center justify-center">
                    <Car className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-xl font-bold">{previewCar.name}</h3>
                <Badge variant="outline" className="mt-2">{previewCar.category}</Badge>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Note:</span>
                    <span>{previewCar.rating}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID:</span>
                    <span>{previewCar.id}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Serveur:</span>
                    <span>{previewCar.serverId || 'Aucun'}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date d'ajout:</span>
                    <span>{previewCar.uploadedAt 
                      ? new Date(previewCar.uploadedAt).toLocaleDateString()
                      : 'Inconnue'}</span>
                  </div>
                </div>
                
                {previewCar.specs && Object.keys(previewCar.specs).length > 0 && (
                  <Card className="mt-4">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold mb-2">Spécifications</h4>
                      <div className="text-sm space-y-1">
                        {Object.entries(previewCar.specs).map(([key, value]: [string, any]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}:</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <div className="flex space-x-2 mt-6">
                  <Button onClick={() => downloadCar(previewCar)} className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger
                  </Button>
                  
                  <Button variant="outline" onClick={() => setPreviewOpen(false)} className="flex-1">
                    Fermer
                  </Button>
                </div>
              </div>
            </div>
          )}
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement la voiture
              de notre base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default CarManagement;