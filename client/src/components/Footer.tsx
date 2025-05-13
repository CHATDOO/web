import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-darkgray border-t border-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <span className="text-primary font-montserrat font-bold text-2xl">LesAffranchis</span>
            <p className="mt-4 text-gray-300 text-sm">
              La référence française pour les serveurs Assetto Corsa et la simulation automobile.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-discord text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-youtube text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-facebook text-xl"></i>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-white font-medium">Navigation</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/">
                  <a className="text-gray-300 hover:text-white">Accueil</a>
                </Link>
              </li>
              <li>
                <Link href="/#servers">
                  <a className="text-gray-300 hover:text-white">Serveurs</a>
                </Link>
              </li>
              <li>
                <Link href="/cars">
                  <a className="text-gray-300 hover:text-white">Voitures</a>
                </Link>
              </li>
              <li>
                <a href="#about" className="text-gray-300 hover:text-white">À Propos</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Événements</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-medium">Ressources</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white">FAQ</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Support</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Tutoriels</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Configuration</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Blog</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-medium">Légal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Conditions d'utilisation</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Politique de confidentialité</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Mentions légales</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Contact</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} LesAffranchis. Tous droits réservés.</p>
          <p className="mt-4 md:mt-0 text-gray-400 text-sm">Assetto Corsa est une marque déposée de Kunos Simulazioni.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
