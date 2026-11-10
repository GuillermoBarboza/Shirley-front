import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebaseClient";

/** Long edge of the generated thumbnail, in px. Grid tiles render at ~300px. */
const THUMB_EDGE = 600;
const THUMB_QUALITY = 0.82;

const folder = () => process.env.NEXT_PUBLIC_STORAGE_FOLDER;

/** `retrato.jpg` -> `retrato.webp` */
const toWebpName = (name: string) => name.replace(/\.[^.]+$/, "") + ".webp";

const loadBitmap = (source: Blob): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const url = URL.createObjectURL(source);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("No se pudo leer la imagen"));
        };
        img.src = url;
    });

/**
 * Downscale to a WebP blob whose long edge is at most `edge` px. Returns null
 * if the browser can't produce WebP, so callers can fall back to storing only
 * the original rather than failing the save.
 */
export const makeResizedWebp = async (
    source: Blob,
    edge: number
): Promise<Blob | null> => {
    const img = await loadBitmap(source);

    const scale = Math.min(1, edge / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) =>
        canvas.toBlob((blob) => resolve(blob), "image/webp", THUMB_QUALITY)
    );
};

export const makeThumbnailBlob = (source: Blob): Promise<Blob | null> =>
    makeResizedWebp(source, THUMB_EDGE);

/**
 * Generate a downscaled WebP and upload it to `path`, returning its download
 * URL. Never throws — a resized copy is an optimisation, and every reader
 * falls back to the original when it is absent.
 */
export const uploadResizedWebp = async (
    source: Blob,
    path: string,
    edge: number
): Promise<string | undefined> => {
    try {
        const blob = await makeResizedWebp(source, edge);
        if (!blob) return undefined;

        const webpRef = ref(storage, path);
        await uploadBytes(webpRef, blob, { contentType: "image/webp" });
        return await getDownloadURL(webpRef);
    } catch (error) {
        console.error("No se pudo generar la miniatura:", error);
        return undefined;
    }
};

/**
 * Generate and upload a thumbnail beside the original, returning its download
 * URL. Never throws — the storefront falls back to the full-size `url` when
 * `thumbUrl` is absent.
 */
export const uploadThumbnail = (
    source: Blob,
    fileName: string
): Promise<string | undefined> =>
    uploadResizedWebp(
        source,
        `/${folder()}/thumbs/${toWebpName(fileName)}`,
        THUMB_EDGE
    );

/**
 * Storage path for an artwork's thumbnail, derived from the original's download
 * URL. Used at delete time so the thumbnail doesn't outlive its artwork.
 */
export const thumbPathFromUrl = (url: string): string | null => {
    try {
        const relative = decodeURIComponent(url).split("/o/")[1];
        if (!relative) return null;
        const path = relative.split("?alt=")[0];
        const name = path.split("/").pop();
        if (!name) return null;
        return `${folder()}/thumbs/${toWebpName(name)}`;
    } catch {
        return null;
    }
};
