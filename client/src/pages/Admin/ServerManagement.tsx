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
import { format } from 'date-fns';
import { Server, Plus, Search, MoreVertical, Edit, Trash2, Loader2, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { SERVER_CATEGORIES } from '../../shared/constants';

const ServerManagement = () => {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedServerId, setSelectedServerId] = useState<number | null>(null);

  // Fetch servers data
  const { data: servers = [], isLoading, refetch } = useQuery({ 
    queryKey: ['/api/servers'],
    retry: false 
  });

  // Filter servers
  const filteredServers = servers.filter((server: any) => {
    let matchesSearch = true;
    let matchesCategory = true;
    let matchesStatus = true;

    if (searchQuery) {
      matchesSearch = 
        server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        server.description.toLowerCase().includes(searchQuery.toLowerCase());
    }

    if (categoryFilter) {
      matchesCategory = server.category === categoryFilter;
    }

    if (statusFilter) {
      matchesStatus = 
        (statusFilter === 'online' && server.isOnline) ||
        (statusFilter === 'offline' && !server.isOnline);
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Delete server
  const handleDelete = async () => {
    if (!selectedServerId) return;

    try {
      const response = await fetch(`/api/servers/${selectedServerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Serveur supprimé',
          description: 'Le serveur a été supprimé avec succès',
        });
        refetch();
      } else {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la suppression du serveur',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la suppression du serveur',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedServerId(null);
    }
  };

  // Update server status
  const handleUpdateStatus = async (serverId: number) => {
    try {
      const response = await fetch(`/api/servers/${serverId}/update-status`, {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: 'Statut mis à jour',
          description: 'Le statut du serveur a été mis à jour avec succès',
        });
        refetch();
      } else {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la mise à jour du statut',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à jour du statut',
        variant: 'destructive',
      });
    }
  };

  const confirmDelete = (serverId: number) => {
    setSelectedServerId(serverId);
    setDeleteDialogOpen(true);
  };

  return (
    <AdminLayout title="Gestion des serveurs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un serveur..."
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
              {SERVER_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Tous statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous statuts</SelectItem>
              <SelectItem value="online">En ligne</SelectItem>
              <SelectItem value="offline">Hors ligne</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Link href="/admin/servers/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un serveur
          </Button>
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-950 rounded-md border shadow-sm">
        <Table>
          <TableCaption>Liste des serveurs ({filteredServers.length})</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Joueurs</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="hidden md:table-cell">Dernière mise à jour</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Chargement des serveurs...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredServers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  Aucun serveur trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredServers.map((server: any) => (
                <TableRow key={server.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Server className="h-4 w-4 mr-2 text-muted-foreground" />
                      {server.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                      {server.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{server.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {server.currentPlayers}/{server.maxPlayers}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${server.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span>{server.isOnline ? 'En ligne' : 'Hors ligne'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {server.lastUpdated 
                      ? format(new Date(server.lastUpdated), 'dd/MM/yyyy HH:mm')
                      : 'Jamais'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleUpdateStatus(server.id)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Mettre à jour le statut
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(server.connectionLink, '_blank')}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Ouvrir le lien
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLocation(`/admin/servers/edit/${server.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => confirmDelete(server.id)}
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
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement le serveur
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

export default ServerManagement;