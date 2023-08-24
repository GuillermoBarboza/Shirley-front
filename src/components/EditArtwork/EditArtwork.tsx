import React, { useEffect, useState } from "react";
import axios from "axios";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router";

import Styles from "./EditArtwork.module.css";

interface EditableArtworkProps {
  artwork: {
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
  };
  isActive: boolean;
  setIsActive: any;
}

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

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export const EditableArtwork: React.FC<EditableArtworkProps> = ({
  artwork,
  isActive,
  setIsActive,
}) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("Shirley Madero");
  const [styles, setStyles] = useState<string[]>([]);
  const [size, setSize] = useState("");
  const [year, setYear] = useState<number | undefined>(undefined);
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [url, setUrl] = useState("");
  const [available, setAvailable] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [coleccion, setCollection] = useState("");

  useEffect(() => {
    artwork.title && setTitle(artwork.title);
    artwork.artist && setArtist(artwork.artist);
    artwork.styles && setStyles(artwork.styles);
    artwork.size && setSize(artwork.size);
    artwork.year && setYear(artwork.year);
    artwork.price && setPrice(artwork.price);
    artwork.url && setUrl(artwork.url);
    artwork.available && setAvailable(artwork.available);
    artwork.description && setDescription(artwork.description);
  }, [artwork]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleArtistChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setArtist(e.target.value);
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(e.target.value);
  };

  const handleStylesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedStyles = e.target.value.split(",");
    setStyles(selectedStyles);
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSize(e.target.value);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(Number(e.target.value));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYear(Number(e.target.value));
  };

  const handleAvailableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvailable(e.target.checked);
  };

  const handleColeccionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCollection(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const artworkData = {
      title,
      artist,
      styles,
      size,
      year,
      price,
      url,
      available,
      description,
      coleccion,
    };
    console.log(artworkData);

    try {
      if (imageFile) {
        if (imageFile.size <= 16 * 1024 * 1024) {
          const storageRef = ref(
            storage,
            `/shirley/mujeresquemehabitan/${imageFile.name}`
          );
          const metadata = {
            contentType: imageFile.type,
          };
          await uploadBytes(storageRef, imageFile, metadata);
          artworkData.url = await getDownloadURL(storageRef);
        }
      } else {
        artworkData.url = artwork.url;
      }

      const response = await axios.put(
        `http://localhost:3009/artworks/${artwork._id}`,
        artworkData
      );

      console.log("Artwork added successfully:", response.data);
    } catch (error) {
      console.error("Error adding artwork:", error);
    }
  };

  return (
    <>
      {isActive && (
        <div className={Styles.modalOverlay}>
          <div className={Styles.modalContent}>
            <button
              className={Styles.closeButton}
              onClick={() => {
                setIsActive(false);
              }}
            >
              X
            </button>
            <form onSubmit={handleSubmit}>
              <label>
                Titulo:
                <input type="text" value={title} onChange={handleTitleChange} />
              </label>
              <br />
              <label>
                Artista:
                <input
                  type="text"
                  value={artist}
                  onChange={handleArtistChange}
                />
              </label>
              <br />
              <label>
                Descripcion:
                <br />
                <textarea
                  value={description}
                  onChange={handleDescriptionChange}
                  rows={5}
                />
              </label>
              <br />
              <label>
                Estilos (separados por coma ,):
                <input
                  type="text"
                  value={styles}
                  onChange={handleStylesChange}
                />
              </label>
              <br />
              <label>
                Tamaño:
                <input type="text" value={size} onChange={handleSizeChange} />
              </label>
              <br />
              <label>
                Precio:
                <input
                  type="number"
                  value={price}
                  onChange={handlePriceChange}
                />
              </label>
              <br />
              <label>
                Año:
                <input type="number" value={year} onChange={handleYearChange} />
              </label>
              <br />
              <label>
                Disponible:
                <input
                  type="checkbox"
                  checked={available}
                  onChange={handleAvailableChange}
                />
              </label>
              <br />
              <label>
                Coleccion:
                <input
                  type="text"
                  value={coleccion}
                  onChange={handleColeccionChange}
                />
              </label>
              <br />
              <label>
                Image:
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
              <br />
              <button type="submit">Actualizar Obra</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
