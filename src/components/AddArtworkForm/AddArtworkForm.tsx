"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    //listAll,
    ref,
    uploadBytes,
    getDownloadURL,
} from "firebase/storage";
import { storage } from "../../app/utils/firebaseClient";
import { uploadThumbnail } from "../../app/utils/thumbnails";
import css from "./ArtworkForm.module.css";

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

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Local preview of the chosen file, revoked when it changes or unmounts.
    useEffect(() => {
        if (!imageFile) {
            setPreviewUrl(null);
            return;
        }
        const objectUrl = URL.createObjectURL(imageFile);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [imageFile]);

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
        setError("");

        if (imageFile && imageFile.size > 16 * 1024 * 1024) {
            setError("La imagen supera los 16 MB.");
            return;
        }

        setSubmitting(true);

        const artworkData: Record<string, unknown> = {
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

        try {
            if (imageFile) {
                const storageRef = ref(
                    storage,
                    `/${process.env.NEXT_PUBLIC_STORAGE_FOLDER}/${imageFile.name}`
                );
                const metadata = {
                    contentType: imageFile.type,
                };
                await uploadBytes(storageRef, imageFile, metadata);
                artworkData.url = await getDownloadURL(storageRef);

                // Grids read thumbUrl; originals run to several MB apiece.
                artworkData.thumbUrl = await uploadThumbnail(
                    imageFile,
                    imageFile.name
                );
            }

            const token = localStorage.getItem("token");

            await axios.post(
                process.env.NEXT_PUBLIC_API_ENDPOINT + "/create",
                artworkData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

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
            setCollection("");
            window.location.reload();
        } catch (error) {
            console.error("Error adding artwork:", error);
            setError("No pudimos guardar la obra. Probá de nuevo.");
            setSubmitting(false);
        }
    };

    return (
        <div className={css.panel}>
            <h2 className={css.title}>Agregar obra</h2>

            {error && (
                <div className="adm-banner adm-banner--error">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
                <div className={css.field}>
                    <label className="adm-label" htmlFor="art-title">
                        Título
                    </label>
                    <input
                        id="art-title"
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        className="adm-input"
                    />
                </div>

                <div className={css.field}>
                    <label className="adm-label" htmlFor="art-artist">
                        Artista
                    </label>
                    <input
                        id="art-artist"
                        type="text"
                        value={artist}
                        onChange={handleArtistChange}
                        className="adm-input"
                    />
                </div>

                <div className={css.field}>
                    <label className="adm-label" htmlFor="art-description">
                        Descripción
                    </label>
                    <textarea
                        id="art-description"
                        className="adm-textarea"
                        value={description}
                        onChange={handleDescriptionChange}
                        rows={4}
                    />
                </div>

                <div className={css.field}>
                    <label className="adm-label" htmlFor="art-styles">
                        Estilo/s (separados por coma)
                    </label>
                    <input
                        id="art-styles"
                        type="text"
                        value={styles.join(",")}
                        onChange={handleStyleChange}
                        className="adm-input"
                    />
                </div>

                <div className={css.field}>
                    <label className="adm-label" htmlFor="art-coleccion">
                        Colección
                    </label>
                    <input
                        id="art-coleccion"
                        type="text"
                        value={coleccion}
                        onChange={handleCollectionChange}
                        className="adm-input"
                    />
                </div>

                <div className={css.row}>
                    <div>
                        <label className="adm-label" htmlFor="art-size">
                            Tamaño
                        </label>
                        <input
                            id="art-size"
                            type="text"
                            value={size}
                            onChange={handleSizeChange}
                            className="adm-input"
                        />
                    </div>
                    <div>
                        <label className="adm-label" htmlFor="art-year">
                            Año
                        </label>
                        <input
                            id="art-year"
                            type="number"
                            value={year !== undefined ? year : ""}
                            onChange={handleYearChange}
                            className="adm-input"
                        />
                    </div>
                </div>

                <div className={css.field}>
                    <label className="adm-label" htmlFor="art-price">
                        Precio
                    </label>
                    <input
                        id="art-price"
                        type="number"
                        value={price !== undefined ? price : ""}
                        onChange={handlePriceChange}
                        className="adm-input"
                    />
                </div>

                <label className={css.checkbox}>
                    <input
                        type="checkbox"
                        checked={available}
                        onChange={handleAvailableChange}
                    />
                    Disponible
                </label>

                <div className={css.fileField}>
                    <label className="adm-label" htmlFor="art-image">
                        Imagen
                    </label>
                    <input
                        id="art-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        required
                        className={css.file}
                    />
                    {previewUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={previewUrl}
                            alt="Vista previa de la obra"
                            className={css.preview}
                        />
                    )}
                </div>

                <button
                    type="submit"
                    className="adm-btn adm-btn--block"
                    disabled={submitting}
                >
                    {submitting ? "Guardando…" : "Agregar obra +"}
                </button>
            </form>
        </div>
    );
};

export default AddArtworkForm;
