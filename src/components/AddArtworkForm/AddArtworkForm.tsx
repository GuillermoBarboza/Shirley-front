"use client";
import React, { useState } from "react";
import axios from "axios";
import {
    //listAll,
    ref,
    uploadBytes,
    getDownloadURL,
} from "firebase/storage";
import { storage } from "../../app/utils/firebaseClient";
//import Styles from "./ArtworkForm.module.css";

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
                        `/${process.env.NEXT_PUBLIC_STORAGE_FOLDER}/${imageFile.name}`
                    );
                    const metadata = {
                        contentType: imageFile.type,
                    };
                    await uploadBytes(storageRef, imageFile, metadata);
                    artworkData.url = await getDownloadURL(storageRef);
                }
            }

            console.log(
                "Artwork create endpoint:",
                process.env.NEXT_PUBLIC_API_ENDPOINT + "/create"
            );

            const token = localStorage.getItem("token");

            const response = await axios.post(
                process.env.NEXT_PUBLIC_API_ENDPOINT + "/create",
                artworkData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
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
            window.location.reload();
        } catch (error) {
            console.error("Error adding artwork:", error);
        }
    };

    return (
        <div className="container mx-auto max-w-4xl bg-gray-100 rounded-lg shadow p-6 text-gray-700">
            <h2 className="text-2xl font-bold mb-6">Agregar obra</h2>
            <form
                onSubmit={handleSubmit}
                className="grid text-slate-100 grid-cols-1 gap-4"
            >
                <div>
                    <label className="block text-md font-medium text-gray-700">
                        Título:
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        className="p-2 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                </div>

                <div>
                    <label className="block text-md font-medium text-gray-700">
                        Artista:
                    </label>
                    <input
                        type="text"
                        value={artist}
                        onChange={handleArtistChange}
                        className="p-2 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                </div>

                <div>
                    <label className="block text-md font-medium text-gray-700">
                        Descripción:
                    </label>
                    <textarea
                        className="p-2 block w-full rounded-md border-gray-300 shadow-sm"
                        value={description}
                        onChange={handleDescriptionChange}
                        rows={5}
                    />
                </div>

                <div>
                    <label className="block text-md font-medium text-gray-700">
                        Estilo/s (comma-separated):
                    </label>
                    <input
                        type="text"
                        value={styles.join(",")}
                        onChange={handleStyleChange}
                        className="p-2 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                </div>

                <div>
                    <label className="block text-md font-medium text-gray-700">
                        Colección:
                    </label>
                    <input
                        type="text"
                        value={coleccion}
                        onChange={handleCollectionChange}
                        className="p-2 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                </div>

                <div>
                    <label className="block text-md font-medium text-gray-700">
                        Tamaño:
                    </label>
                    <input
                        type="text"
                        value={size}
                        onChange={handleSizeChange}
                        className="p-2 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                </div>

                <div>
                    <label className="block text-md font-medium text-gray-700">
                        Año:
                    </label>
                    <input
                        type="number"
                        value={year !== undefined ? year : ""}
                        onChange={handleYearChange}
                        className="p-2 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                </div>

                <div>
                    <label className="block text-md font-medium text-gray-700">
                        Precio:
                    </label>
                    <input
                        type="number"
                        value={price !== undefined ? price : ""}
                        onChange={handlePriceChange}
                        className="p-2 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                </div>

                <div>
                    <label className="flex items-center text-md font-medium text-gray-700">
                        <input
                            type="checkbox"
                            checked={available}
                            onChange={handleAvailableChange}
                            className="mr-2 rounded border-gray-300 text-blue-600 shadow-sm"
                        />
                        Disponible
                    </label>
                </div>

                <div>
                    <label className="block text-md font-medium text-gray-700">
                        Imagen:
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        required
                        className="p-2 block w-full rounded-md border-gray-300 shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>

                <button
                    type="submit"
                    className="py-2 px-4 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white font-bold rounded-lg shadow"
                >
                    Agregar Obra +
                </button>
            </form>
        </div>
    );
};

export default AddArtworkForm;
