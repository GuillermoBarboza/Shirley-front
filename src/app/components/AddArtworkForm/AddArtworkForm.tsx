"use client";
import React, { useState } from "react";
import axios from "axios";
import { initializeApp } from "firebase/app";
import {
  getStorage,
  listAll,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import Styles from "./ArtworkForm.module.css";

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

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const AddArtworkForm: React.FC = () => {
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

  const handleCollectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCollection(e.target.value);
  };

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
      }

      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_ENDPOINT + "/create",
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
    } catch (error) {
      console.error("Error adding artwork:", error);
    }
  };

  const handleBulkCreate = async () => {
    try {
      // Reference to the storage directory
      const storageRef = ref(storage, "/shirley/mujeresquemehabitan");

      // List all files in the directory
      const res = await listAll(storageRef);

      // For each file in the directory
      res.items.forEach(async (itemRef) => {
        try {
          // Get the download URL
          const url = await getDownloadURL(itemRef);

          // Create artwork data
          const artworkData = {
            url,
          };

          // Make axios call to create an artwork
          const response = await axios.post(
            process.env.NEXT_PUBLIC_API_ENDPOINT + "create",
            artworkData
          );

          console.log("Artwork added successfully:", response.data);
        } catch (error) {
          console.error("Error adding artwork:", error);
        }
      });
    } catch (error) {
      console.error("Error listing files:", error);
    }
  };

  const handleBulkEdit = async () => {
    try {
      // Fetch all artworks from the API
      const response = await axios.get(
        //@ts-ignore
        process.env.NEXT_PUBLIC_API_ENDPOINT
      );
      const artworks = response.data;

      // Update the 'available' field for each artwork
      const updatedArtworks = artworks.map((artwork: any) => ({
        ...artwork,
        available: true,
      }));

      // Make axios call to update each artwork
      await Promise.all(
        updatedArtworks.map(async (artwork: any) => {
          try {
            await axios.put(
              `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${artwork._id}`,
              artwork
            );
            console.log(`Artwork ${artwork._id} updated successfully`);
          } catch (error) {
            console.error(`Error updating artwork ${artwork._id}:`, error);
          }
        })
      );

      console.log("Bulk edit completed successfully");

      // ... additional logic or UI updates if needed
    } catch (error) {
      console.error("Error fetching artworks:", error);
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
          Colección:
          <input
            type="text"
            value={coleccion}
            onChange={handleCollectionChange}
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

        {/*  <button onClick={handleBulkCreate}>bulk create</button> */}
      </form>
    </div>
  );
};

export default AddArtworkForm;
