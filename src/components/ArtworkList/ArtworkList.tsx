import React, { useEffect, useState } from "react";
import axios from "axios";
import { initializeApp } from "firebase/app";
import { getStorage, ref, deleteObject } from "firebase/storage";
import "firebase/storage";
import styles from "./Artwork.module.css";
import { EditableArtwork } from "../EditArtwork/EditArtwork";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT,
};

interface Artwork {
  _id: string;
  title?: string;
  artist?: string;
  description?: string;
  styles?: string[];
  size: string;
  price?: number;
  year?: number;
  available?: boolean;
  coleccion?: string;
  url: string;
}

const app = initializeApp(firebaseConfig);
const firebase = getStorage(app);

const ArtworkList: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [modalActive, setModalActive] = useState(false);

  useEffect(() => {
    // Fetch artworks from the backend API
    axios
      .get<Artwork[]>("http://localhost:3009/artworks")
      .then((response) => {
        setArtworks(response.data);
      })
      .catch((error) => {
        console.error("Error fetching artworks:", error);
      });
  }, []);

  const handleDelete = (id: string, url: string) => {
    // Create a reference to the file to delete
    const relativePath = decodeURIComponent(url).split("/o/")[1];
    const path = relativePath.split("?alt=")[0];
    console.log(path);
    const deleteRef = ref(firebase, path);

    deleteObject(deleteRef)
      .then(() => {
        console.log("Image deleted from Firebase Storage");
      })
      .catch((error: any) => {
        console.error("Error deleting image from Firebase Storage:", error);
      });

    // Send a delete request to the backend API
    axios
      .delete(`http://localhost:3009/artworks/${id}`)
      .then((response) => {
        // Remove the deleted artwork from the state
        setArtworks(artworks.filter((artwork) => artwork._id !== id));
      })
      .catch((error) => {
        console.error("Error deleting artwork:", error);
      });
  };

  return (
    <div className={styles.artworkListContainer}>
      <h1>Lista de obras</h1>
      <ul>
        {artworks.map((artwork) => (
          <li className={styles.artworkItem} key={artwork._id}>
            <img src={artwork.url} alt={artwork.title} />
            <div className={styles.artworkItemContent}>
              <button onClick={() => handleDelete(artwork._id, artwork.url)}>
                <strong>Borrar obra.</strong>
              </button>

              <button
                onClick={() => {
                  setModalActive(true);
                }}
              >
                Editar
              </button>

              <EditableArtwork
                setIsActive={setModalActive}
                artwork={artwork}
                isActive={modalActive}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ArtworkList;
