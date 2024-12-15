"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
/* import styles from "./Artwork.module.css"; */
import { EditableArtwork } from "../EditArtwork/EditArtwork";
import Image from "next/image";
import { deleteImage } from "../../app/utils/firebase";

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

const ArtworkList: React.FC = () => {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [modalActive, setModalActive] = useState(false);
    const [activeArtwork, setActiveArtwork] = useState<Artwork | null>(null);
    const [allowDelete, SetAllowDelete] = useState<string>("");

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

    const handleDelete = async (id: string, url: string) => {
        // Create a reference to the file to delete
        const relativePath = decodeURIComponent(url).split("/o/")[1];
        const path = relativePath.split("?alt=")[0];
        console.log(path);

        await deleteImage(path);
        // Send a delete request to the backend API
        console.log(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/${id}`);
        axios
            .delete(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then(() => {
                // Remove the deleted artwork from the state
                setArtworks(artworks.filter((artwork) => artwork._id !== id));
            })
            .catch((error) => {
                console.error("Error deleting artwork:", error);
            });
    };

    return (
        <div className="p-8 bg-gray-100 text-gray-800 rounded-lg">
            <h1 className="text-3xl font-bold text-center mb-6">
                Lista de obras
            </h1>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {artworks.map((artwork) => (
                    <li
                        key={artwork._id}
                        className="bg-white rounded-lg shadow overflow-hidden"
                    >
                        <Image
                            width={300}
                            height={200}
                            src={artwork.url.toString()}
                            alt={artwork.title || "Obra de arte"}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                            <h3 className="text-xl font-semibold mb-2">
                                {artwork.title || "Título desconocido"}
                            </h3>
                            {allowDelete !== artwork._id && (
                                <button
                                    className="btn btn-error btn-outline btn-sm"
                                    onClick={() => {
                                        SetAllowDelete(artwork._id);
                                        setTimeout(() => {
                                            SetAllowDelete("");
                                        }, 3000);
                                    }}
                                >
                                    Borrar Obra
                                </button>
                            )}
                            {allowDelete === artwork._id && (
                                <button
                                    className="btn btn-error btn-sm"
                                    onClick={() =>
                                        handleDelete(artwork._id, artwork.url)
                                    }
                                >
                                    Confirmar
                                </button>
                            )}
                            <button
                                className="btn btn-primary btn-sm ml-2"
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
