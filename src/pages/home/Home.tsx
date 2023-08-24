import React from "react";
import ArtworkList from "../../components/ArtworkList/ArtworkList";
import AddArtworkForm from "../../components/AddArtworkForm/AddArtworkForm";
import styles from "./Home.module.css";

const Home: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1>Panel de administracion</h1>
      <p>Aca puedes agregar y eliminar obras de tu galeria.</p>
      {/* Add more content or components as needed */}
      <AddArtworkForm />
      <ArtworkList />
    </div>
  );
};

export default Home;
