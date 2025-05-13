import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  username: z.string().min(1, "Le nom d'utilisateur est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

const Login = () => {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoggingIn(true);
    
    try {
      const success = await login(values.username, values.password);
      
      if (success) {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté en tant qu'administrateur.",
        });
        navigate("/admin");
      } else {
        toast({
          title: "Échec de la connexion",
          description: "Nom d'utilisateur ou mot de passe incorrect.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Admin Login - LesAffranchis</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center bg-dark py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h1 className="text-center text-3xl font-montserrat font-bold text-white">
              LesAffranchis
            </h1>
            <h2 className="mt-6 text-center text-2xl font-bold text-gray-300">
              Panneau d'Administration
            </h2>
          </div>
          
          <div className="bg-[#1E1E1E] p-8 rounded-xl shadow-lg border border-gray-800">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom d'utilisateur</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="admin" 
                          {...field} 
                          className="bg-[#2A2A2A] border-gray-700"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field}
                          className="bg-[#2A2A2A] border-gray-700"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt mr-2"></i>
                      Se connecter
                    </>
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Informations de connexion par défaut: admin / admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
