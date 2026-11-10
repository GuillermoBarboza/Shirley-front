import axios from "axios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebaseClient";
import { uploadResizedWebp } from "./thumbnails";
import { deleteImage, storagePathFromUrl } from "./firebase";
import { uniqueName } from "./experienceList";

export {
    parseSteps,
    stepsToText,
    moveExperience,
    uniqueName,
    trimFields,
} from "./experienceList";

/*
 * Mirrors the backend's ExperiencesPage model and the storefront's
 * types/experience.ts — no shared types package, keep the three in step.
 */

export type Accent = "olive" | "gold";

export interface Experience {
    _id?: string;
    kicker: string;
    title: string;
    /** Stored without «» — the storefront adds them. */
    quote: string;
    place: string;
    description: string;
    steps: string[];
    note: string;
    accent: Accent;
    visible: boolean;
    photoUrl?: string | null;
    photoWebUrl?: string | null;
}

export interface ExperiencesIntro {
    eyebrow: string;
    title: string;
    lede: string;
}

export interface ExperiencesPage {
    intro: ExperiencesIntro;
    experiences: Experience[];
}

export const MAX_PHOTO_BYTES = 16 * 1024 * 1024;

/** Long edge of the copy the storefront shows; sections render photos large. */
const WEB_EDGE = 1600;

const endpoint = () => process.env.NEXT_PUBLIC_EXPERIENCES_ENDPOINT;
const folder = () => process.env.NEXT_PUBLIC_STORAGE_FOLDER;

const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/** The whole page, hidden experiences included. */
export const fetchExperiencesAdmin = async (): Promise<ExperiencesPage> => {
    const response = await axios.get(endpoint() + "/admin", {
        headers: authHeaders(),
    });
    return response.data;
};

/** Replaces the whole page; resolves with what the server stored. */
export const saveExperiences = async (
    page: ExperiencesPage
): Promise<ExperiencesPage> => {
    const response = await axios.put(endpoint() + "/", page, {
        headers: authHeaders(),
    });
    return response.data;
};

/**
 * Uploads the original plus a web-sized WebP. Only the original's failure
 * throws; a missing web copy leaves `photoWebUrl` null and readers fall back.
 */
export const uploadExperiencePhoto = async (
    file: File
): Promise<{ photoUrl: string; photoWebUrl: string | null }> => {
    const name = uniqueName(file.name);
    const originalRef = ref(storage, `/${folder()}/experiencias/${name}`);
    await uploadBytes(originalRef, file, { contentType: file.type });
    const photoUrl = await getDownloadURL(originalRef);

    const base = name.replace(/\.[^.]+$/, "");
    const photoWebUrl = await uploadResizedWebp(
        file,
        `/${folder()}/experiencias/web/${base}.webp`,
        WEB_EDGE
    );

    return { photoUrl, photoWebUrl: photoWebUrl ?? null };
};

/** Removes an experience's Storage objects. deleteImage swallows its errors. */
export const deleteExperiencePhotos = async (e: {
    photoUrl?: string | null;
    photoWebUrl?: string | null;
}): Promise<void> => {
    for (const url of [e.photoUrl, e.photoWebUrl]) {
        const path = url ? storagePathFromUrl(url) : null;
        if (path) await deleteImage(path);
    }
};
