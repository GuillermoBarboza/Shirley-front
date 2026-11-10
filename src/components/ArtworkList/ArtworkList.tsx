"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./Artwork.module.css";
import { EditableArtwork } from "../EditArtwork/EditArtwork";
import Image from "next/image";
import { deleteImage } from "../../app/utils/firebase";
import { thumbPathFromUrl } from "../../app/utils/thumbnails";

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
    thumbUrl?: string;
}

/** "2023 · 40x50 cm", tolerating sizes that already carry the unit. */
const metaLine = (artwork: Artwork): string => {
    const bare = (artwork.size || "")
        .replace(/cms?\.?/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
    return [artwork.year, bare ? `${bare} cm` : ""].filter(Boolean).join(" · ");
};

const ArtworkList: React.FC = () => {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [modalActive, setModalActive] = useState(false);
    const [activeArtwork, setActiveArtwork] = useState<Artwork | null>(null);
    const [allowDelete, SetAllowDelete] = useState<string>("");
    const disarmTimer = useRef<number | undefined>(undefined);

    useEffect(() => {
        // Fetch artworks from the backend API
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

    useEffect(() => () => window.clearTimeout(disarmTimer.current), []);

    const handleDelete = async (id: string, url: string) => {
        // Create a reference to the file to delete
        const relativePath = decodeURIComponent(url).split("/o/")[1];
        const path = relativePath.split("?alt=")[0];

        await deleteImage(path);

        // The thumbnail is a separate storage object and would otherwise be
        // orphaned. deleteImage swallows its own errors, so a missing thumbnail
        // (artworks predating the pipeline) is harmless.
        const thumbPath = thumbPathFromUrl(url);
        if (thumbPath) {
            await deleteImage(thumbPath);
        }

        // Send a delete request to the backend API
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

    const armDelete = (id: string) => {
        window.clearTimeout(disarmTimer.current);
        SetAllowDelete(id);
        disarmTimer.current = window.setTimeout(
            () => SetAllowDelete(""),
            3000
        );
    };

    return (
        <div className={styles.wrap}>
            <h2 className={styles.title}>
                Lista de obras · {artworks.length}
            </h2>

            {artworks.length === 0 ? (
                <div className={styles.empty}>
                    Todavía no hay obras cargadas.
                </div>
            ) : (
                <ul className={styles.grid}>
                    {artworks.map((artwork) => (
                        <li key={artwork._id} className={styles.card}>
                            <Image
                                width={300}
                                height={200}
                                src={(
                                    artwork.thumbUrl || artwork.url
                                ).toString()}
                                alt={artwork.title || "Obra de arte"}
                                className={styles.thumb}
                            />
                            <div className={styles.body}>
                                <div className={styles.cardTitle}>
                                    {artwork.title || "Título desconocido"}
                                </div>
                                <div className={styles.meta}>
                                    {metaLine(artwork) || "Sin datos"}
                                </div>
                                <div className={styles.actions}>
                                    <button
                                        className={`${styles.action} ${styles.edit}`}
                                        onClick={() => {
                                            setModalActive(true);
                                            setActiveArtwork(artwork);
                                        }}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className={`${styles.action} ${styles.del}`}
                                        onClick={() =>
                                            allowDelete === artwork._id
                                                ? handleDelete(
                                                      artwork._id,
                                                      artwork.url
                                                  )
                                                : armDelete(artwork._id)
                                        }
                                    >
                                        {allowDelete === artwork._id
                                            ? "Confirmar"
                                            : "Borrar obra"}
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

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
