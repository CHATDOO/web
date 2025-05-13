import { Button } from "@/components/ui/button";

const CommunitySection = () => {
  return (
    <section className="py-16 bg-darkgray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-white">Rejoignez notre <span className="text-primary">Communauté</span></h2>
          <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
            Participez à nos événements, championnats et rencontrez d'autres passionnés de simulation automobile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-dark rounded-xl p-6 text-center">
            <div className="text-4xl text-primary mb-4">
              <i className="fab fa-discord"></i>
            </div>
            <h3 className="text-xl font-montserrat font-semibold text-white">Discord</h3>
            <p className="mt-3 text-gray-300">
              Rejoignez plus de 1500 pilotes sur notre serveur Discord pour discuter, partager et organiser des courses.
            </p>
            <Button className="mt-5 inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-[#5865F2] hover:bg-[#5865F2]/90 transition duration-300">
              Rejoindre Discord
            </Button>
          </div>

          <div className="bg-dark rounded-xl p-6 text-center">
            <div className="text-4xl text-primary mb-4">
              <i className="fas fa-trophy"></i>
            </div>
            <h3 className="text-xl font-montserrat font-semibold text-white">Championnats</h3>
            <p className="mt-3 text-gray-300">
              Participez à nos championnats hebdomadaires et mensuels avec des récompenses et classements en ligne.
            </p>
            <Button variant="secondary" className="mt-5 inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white transition duration-300">
              Voir calendrier
            </Button>
          </div>

          <div className="bg-dark rounded-xl p-6 text-center">
            <div className="text-4xl text-primary mb-4">
              <i className="fab fa-youtube"></i>
            </div>
            <h3 className="text-xl font-montserrat font-semibold text-white">Streams & Vidéos</h3>
            <p className="mt-3 text-gray-300">
              Regardez nos courses en direct, des tutoriels et des replays de nos meilleurs événements.
            </p>
            <Button className="mt-5 inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-[#FF0000] hover:bg-[#FF0000]/90 transition duration-300">
              Chaîne YouTube
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
