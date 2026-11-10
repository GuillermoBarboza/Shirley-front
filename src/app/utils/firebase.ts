import {
    ref,
    listAll,
    getDownloadURL,
    uploadBytes,
    deleteObject,
} from "firebase/storage";
import { storage } from "./firebaseClient";

const copyFolderContents = async (
    sourceFolder: string,
    destinationFolder: string
) => {
    const sourceRef = ref(storage, sourceFolder);

    // List all files in the source folder
    const { items } = await listAll(sourceRef);

    // Copy each file to the destination folder
    for (const item of items) {
        const fileUrl = await getDownloadURL(item);
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const destinationFileRef = ref(
            storage,
            `${destinationFolder}/${item.name}`
        );
        await uploadBytes(destinationFileRef, blob);
        console.log(`Copied ${item.name} to ${destinationFolder}`);
    }
};

const listFolderContents = async (folderPath: string) => {
    const folderRef = ref(storage, folderPath);

    // List all files in the folder
    const { items } = await listAll(folderRef);

    // Log each file name
    items.forEach((item) => {
        console.log(item.name);
    });
};

/**
 * Storage path out of a Firebase download URL:
 * `.../o/dev%2Fretrato.jpg?alt=media&token=..` -> `dev/retrato.jpg`.
 * Returns null for anything that isn't shaped like one.
 */
const storagePathFromUrl = (url: string): string | null => {
    try {
        const relative = decodeURIComponent(url).split("/o/")[1];
        if (!relative) return null;
        return relative.split("?alt=")[0] || null;
    } catch {
        return null;
    }
};

const deleteImage = async (path: string) => {
    try {
        const deleteRef = ref(storage, path);
        await deleteObject(deleteRef)
            .then(() => {
                console.log("Image deleted from Firebase Storage");
            })
            .catch((error) => {
                console.error(
                    "Error deleting image from Firebase Storage:",
                    error
                );
            });
        //console.log("File deleted successfully");
    } catch (error) {
        console.error("Error deleting file:", error);
    }
};

export {
    listFolderContents,
    copyFolderContents,
    deleteImage,
    storagePathFromUrl,
};
