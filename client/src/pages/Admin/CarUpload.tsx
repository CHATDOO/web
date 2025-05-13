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
import { toast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Check, Info, AlertTriangle, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Validation schema
const uploadSchema = z.object({
  carFile: z.instanceof(FileList).refine(files => files.length > 0, {
    message: 'Veuillez sélectionner un fichier ZIP',
  }).refine(files => {
    const file = files[0];
    return file.type === 'application/zip' || file.name.endsWith('.zip');
  }, {
    message: 'Le fichier doit être au format ZIP',
  }).refine(files => {
    const file = files[0];
    return file.size <= 50 * 1024 * 1024; // 50MB
  }, {
    message: 'Le fichier ne doit pas dépasser 50MB',
  }),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

const CarUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [uploadResult, setUploadResult] = useState<any>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      carFile: undefined,
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      setUploadStatus('uploading');
      
      const xhr = new XMLHttpRequest();
      
      // Setup progress tracking
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };
      
      // Create a promise that resolves when the upload is complete
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadStatus('processing');
            try {
              const response = JSON.parse(xhr.responseText);
              setUploadStatus('success');
              setUploadResult(response);
              resolve(response);
            } catch (error) {
              setUploadStatus('error');
              reject(new Error('Invalid response format'));
            }
          } else {
            setUploadStatus('error');
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => {
          setUploadStatus('error');
          reject(new Error('Upload failed'));
        };
      });
      
      // Send the request
      xhr.open('POST', '/api/cars/upload');
      xhr.send(data);
      
      return uploadPromise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cars'] });
      toast({
        title: 'Voiture uploadée avec succès',
        description: 'La voiture a été ajoutée à la base de données',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur lors de l\'upload',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: UploadFormValues) => {
    const formData = new FormData();
    const file = values.carFile[0];
    formData.append('carFile', file);
    
    uploadMutation.mutate(formData);
  };

  const resetUpload = () => {
    form.reset();
    setUploadStatus('idle');
    setUploadProgress(0);
    setUploadResult(null);
  };

  return (
    <AdminLayout title="Uploader une voiture">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          {uploadStatus === 'success' ? (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Upload réussi</AlertTitle>
                <AlertDescription className="text-green-700">
                  La voiture "{uploadResult?.car?.name}" a été ajoutée avec succès.
                </AlertDescription>
              </Alert>
              
              <div className="border rounded-md p-4 space-y-2">
                <h3 className="font-medium">Détails de la voiture:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Nom:</div>
                  <div>{uploadResult?.car?.name}</div>
                  
                  <div className="text-muted-foreground">Catégorie:</div>
                  <div>{uploadResult?.car?.category}</div>
                  
                  <div className="text-muted-foreground">ID:</div>
                  <div>{uploadResult?.car?.id}</div>
                </div>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <Button onClick={resetUpload} variant="outline">
                  Uploader une autre voiture
                </Button>
                <Button onClick={() => navigate('/admin/cars')}>
                  Voir toutes les voitures
                </Button>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="carFile"
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                      <FormLabel>Fichier de voiture (ZIP)</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".zip,application/zip"
                          onChange={(e) => onChange(e.target.files)}
                          disabled={uploadStatus !== 'idle'}
                          {...rest}
                        />
                      </FormControl>
                      <FormDescription>
                        Uploadez un fichier .zip contenant les données de la voiture Assetto Corsa
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {uploadStatus === 'uploading' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Upload en cours...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
                
                {uploadStatus === 'processing' && (
                  <Alert>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertTitle>Traitement en cours</AlertTitle>
                    <AlertDescription>
                      Le fichier a été uploadé et est en cours de traitement. Veuillez patienter...
                    </AlertDescription>
                  </Alert>
                )}
                
                {uploadStatus === 'error' && (
                  <Alert variant="destructive">
                    <X className="h-4 w-4" />
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>
                      Une erreur est survenue lors de l'upload ou du traitement du fichier. Veuillez réessayer.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex justify-between">
                  <Button variant="outline" type="button" onClick={() => navigate('/admin/cars')}>
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={uploadStatus !== 'idle' || !form.formState.isValid}
                  >
                    {uploadStatus === 'idle' ? 'Uploader' : 'En cours...'}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </Card>
        
        <Alert className="mt-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            Le système tentera d'extraire automatiquement les métadonnées de la voiture depuis le fichier ZIP,
            y compris le nom, la catégorie, les spécifications, et les images. Assurez-vous que le fichier
            contient une structure valide de voiture Assetto Corsa.
          </AlertDescription>
        </Alert>
      </div>
    </AdminLayout>
  );
};

export default CarUpload;