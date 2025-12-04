"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../app/utils/firebaseClient";

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

interface EditableArtworkProps {
    artwork: Artwork;
    isActive: boolean;
    setIsActive: (isActive: boolean) => void;
}

export const EditableArtwork: React.FC<EditableArtworkProps> = ({
    artwork,
    isActive,
    setIsActive,
}) => {
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
        if (artwork.title) setTitle(artwork.title);
        if (artwork.artist) setArtist(artwork.artist);
        if (artwork.styles) setStyles(artwork.styles);
        if (artwork.size) setSize(artwork.size);
        if (artwork.year) setYear(artwork.year);
        if (artwork.price) setPrice(artwork.price);
        if (artwork.url) setUrl(artwork.url);
        if (artwork.available) setAvailable(artwork.available);
        if (artwork.description) setDescription(artwork.description);
        if (artwork.coleccion) setCollection(artwork.coleccion);
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
                        `/${process.env.NEXT_PUBLIC_STORAGE_FOLDER}/${imageFile.name}`
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
                `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${artwork._id}`,
                artworkData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );

            console.log("Artwork added successfully:", response.data);
            setIsActive(false);
            window.location.reload();
        } catch (error) {
            alert("Error adding artwork:" + error);
        }
    };

    return (
        <>
            {isActive && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-start pt-10">
                    <div
                        className="relative bg-white rounded-lg shadow-lg p-5 max-w-2xl w-full m-4 overflow-y-auto"
                        style={{ maxHeight: "calc(100vh - 20px)" }}
                    >
                        <div className="flex justify-between items-start p-4 rounded-t border-b">
                            <h3 className="text-xl font-semibold">
                                Editar Obra
                            </h3>
                            <button
                                onClick={() => setIsActive(false)}
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    ></path>
                                </svg>
                            </button>
                        </div>
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4 p-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Titulo:
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={handleTitleChange}
                                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Artista:
                                </label>
                                <input
                                    type="text"
                                    value={artist}
                                    onChange={handleArtistChange}
                                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Descripcion:
                                </label>
                                <textarea
                                    value={description}
                                    onChange={handleDescriptionChange}
                                    rows={5}
                                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Estilos (separados por coma ,):
                                </label>
                                <input
                                    type="text"
                                    value={styles}
                                    onChange={handleStylesChange}
                                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Tamaño:
                                </label>
                                <input
                                    type="text"
                                    value={size}
                                    onChange={handleSizeChange}
                                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Precio:
                                </label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={handlePriceChange}
                                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Año:
                                </label>
                                <input
                                    type="number"
                                    value={year}
                                    onChange={handleYearChange}
                                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                                />
                            </div>
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700">
                                    Disponible?
                                </label>
                                <input
                                    type="checkbox"
                                    checked={available}
                                    onChange={handleAvailableChange}
                                    className="mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Coleccion:
                                </label>
                                <input
                                    type="text"
                                    value={coleccion}
                                    onChange={handleColeccionChange}
                                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Image:
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                                />
                            </div>
                            <button
                                type="submit"
                                className="mt-4 px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Actualizar Obra
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};
