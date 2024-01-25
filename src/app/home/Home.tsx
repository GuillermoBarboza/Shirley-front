import React from "react";
import ArtworkList from "../components/ArtworkList/ArtworkList";
import AddArtworkForm from "../components/AddArtworkForm/AddArtworkForm";
import styles from "./Home.module.css";

const Home: React.FC = () => {
  return (
    <div className={`${styles.container} shadow-lg p-6 rounded-lg`}>
      <h1 className="prose prose-lg text-gray-800 font-bold mb-4">Panel de administración</h1>
      <p className="text-gray-600 mb-6">Aquí puedes agregar y eliminar obras de tu galería.</p>
      {/* Add more content or components as needed */}
      <AddArtworkForm />
      <ArtworkList />
    </div>

  );
};

export default Home;
