import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SERVER_CATEGORIES } from '../../shared/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Info, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Validation schema for server link
const linkSchema = z.object({
  connectionLink: z.string()
    .min(5, 'Lien de connexion requis')
    .refine(link => link.includes('?ip='), {
      message: 'Le lien doit contenir une adresse IP (format: ?ip=)'
    })
    .refine(link => link.includes('httpPort='), {
      message: 'Le lien doit contenir un port HTTP (format: httpPort=)'
    }),
  category: z.string().optional(),
});

// Validation schema for manual server
const manualSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  category: z.string().min(1, 'Veuillez sélectionner une catégorie'),
  maxPlayers: z.coerce.number().min(1, 'Le nombre de joueurs doit être d\'au moins 1'),
  connectionLink: z.string().min(5, 'Lien de connexion requis'),
  imageUrl: z.string().optional(),
});

type LinkFormValues = z.infer<typeof linkSchema>;
type ManualFormValues = z.infer<typeof manualSchema>;

const ServerAdd = () => {
  const [addMethod, setAddMethod] = useState('link');
  const [serverInfo, setServerInfo] = useState<any>(null);
  const [parsingStatus, setParsingStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Link form
  const linkForm = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      connectionLink: '',
      category: undefined,
    },
  });

  // Manual form
  const manualForm = useForm<ManualFormValues>({
    resolver: zodResolver(manualSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      maxPlayers: 20,
      connectionLink: '',
      imageUrl: '',
    },
  });

  // Mutation for parsing link
  const parseLinkMutation = useMutation({
    mutationFn: (data: LinkFormValues) => {
      setParsingStatus('parsing');
      return apiRequest('/api/servers/parse-link', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: (data) => {
      setParsingStatus('success');
      setServerInfo(data.serverInfo);
      
      // Fill in manual form with parsed data
      if (data.serverInfo) {
        manualForm.setValue('name', data.serverInfo.name || '');
        manualForm.setValue('description', data.serverInfo.description || 'Serveur Assetto Corsa');
        manualForm.setValue('maxPlayers', data.serverInfo.maxClients || 20);
        manualForm.setValue('connectionLink', linkForm.getValues('connectionLink'));
        manualForm.setValue('category', linkForm.getValues('category') || '');
      }
    },
    onError: (error) => {
      setParsingStatus('error');
      toast({
        title: 'Erreur lors de l\'analyse du lien',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation for creating server
  const createServerMutation = useMutation({
    mutationFn: (data: any) => {
      return apiRequest('/api/servers/create-from-link', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/servers'] });
      toast({
        title: 'Serveur ajouté avec succès',
        description: 'Le serveur a été ajouté à la base de données',
      });
      navigate('/admin/servers');
    },
    onError: (error) => {
      toast({
        title: 'Erreur lors de l\'ajout du serveur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation for creating server manually
  const createManualServerMutation = useMutation({
    mutationFn: (data: ManualFormValues) => {
      return apiRequest('/api/servers', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/servers'] });
      toast({
        title: 'Serveur ajouté avec succès',
        description: 'Le serveur a été ajouté à la base de données',
      });
      navigate('/admin/servers');
    },
    onError: (error) => {
      toast({
        title: 'Erreur lors de l\'ajout du serveur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onParseLink = (values: LinkFormValues) => {
    parseLinkMutation.mutate(values);
  };

  const onCreateFromLink = () => {
    createServerMutation.mutate({
      connectionLink: linkForm.getValues('connectionLink'),
      category: linkForm.getValues('category'),
    });
  };

  const onManualCreate = (values: ManualFormValues) => {
    createManualServerMutation.mutate(values);
  };

  return (
    <AdminLayout title="Ajouter un serveur">
      <Tabs
        defaultValue="link"
        value={addMethod}
        onValueChange={setAddMethod}
        className="max-w-3xl mx-auto"
      >
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="link">Ajouter depuis un lien</TabsTrigger>
          <TabsTrigger value="manual">Ajouter manuellement</TabsTrigger>
        </TabsList>
        
        <TabsContent value="link" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Ajouter un serveur depuis un lien AC</h3>
            
            <Form {...linkForm}>
              <form onSubmit={linkForm.handleSubmit(onParseLink)} className="space-y-4">
                <FormField
                  control={linkForm.control}
                  name="connectionLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lien de connexion</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://acstuff.ru/s/q:race/online/join?ip=..." 
                          {...field} 
                          disabled={parsingStatus === 'parsing'}
                        />
                      </FormControl>
                      <FormDescription>
                        Collez le lien de serveur Assetto Corsa (ex: depuis Content Manager)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={linkForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie (optionnel)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={parsingStatus === 'parsing'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une catégorie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SERVER_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        La catégorie sera détectée automatiquement si possible
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between pt-2">
                  <Button variant="outline" type="button" onClick={() => navigate('/admin/servers')}>
                    Annuler
                  </Button>
                  
                  <Button 
                    type="submit" 
                    disabled={parsingStatus === 'parsing' || !linkForm.formState.isValid}
                  >
                    {parsingStatus === 'parsing' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyse en cours...
                      </>
                    ) : 'Analyser le lien'}
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
          
          {parsingStatus === 'success' && serverInfo && (
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Informations du serveur</h3>
              
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Serveur trouvé</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Les informations du serveur ont été récupérées avec succès.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="font-medium">Nom:</div>
                  <div>{serverInfo.name || 'Non disponible'}</div>
                  
                  <div className="font-medium">Map:</div>
                  <div>{serverInfo.map || 'Non disponible'}</div>
                  
                  <div className="font-medium">Joueurs:</div>
                  <div>{serverInfo.clients || 0} / {serverInfo.maxClients || 0}</div>
                  
                  <div className="font-medium">Description:</div>
                  <div>{serverInfo.description || 'Non disponible'}</div>
                </div>
                
                <div className="pt-4">
                  <Button onClick={onCreateFromLink}>
                    Ajouter ce serveur
                  </Button>
                </div>
              </div>
            </Card>
          )}
          
          {parsingStatus === 'error' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erreur lors de l'analyse</AlertTitle>
              <AlertDescription>
                Impossible d'analyser le lien ou de contacter le serveur. Vérifiez que le lien est correct
                et que le serveur est en ligne.
              </AlertDescription>
            </Alert>
          )}
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Comment ça marche</AlertTitle>
            <AlertDescription>
              Collez un lien de serveur Assetto Corsa pour récupérer automatiquement les informations
              du serveur. Le système tentera de se connecter au serveur pour obtenir les détails.
              Formats supportés: liens depuis Content Manager, acstuff.ru, etc.
            </AlertDescription>
          </Alert>
        </TabsContent>
        
        <TabsContent value="manual" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Ajouter un serveur manuellement</h3>
            
            <Form {...manualForm}>
              <form onSubmit={manualForm.handleSubmit(onManualCreate)} className="space-y-4">
                <FormField
                  control={manualForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du serveur</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom du serveur" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={manualForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Description du serveur" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={manualForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez une catégorie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                  
                  <FormField
                    control={manualForm.control}
                    name="maxPlayers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Joueurs max</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={manualForm.control}
                  name="connectionLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lien de connexion</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://acstuff.ru/s/q:race/online/join?ip=..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Lien pour rejoindre le serveur
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={manualForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL (optionnel)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/image.jpg" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        URL d'une image pour le serveur
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between pt-2">
                  <Button variant="outline" type="button" onClick={() => navigate('/admin/servers')}>
                    Annuler
                  </Button>
                  
                  <Button 
                    type="submit" 
                    disabled={!manualForm.formState.isValid || createManualServerMutation.isPending}
                  >
                    {createManualServerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Création en cours...
                      </>
                    ) : 'Créer le serveur'}
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default ServerAdd;