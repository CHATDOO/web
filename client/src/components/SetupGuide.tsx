import { Button } from "@/components/ui/button";

const SetupGuide = () => {
  return (
    <section className="py-16 bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          <div>
            <span className="text-primary uppercase font-semibold tracking-wider">Guide d'installation</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-montserrat font-bold text-white">Optimisez votre expérience de simulation</h2>
            <p className="mt-4 text-lg text-gray-300">
              Suivez notre guide d'installation pour configurer parfaitement votre environnement Assetto Corsa et rejoindre nos serveurs en quelques étapes simples.
            </p>
            
            <div className="mt-8 space-y-5">
              <div className="flex bg-lightgray/40 p-4 rounded-lg">
                <div className="flex-shrink-0 text-primary text-2xl font-bold mr-4">1</div>
                <div>
                  <h3 className="text-white font-semibold">Téléchargez les voitures</h3>
                  <p className="text-gray-300 mt-1">Sélectionnez et téléchargez les voitures depuis notre catalogue.</p>
                </div>
              </div>
              
              <div className="flex bg-lightgray/40 p-4 rounded-lg">
                <div className="flex-shrink-0 text-primary text-2xl font-bold mr-4">2</div>
                <div>
                  <h3 className="text-white font-semibold">Installez dans votre dossier Assetto Corsa</h3>
                  <p className="text-gray-300 mt-1">Extrayez les fichiers dans le dossier content/cars de votre installation.</p>
                </div>
              </div>
              
              <div className="flex bg-lightgray/40 p-4 rounded-lg">
                <div className="flex-shrink-0 text-primary text-2xl font-bold mr-4">3</div>
                <div>
                  <h3 className="text-white font-semibold">Connectez-vous à nos serveurs</h3>
                  <p className="text-gray-300 mt-1">Utilisez le lien direct ou recherchez 'LesAffranchis' dans la liste des serveurs.</p>
                </div>
              </div>
              
              <div className="flex bg-lightgray/40 p-4 rounded-lg">
                <div className="flex-shrink-0 text-primary text-2xl font-bold mr-4">4</div>
                <div>
                  <h3 className="text-white font-semibold">Rejoignez notre communauté</h3>
                  <p className="text-gray-300 mt-1">Connectez-vous à notre Discord pour participer aux événements.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <Button variant="secondary" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition duration-300">
                <i className="fas fa-book mr-2"></i>Guide complet
              </Button>
            </div>
          </div>
          
          <div className="mt-10 lg:mt-0">
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <img 
                src="https://pixabay.com/get/gc159904dc7fa52f8196f0412ff2c55b28b3d3f96a768b85eb759d1bf3b25cf1d979685e964e7852d6e61b2692230841d8374c75e7f3795da4cd21542392df67c_1280.jpg" 
                alt="Racing simulator setup" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SetupGuide;
