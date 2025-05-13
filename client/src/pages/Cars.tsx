import { Helmet } from "react-helmet";
import CarList from "@/components/CarList";
import FeaturedCar from "@/components/FeaturedCar";

const Cars = () => {
  return (
    <>
      <Helmet>
        <title>Voitures Assetto Corsa - LesAffranchis</title>
        <meta name="description" content="Parcourez et téléchargez notre collection de voitures pour Assetto Corsa. Des modèles de haute qualité pour tous les styles de conduite." />
        <meta property="og:title" content="Voitures Assetto Corsa - LesAffranchis" />
        <meta property="og:description" content="Collection complète de voitures pour Assetto Corsa à télécharger. GT, JDM, F1, Drift, et plus." />
        <meta property="og:type" content="website" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Helmet>
      
      <div className="pt-16">
        <FeaturedCar />
        <CarList />
      </div>
    </>
  );
};

export default Cars;
