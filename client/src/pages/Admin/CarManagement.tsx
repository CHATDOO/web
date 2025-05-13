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
} from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Car, InsertCar, Server, insertCarSchema, CAR_CATEGORIES } from "@shared/schema";

// Extended schema with validations
const carFormSchema = insertCarSchema.extend({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  category: z.string().min(1, "La catégorie est requise"),
  downloadUrl: z.string().url("Veuillez entrer une URL valide"),
  imageUrl: z.string().url("Veuillez entrer une URL valide").optional().or(z.literal("")),
  rating: z.number().min(0, "La note doit être au moins 0").max(50, "La note ne peut pas dépasser 50"),
});

type CarFormValues = z.infer<typeof carFormSchema>;

const CarManagement = () => {
  const [isAddCarDialogOpen, setIsAddCarDialogOpen] = useState(false);
  const [isEditCarDialogOpen, setIsEditCarDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [carIdToDelete, setCarIdToDelete] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: cars, isLoading } = useQuery<Car[]>({
    queryKey: ['/api/cars'],
  });
  
  const { data: servers } = useQuery<Server[]>({
    queryKey: ['/api/servers'],
  });
  
  // Form for adding a new car
  const addCarForm = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      name: "",
      category: CAR_CATEGORIES[0],
      imageUrl: "",
      downloadUrl: "/api/cars/download",
      rating: 40,
      specs: {},
      serverId: undefined,
    },
  });
  
  // Form for editing an existing car
  const editCarForm = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      name: "",
      category: CAR_CATEGORIES[0],
      imageUrl: "",
      downloadUrl: "/api/cars/download",
      rating: 40,
      specs: {},
      serverId: undefined,
    },
  });
  
  // Add car mutation
  const addCarMutation = useMutation({
    mutationFn: async (data: InsertCar) => {
      const response = await apiRequest('POST', '/api/cars', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cars'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Voiture ajoutée",
        description: "La voiture a été ajoutée avec succès",
      });
      setIsAddCarDialogOpen(false);
      addCarForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de l'ajout de la voiture: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Edit car mutation
  const editCarMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCar> }) => {
      const response = await apiRequest('PATCH', `/api/cars/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cars'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Voiture mise à jour",
        description: "La voiture a été mise à jour avec succès",
      });
      setIsEditCarDialogOpen(false);
      setSelectedCar(null);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour de la voiture: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete car mutation
  const deleteCarMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/cars/${id}`, undefined);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cars'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Voiture supprimée",
        description: "La voiture a été supprimée avec succès",
      });
      setCarIdToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression de la voiture: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onAddCarSubmit = (data: CarFormValues) => {
    // Parse specs as JSON if provided as a string
    const specsObj = typeof data.specs === 'string' 
      ? JSON.parse(data.specs as unknown as string) 
      : data.specs;
    
    // Convert serverId to number or undefined
    const serverIdNum = data.serverId 
      ? typeof data.serverId === 'string' 
        ? parseInt(data.serverId) 
        : data.serverId
      : undefined;
    
    const formattedData = {
      ...data,
      specs: specsObj,
      serverId: serverIdNum,
    };
    
    addCarMutation.mutate(formattedData);
  };
  
  const onEditCarSubmit = (data: CarFormValues) => {
    if (selectedCar) {
      // Parse specs as JSON if provided as a string
      const specsObj = typeof data.specs === 'string' 
        ? JSON.parse(data.specs as unknown as string) 
        : data.specs;
      
      // Convert serverId to number or undefined
      const serverIdNum = data.serverId 
        ? typeof data.serverId === 'string' 
          ? parseInt(data.serverId) 
          : data.serverId
        : undefined;
      
      const formattedData = {
        ...data,
        specs: specsObj,
        serverId: serverIdNum,
      };
      
      editCarMutation.mutate({ id: selectedCar.id, data: formattedData });
    }
  };
  
  const handleEditCar = (car: Car) => {
    setSelectedCar(car);
    
    // Format specs as string if needed for the form
    const specsStr = typeof car.specs === 'object' 
      ? car.specs 
      : {};
    
    // Set form values
    editCarForm.reset({
      name: car.name,
      category: car.category,
      imageUrl: car.imageUrl || "",
      downloadUrl: car.downloadUrl,
      rating: car.rating,
      specs: specsStr,
      serverId: car.serverId,
    });
    
    setIsEditCarDialogOpen(true);
  };
  
  const handleDeleteCar = (id: number) => {
    setCarIdToDelete(id);
  };
  
  const confirmDeleteCar = () => {
    if (carIdToDelete !== null) {
      deleteCarMutation.mutate(carIdToDelete);
    }
  };
  
  // Helper function to get server name by id
  const getServerName = (serverId?: number) => {
    if (!serverId || !servers) return 'Aucun';
    const server = servers.find(s => s.id === serverId);
    return server ? server.name : 'Inconnu';
  };
  
  return (
    <>
      <Helmet>
        <title>Gestion des Voitures - LesAffranchis Admin</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Helmet>
      
      <AdminLayout title="Gestion des Voitures">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-400">
              Gérez vos voitures Assetto Corsa, ajoutez des fichiers à télécharger et associez-les aux serveurs.
            </p>
          </div>
          <Dialog open={isAddCarDialogOpen} onOpenChange={setIsAddCarDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <i className="fas fa-plus mr-2"></i>Nouvelle Voiture
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-[#1E1E1E] text-white">
              <DialogHeader>
                <DialogTitle>Ajouter une nouvelle voiture</DialogTitle>
              </DialogHeader>
              <Form {...addCarForm}>
                <form onSubmit={addCarForm.handleSubmit(onAddCarSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={addCarForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom de la voiture</FormLabel>
                          <FormControl>
                            <Input placeholder="Ferrari 488 GT3" {...field} className="bg-[#2A2A2A] border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addCarForm.control}
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
                              {CAR_CATEGORIES.map((category) => (
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={addCarForm.control}
                      name="serverId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Serveur associé</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-[#2A2A2A] border-gray-700">
                                <SelectValue placeholder="Sélectionnez un serveur (optionnel)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#2A2A2A] border-gray-700">
                              <SelectItem value="">Aucun</SelectItem>
                              {servers?.map((server) => (
                                <SelectItem key={server.id} value={server.id.toString()}>
                                  {server.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addCarForm.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Note (0-50)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="50"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              className="bg-[#2A2A2A] border-gray-700"
                            />
                          </FormControl>
                          <FormDescription className="text-gray-500">
                            Note sur 50: 50 = 5 étoiles, 40 = 4 étoiles, etc.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={addCarForm.control}
                    name="downloadUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL de téléchargement</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="/api/cars/123/download"
                            {...field}
                            className="bg-[#2A2A2A] border-gray-700"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addCarForm.control}
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
                          URL d'une image représentant la voiture (optionnel)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addCarForm.control}
                    name="specs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spécifications (JSON)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='{"power": "520 HP", "weight": "1,430 kg", "acceleration": "3.2s", "drive": "RWD"}'
                            {...field}
                            value={typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : field.value}
                            className="bg-[#2A2A2A] border-gray-700 min-h-[100px] font-mono text-sm"
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          Spécifications techniques au format JSON (optionnel)
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
                      disabled={addCarMutation.isPending}
                    >
                      {addCarMutation.isPending && <i className="fas fa-spinner fa-spin mr-2"></i>}
                      Ajouter la voiture
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
        ) : cars && cars.length > 0 ? (
          <div className="rounded-md border border-gray-700">
            <Table>
              <TableHeader className="bg-[#252525]">
                <TableRow>
                  <TableHead className="text-gray-300">Nom</TableHead>
                  <TableHead className="text-gray-300">Catégorie</TableHead>
                  <TableHead className="text-gray-300">Note</TableHead>
                  <TableHead className="text-gray-300">Serveur</TableHead>
                  <TableHead className="text-gray-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cars.map((car) => (
                  <TableRow key={car.id} className="border-t border-gray-700">
                    <TableCell className="font-medium text-white">{car.name}</TableCell>
                    <TableCell>{car.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="mr-2">{(car.rating / 10).toFixed(1)}</span>
                        <div className="flex text-yellow-500">
                          {Array.from({ length: 5 }).map((_, index) => {
                            const starValue = index + 1;
                            const rating = car.rating / 10;
                            return (
                              <i
                                key={index}
                                className={`fas ${
                                  starValue <= rating
                                    ? 'fa-star'
                                    : starValue - 0.5 <= rating
                                    ? 'fa-star-half-alt'
                                    : 'fa-star text-gray-600'
                                } text-xs`}
                              ></i>
                            );
                          })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getServerName(car.serverId)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 text-secondary hover:text-secondary/80"
                        onClick={() => handleEditCar(car)}
                      >
                        <i className="fas fa-edit"></i>
                        <span className="sr-only">Modifier</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 text-primary hover:text-primary/80"
                        onClick={() => handleDeleteCar(car.id)}
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
              <i className="fas fa-car"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-300">Aucune voiture disponible</h3>
            <p className="text-gray-400 mt-2">Ajoutez votre première voiture Assetto Corsa</p>
          </div>
        )}
        
        {/* Edit Car Dialog */}
        <Dialog open={isEditCarDialogOpen} onOpenChange={setIsEditCarDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-[#1E1E1E] text-white">
            <DialogHeader>
              <DialogTitle>Modifier la voiture</DialogTitle>
            </DialogHeader>
            <Form {...editCarForm}>
              <form onSubmit={editCarForm.handleSubmit(onEditCarSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editCarForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de la voiture</FormLabel>
                        <FormControl>
                          <Input placeholder="Ferrari 488 GT3" {...field} className="bg-[#2A2A2A] border-gray-700" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editCarForm.control}
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
                            {CAR_CATEGORIES.map((category) => (
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editCarForm.control}
                    name="serverId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serveur associé</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value?.toString() || ""}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-[#2A2A2A] border-gray-700">
                              <SelectValue placeholder="Sélectionnez un serveur (optionnel)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#2A2A2A] border-gray-700">
                            <SelectItem value="">Aucun</SelectItem>
                            {servers?.map((server) => (
                              <SelectItem key={server.id} value={server.id.toString()}>
                                {server.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editCarForm.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Note (0-50)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="50"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className="bg-[#2A2A2A] border-gray-700"
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          Note sur 50: 50 = 5 étoiles, 40 = 4 étoiles, etc.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={editCarForm.control}
                  name="downloadUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de téléchargement</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="/api/cars/123/download"
                          {...field}
                          className="bg-[#2A2A2A] border-gray-700"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editCarForm.control}
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
                        URL d'une image représentant la voiture (optionnel)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editCarForm.control}
                  name="specs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spécifications (JSON)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='{"power": "520 HP", "weight": "1,430 kg", "acceleration": "3.2s", "drive": "RWD"}'
                          {...field}
                          value={typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : field.value}
                          className="bg-[#2A2A2A] border-gray-700 min-h-[100px] font-mono text-sm"
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500">
                        Spécifications techniques au format JSON (optionnel)
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
                    disabled={editCarMutation.isPending}
                  >
                    {editCarMutation.isPending && <i className="fas fa-spinner fa-spin mr-2"></i>}
                    Mettre à jour
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Delete Car Alert Dialog */}
        <AlertDialog open={carIdToDelete !== null} onOpenChange={(open) => !open && setCarIdToDelete(null)}>
          <AlertDialogContent className="bg-[#1E1E1E] text-white border border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette voiture ?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Cette action est irréversible. Toutes les données associées à cette voiture seront perdues.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-[#2A2A2A] border-gray-700 text-white hover:bg-[#333] hover:text-white">
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-primary hover:bg-primary/90"
                onClick={confirmDeleteCar}
                disabled={deleteCarMutation.isPending}
              >
                {deleteCarMutation.isPending && <i className="fas fa-spinner fa-spin mr-2"></i>}
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <div className="mt-8 bg-[#252525] rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-medium text-white mb-4">Upload rapide de voiture</h3>
          <div className="bg-[#1E1E1E] rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nom de la voiture</label>
                <Input type="text" className="w-full bg-[#333333] border border-gray-700 rounded-md py-2 px-3 text-white" placeholder="Porsche 911 GT3 RS" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Catégorie</label>
                <Select>
                  <SelectTrigger className="w-full bg-[#333333] border border-gray-700">
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2A2A2A] border-gray-700">
                    {CAR_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Fichier</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-700 rounded-md">
                  <div className="space-y-1 text-center">
                    <i className="fas fa-cloud-upload-alt text-gray-400 text-2xl"></i>
                    <div className="text-sm text-gray-400 mt-1">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-[#2A2A2A] rounded-md font-medium text-primary hover:text-primary/80">
                        <span>Parcourir</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                      </label>
                      <p className="pl-1">ou glisser-déposer</p>
                    </div>
                    <p className="text-xs text-gray-500">ZIP ou RAR jusqu'à 100MB</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
                <i className="fas fa-upload mr-2"></i>Télécharger
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default CarManagement;
