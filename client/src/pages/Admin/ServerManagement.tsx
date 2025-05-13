import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Server, InsertServer, insertServerSchema, SERVER_CATEGORIES } from "@shared/schema";

// Extended schema with validations
const serverFormSchema = insertServerSchema.extend({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  map: z.string().min(3, "Le nom de la carte doit contenir au moins 3 caractères"),
  maxPlayers: z.number().min(1, "Le nombre maximum de joueurs doit être au moins 1").max(128, "Le nombre maximum de joueurs ne peut pas dépasser 128"),
  currentPlayers: z.number().min(0, "Le nombre de joueurs actuels ne peut pas être négatif"),
  connectionLink: z.string().url("Veuillez entrer une URL valide"),
  imageUrl: z.string().url("Veuillez entrer une URL valide").optional().or(z.literal("")),
  trackCount: z.number().min(1, "Le nombre de pistes doit être au moins 1"),
});

type ServerFormValues = z.infer<typeof serverFormSchema>;

const ServerManagement = () => {
  const [isAddServerDialogOpen, setIsAddServerDialogOpen] = useState(false);
  const [isEditServerDialogOpen, setIsEditServerDialogOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [serverIdToDelete, setServerIdToDelete] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: servers, isLoading } = useQuery<Server[]>({
    queryKey: ['/api/servers'],
  });
  
  // Form for adding a new server
  const addServerForm = useForm<ServerFormValues>({
    resolver: zodResolver(serverFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: SERVER_CATEGORIES[0],
      map: "",
      maxPlayers: 24,
      currentPlayers: 0,
      isOnline: true,
      connectionLink: "ac://lesaffranchis.com:8081",
      imageUrl: "",
      trackCount: 1,
    },
  });
  
  // Form for editing an existing server
  const editServerForm = useForm<ServerFormValues>({
    resolver: zodResolver(serverFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: SERVER_CATEGORIES[0],
      map: "",
      maxPlayers: 24,
      currentPlayers: 0,
      isOnline: true,
      connectionLink: "",
      imageUrl: "",
      trackCount: 1,
    },
  });
  
  // Add server mutation
  const addServerMutation = useMutation({
    mutationFn: async (data: InsertServer) => {
      const response = await apiRequest('POST', '/api/servers', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/servers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Serveur ajouté",
        description: "Le serveur a été ajouté avec succès",
      });
      setIsAddServerDialogOpen(false);
      addServerForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de l'ajout du serveur: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Edit server mutation
  const editServerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertServer> }) => {
      const response = await apiRequest('PATCH', `/api/servers/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/servers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Serveur mis à jour",
        description: "Le serveur a été mis à jour avec succès",
      });
      setIsEditServerDialogOpen(false);
      setSelectedServer(null);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour du serveur: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete server mutation
  const deleteServerMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/servers/${id}`, undefined);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/servers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Serveur supprimé",
        description: "Le serveur a été supprimé avec succès",
      });
      setServerIdToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression du serveur: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onAddServerSubmit = (data: ServerFormValues) => {
    addServerMutation.mutate(data);
  };
  
  const onEditServerSubmit = (data: ServerFormValues) => {
    if (selectedServer) {
      editServerMutation.mutate({ id: selectedServer.id, data });
    }
  };
  
  const handleEditServer = (server: Server) => {
    setSelectedServer(server);
    
    // Set form values
    editServerForm.reset({
      name: server.name,
      description: server.description,
      category: server.category,
      map: server.map,
      maxPlayers: server.maxPlayers,
      currentPlayers: server.currentPlayers,
      isOnline: server.isOnline,
      connectionLink: server.connectionLink,
      imageUrl: server.imageUrl || "",
      trackCount: server.trackCount,
    });
    
    setIsEditServerDialogOpen(true);
  };
  
  const handleDeleteServer = (id: number) => {
    setServerIdToDelete(id);
  };
  
  const confirmDeleteServer = () => {
    if (serverIdToDelete !== null) {
      deleteServerMutation.mutate(serverIdToDelete);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Gestion des Serveurs - LesAffranchis Admin</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Helmet>
      
      <AdminLayout title="Gestion des Serveurs">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-400">
              Gérez vos serveurs Assetto Corsa, modifiez leurs paramètres et suivez leur état.
            </p>
          </div>
          <Dialog open={isAddServerDialogOpen} onOpenChange={setIsAddServerDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <i className="fas fa-plus mr-2"></i>Nouveau Serveur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-[#1E1E1E] text-white">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau serveur</DialogTitle>
              </DialogHeader>
              <Form {...addServerForm}>
                <form onSubmit={addServerForm.handleSubmit(onAddServerSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={addServerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du serveur</FormLabel>
                          <FormControl>
                            <Input placeholder="GT3 Racing Challenge" {...field} className="bg-[#2A2A2A] border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addServerForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Catégorie</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-[#2A2A2A] border-gray-700">
                                <SelectValue placeholder="Sélectionnez une catégorie" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#2A2A2A] border-gray-700">
                              {SERVER_CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={addServerForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Description de votre serveur..."
                            {...field}
                            className="bg-[#2A2A2A] border-gray-700 min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={addServerForm.control}
                      name="map"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Carte principale</FormLabel>
                          <FormControl>
                            <Input placeholder="Nürburgring GP" {...field} className="bg-[#2A2A2A] border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addServerForm.control}
                      name="trackCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de pistes</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              className="bg-[#2A2A2A] border-gray-700"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={addServerForm.control}
                      name="maxPlayers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre max. de joueurs</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              className="bg-[#2A2A2A] border-gray-700"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addServerForm.control}
                      name="currentPlayers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Joueurs actuels</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              className="bg-[#2A2A2A] border-gray-700"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addServerForm.control}
                      name="isOnline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>État</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(value === "true")}
                            defaultValue={field.value ? "true" : "false"}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-[#2A2A2A] border-gray-700">
                                <SelectValue placeholder="État du serveur" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#2A2A2A] border-gray-700">
                              <SelectItem value="true">En ligne</SelectItem>
                              <SelectItem value="false">Hors ligne</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={addServerForm.control}
                    name="connectionLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lien de connexion</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ac://lesaffranchis.com:8081"
                            {...field}
                            className="bg-[#2A2A2A] border-gray-700"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addServerForm.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL de l'image</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            {...field}
                            className="bg-[#2A2A2A] border-gray-700"
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          URL d'une image représentant votre serveur (optionnel)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <DialogClose asChild>
                      <Button variant="outline" className="border-gray-700">Annuler</Button>
                    </DialogClose>
                    <Button 
                      type="submit" 
                      className="bg-primary hover:bg-primary/90"
                      disabled={addServerMutation.isPending}
                    >
                      {addServerMutation.isPending && <i className="fas fa-spinner fa-spin mr-2"></i>}
                      Ajouter le serveur
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full bg-gray-700" />
            <Skeleton className="h-96 w-full bg-gray-700" />
          </div>
        ) : servers && servers.length > 0 ? (
          <div className="rounded-md border border-gray-700">
            <Table>
              <TableHeader className="bg-[#252525]">
                <TableRow>
                  <TableHead className="text-gray-300">Nom</TableHead>
                  <TableHead className="text-gray-300">Catégorie</TableHead>
                  <TableHead className="text-gray-300">Statut</TableHead>
                  <TableHead className="text-gray-300">Joueurs</TableHead>
                  <TableHead className="text-gray-300">Carte</TableHead>
                  <TableHead className="text-gray-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servers.map((server) => (
                  <TableRow key={server.id} className="border-t border-gray-700">
                    <TableCell className="font-medium text-white">{server.name}</TableCell>
                    <TableCell>{server.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className={`h-2 w-2 ${server.isOnline ? 'bg-green-500' : 'bg-red-500'} rounded-full mr-2 ${server.isOnline ? 'animate-pulse' : ''}`}></span>
                        <span>{server.isOnline ? 'En ligne' : 'Hors ligne'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{server.currentPlayers}/{server.maxPlayers}</TableCell>
                    <TableCell>{server.map}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 text-secondary hover:text-secondary/80"
                        onClick={() => handleEditServer(server)}
                      >
                        <i className="fas fa-edit"></i>
                        <span className="sr-only">Modifier</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 text-primary hover:text-primary/80"
                        onClick={() => handleDeleteServer(server.id)}
                      >
                        <i className="fas fa-trash-alt"></i>
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-10 border border-gray-700 rounded-md">
            <div className="text-4xl text-gray-500 mb-4">
              <i className="fas fa-server"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-300">Aucun serveur disponible</h3>
            <p className="text-gray-400 mt-2">Ajoutez votre premier serveur Assetto Corsa</p>
          </div>
        )}
        
        {/* Edit Server Dialog */}
        <Dialog open={isEditServerDialogOpen} onOpenChange={setIsEditServerDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-[#1E1E1E] text-white">
            <DialogHeader>
              <DialogTitle>Modifier le serveur</DialogTitle>
            </DialogHeader>
            <Form {...editServerForm}>
              <form onSubmit={editServerForm.handleSubmit(onEditServerSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editServerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du serveur</FormLabel>
                        <FormControl>
                          <Input placeholder="GT3 Racing Challenge" {...field} className="bg-[#2A2A2A] border-gray-700" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editServerForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-[#2A2A2A] border-gray-700">
                              <SelectValue placeholder="Sélectionnez une catégorie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#2A2A2A] border-gray-700">
                            {SERVER_CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={editServerForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Description de votre serveur..."
                          {...field}
                          className="bg-[#2A2A2A] border-gray-700 min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editServerForm.control}
                    name="map"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Carte principale</FormLabel>
                        <FormControl>
                          <Input placeholder="Nürburgring GP" {...field} className="bg-[#2A2A2A] border-gray-700" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editServerForm.control}
                    name="trackCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de pistes</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className="bg-[#2A2A2A] border-gray-700"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={editServerForm.control}
                    name="maxPlayers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre max. de joueurs</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className="bg-[#2A2A2A] border-gray-700"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editServerForm.control}
                    name="currentPlayers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Joueurs actuels</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className="bg-[#2A2A2A] border-gray-700"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editServerForm.control}
                    name="isOnline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>État</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value === "true")}
                          defaultValue={field.value ? "true" : "false"}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-[#2A2A2A] border-gray-700">
                              <SelectValue placeholder="État du serveur" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#2A2A2A] border-gray-700">
                            <SelectItem value="true">En ligne</SelectItem>
                            <SelectItem value="false">Hors ligne</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={editServerForm.control}
                  name="connectionLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lien de connexion</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ac://lesaffranchis.com:8081"
                          {...field}
                          className="bg-[#2A2A2A] border-gray-700"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editServerForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de l'image</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                          className="bg-[#2A2A2A] border-gray-700"
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500">
                        URL d'une image représentant votre serveur (optionnel)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <DialogClose asChild>
                    <Button variant="outline" className="border-gray-700">Annuler</Button>
                  </DialogClose>
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90"
                    disabled={editServerMutation.isPending}
                  >
                    {editServerMutation.isPending && <i className="fas fa-spinner fa-spin mr-2"></i>}
                    Mettre à jour
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Delete Server Alert Dialog */}
        <AlertDialog open={serverIdToDelete !== null} onOpenChange={(open) => !open && setServerIdToDelete(null)}>
          <AlertDialogContent className="bg-[#1E1E1E] text-white border border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce serveur ?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Cette action est irréversible. Toutes les données associées à ce serveur seront perdues.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-[#2A2A2A] border-gray-700 text-white hover:bg-[#333] hover:text-white">
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-primary hover:bg-primary/90"
                onClick={confirmDeleteServer}
                disabled={deleteServerMutation.isPending}
              >
                {deleteServerMutation.isPending && <i className="fas fa-spinner fa-spin mr-2"></i>}
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </>
  );
};

export default ServerManagement;
