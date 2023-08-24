import React, { useState } from "react";
import axios from "axios";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Styles from "./ArtworkForm.module.css";
import { useNavigate } from "react-router";

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

const AddArtworkForm: React.FC = () => {
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

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(e.target.value);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleArtistChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setArtist(e.target.value);
  };

  const handleStyleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedStyles = e.target.value.split(",");
    setStyles(selectedStyles);
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSize(e.target.value);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYear(parseInt(e.target.value));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(parseInt(e.target.value));
  };

  const handleAvailableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvailable(e.target.checked);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
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
      }

      const response = await axios.post(
        "http://localhost:3001/artworks/create",
        artworkData
      );

      console.log("Artwork added successfully:", response.data);

      setTitle("");
      setArtist("Shirley Madero");
      setStyles([]);
      setSize("");
      setYear(undefined);
      setPrice(undefined);
      setUrl("");
      setAvailable(false);
      setImageFile(null);
      setDescription("");
      navigate(0);
    } catch (error) {
      console.error("Error adding artwork:", error);
    }
  };

  return (
    <div className={Styles.artworkFormContainer}>
      <h2>Agregar obra</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Titulo:
          <input type="text" value={title} onChange={handleTitleChange} />
        </label>
        <br />
        <label>
          Artista:
          <input type="text" value={artist} onChange={handleArtistChange} />
        </label>
        <br />
        <label>
          Descripcion:
          <br />
          <textarea
            className={Styles.description}
            value={description}
            onChange={handleDescriptionChange}
            rows={5} // specify the number of visible lines
          />
        </label>
        <br />
        <label>
          Estilo/s (comma-separated):
          <input
            type="text"
            value={styles.join(",")}
            onChange={handleStyleChange}
          />
        </label>
        <br />
        <label>
          Tamaño:
          <input type="text" value={size} onChange={handleSizeChange} />
        </label>
        <br />
        <label>
          Año:
          <input
            type="number"
            value={year !== undefined ? year : ""}
            onChange={handleYearChange}
          />
        </label>
        <br />
        <label>
          Precio:
          <input
            type="number"
            value={price !== undefined ? price : ""}
            onChange={handlePriceChange}
          />
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
          Image:
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
        </label>
        <br />
        <button className={Styles.button} type="submit">
          Agregar Obra +
        </button>
      </form>
    </div>
  );
};

export default AddArtworkForm;