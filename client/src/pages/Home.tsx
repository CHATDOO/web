import { Helmet } from "react-helmet";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import ServerList from "@/components/ServerList";
import FeaturedCar from "@/components/FeaturedCar";
import CarList from "@/components/CarList";
import SetupGuide from "@/components/SetupGuide";
import CommunitySection from "@/components/CommunitySection";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>LesAffranchis - Serveurs Assetto Corsa Premium</title>
        <meta name="description" content="Explorez les serveurs Assetto Corsa de LesAffranchis. Téléchargez des voitures personnalisées et rejoignez notre communauté de simulation de course." />
        <meta property="og:title" content="LesAffranchis - Serveurs Assetto Corsa Premium" />
        <meta property="og:description" content="Serveurs Assetto Corsa premium avec des voitures personnalisées à télécharger et une communauté active." />
        <meta property="og:type" content="website" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Helmet>
      
      <HeroSection />
      <StatsSection />
      <ServerList />
      <FeaturedCar />
      <CarList limit={4} />
      <SetupGuide />
      <CommunitySection />
    </>
  );
};

export default Home;
