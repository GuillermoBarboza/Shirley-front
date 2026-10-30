"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../app/utils/firebaseClient";
import { uploadThumbnail, thumbPathFromUrl } from "../../app/utils/thumbnails";
import { deleteImage, storagePathFromUrl } from "../../app/utils/firebase";
import css from "./EditArtwork.module.css";

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

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

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

    // Lock the page behind the dialog and wire Escape to close it.
    useEffect(() => {
        if (!isActive) return;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsActive(false);
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", onKey);
        };
    }, [isActive, setIsActive]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSaving(true);

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

        // Storage objects the previous version owned. Collected here, deleted
        // only after the save succeeds — if the PUT fails the artwork still
        // points at them.
        let staleOriginal: string | null = null;
        let staleThumb: string | null = null;

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
                    const newUrl = await getDownloadURL(storageRef);
                    artworkData.url = newUrl;

                    // Replacing the image must replace its thumbnail too,
                    // otherwise the grid keeps showing the previous artwork.
                    // null, not undefined: JSON drops undefined and Mongoose
                    // would keep the old thumbUrl, pointing at a file we
                    // may be about to delete. null clears it, so grids fall
                    // back to `url`.
                    artworkData.thumbUrl =
                        (await uploadThumbnail(imageFile, imageFile.name)) ??
                        null;

                    // Only stale if the new upload landed somewhere else. A
                    // same-named file overwrites in place, and `a.jpg` and
                    // `a.png` share one `a.webp` thumbnail — deleting on either
                    // would remove the file just uploaded. Compare both paths
                    // independently.
                    const oldOriginal = storagePathFromUrl(artwork.url);
                    if (
                        oldOriginal &&
                        oldOriginal !== storagePathFromUrl(newUrl)
                    ) {
                        staleOriginal = oldOriginal;
                    }

                    const oldThumb = thumbPathFromUrl(artwork.url);
                    if (oldThumb && oldThumb !== thumbPathFromUrl(newUrl)) {
                        staleThumb = oldThumb;
                    }
                } else {
                    setError("La imagen supera los 16 MB.");
                    setSaving(false);
                    return;
                }
            } else {
                artworkData.url = artwork.url;
                artworkData.thumbUrl = artwork.thumbUrl;
            }

            await axios.put(
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

            // Safe now that the new URLs are persisted. deleteImage swallows
            // its own errors, so a thumbnail that never existed (artworks
            // predating the pipeline) is harmless.
            if (staleOriginal) await deleteImage(staleOriginal);
            if (staleThumb) await deleteImage(staleThumb);

            setIsActive(false);
            window.location.reload();
        } catch (err) {
            console.error("Error updating artwork:", err);
            setError("No pudimos guardar los cambios. Probá de nuevo.");
            setSaving(false);
        }
    };

    if (!isActive) return null;

    return (
        <div
            className={css.overlay}
            onClick={() => setIsActive(false)}
            role="presentation"
        >
            <div
                className={css.dialog}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Editar obra"
            >
                <button
                    onClick={() => setIsActive(false)}
                    className={css.close}
                    aria-label="Cerrar"
                >
                    ✕
                </button>

                <h2 className={css.title}>Editar obra</h2>

                {error && (
                    <div className="adm-banner adm-banner--error">{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className={css.field}>
                        <label className="adm-label" htmlFor="edit-title">
                            Título
                        </label>
                        <input
                            id="edit-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="adm-input"
                        />
                    </div>

                    <div className={css.field}>
                        <label className="adm-label" htmlFor="edit-artist">
                            Artista
                        </label>
                        <input
                            id="edit-artist"
                            type="text"
                            value={artist}
                            onChange={(e) => setArtist(e.target.value)}
                            className="adm-input"
                        />
                    </div>

                    <div className={css.field}>
                        <label className="adm-label" htmlFor="edit-description">
                            Descripción
                        </label>
                        <textarea
                            id="edit-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="adm-textarea"
                        />
                    </div>

                    <div className={css.field}>
                        <label className="adm-label" htmlFor="edit-styles">
                            Estilos (separados por coma)
                        </label>
                        <input
                            id="edit-styles"
                            type="text"
                            value={styles.join(",")}
                            onChange={(e) =>
                                setStyles(e.target.value.split(","))
                            }
                            className="adm-input"
                        />
                    </div>

                    <div className={css.field}>
                        <label className="adm-label" htmlFor="edit-coleccion">
                            Colección
                        </label>
                        <input
                            id="edit-coleccion"
                            type="text"
                            value={coleccion}
                            onChange={(e) => setCollection(e.target.value)}
                            className="adm-input"
                        />
                    </div>

                    <div className={css.row}>
                        <div>
                            <label className="adm-label" htmlFor="edit-size">
                                Tamaño
                            </label>
                            <input
                                id="edit-size"
                                type="text"
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                                className="adm-input"
                            />
                        </div>
                        <div>
                            <label className="adm-label" htmlFor="edit-year">
                                Año
                            </label>
                            <input
                                id="edit-year"
                                type="number"
                                value={year ?? ""}
                                onChange={(e) =>
                                    setYear(
                                        e.target.value === ""
                                            ? undefined
                                            : Number(e.target.value)
                                    )
                                }
                                className="adm-input"
                            />
                        </div>
                    </div>

                    <div className={css.field}>
                        <label className="adm-label" htmlFor="edit-price">
                            Precio
                        </label>
                        <input
                            id="edit-price"
                            type="number"
                            value={price ?? ""}
                            onChange={(e) =>
                                setPrice(
                                    e.target.value === ""
                                        ? undefined
                                        : Number(e.target.value)
                                )
                            }
                            className="adm-input"
                        />
                    </div>

                    <label className={css.checkbox}>
                        <input
                            type="checkbox"
                            checked={available}
                            onChange={(e) => setAvailable(e.target.checked)}
                        />
                        Disponible
                    </label>

                    <div className={css.field}>
                        <label className="adm-label" htmlFor="edit-image">
                            Reemplazar imagen
                        </label>
                        <input
                            id="edit-image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className={css.file}
                        />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={artwork.thumbUrl || artwork.url}
                            alt={artwork.title || "Obra actual"}
                            className={css.current}
                        />
                    </div>

                    <div className={css.actions}>
                        <button
                            type="submit"
                            className={`adm-btn ${css.save}`}
                            disabled={saving}
                        >
                            {saving ? "Guardando…" : "Guardar cambios"}
                        </button>
                        <button
                            type="button"
                            className={`adm-btn adm-btn--ghost ${css.cancel}`}
                            onClick={() => setIsActive(false)}
                            disabled={saving}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
