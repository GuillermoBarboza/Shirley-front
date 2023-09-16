"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { initializeApp } from "firebase/app";
import { getStorage, ref, deleteObject } from "firebase/storage";
import "firebase/storage";
import styles from "./Artwork.module.css";
import { EditableArtwork } from "../EditArtwork/EditArtwork";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT,
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
  const [activeArtwork, setActiveArtwork] = useState<Artwork | null>(null);

  useEffect(() => {
    // Fetch artworks from the backend API
    console.log(process.env.NEXT_PUBLIC_API_ENDPOINT);
    if (
      process.env.NEXT_PUBLIC_API_ENDPOINT &&
      process.env.NEXT_PUBLIC_API_ENDPOINT.length > 1
    ) {
      axios
        .get<Artwork[]>(process.env.NEXT_PUBLIC_API_ENDPOINT)
        .then((response) => {
          setArtworks(response.data);
        })
        .catch((error) => {
          console.error("Error fetching artworks:", error);
        });
    }
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
      .delete(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/${id}`)
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
            {/* @next/next/no-img-element */}
            <img src={artwork.url} alt={artwork.title || "Obra de shirley"} />
            <div className={styles.artworkItemContent}>
              <button onClick={() => handleDelete(artwork._id, artwork.url)}>
                <strong>Borrar obra.</strong>
              </button>

              <button
                onClick={() => {
                  setModalActive(true);
                  setActiveArtwork(artwork);
                }}
              >
                Editar
              </button>
            </div>
          </li>
        ))}
      </ul>
      {activeArtwork && (
        <EditableArtwork
          setIsActive={setModalActive}
          artwork={activeArtwork}
          isActive={modalActive}
        />
      )}
    </div>
  );
};

export default ArtworkList;
