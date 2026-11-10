/**
 * Pure helpers for the Experiencias tab. Kept apart from experiences.ts so they
 * carry no Firebase or axios imports.
 */

/** One step per line; blank lines and stray whitespace dropped. */
export const parseSteps = (text: string): string[] =>
    text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

export const stepsToText = (steps: string[]): string => steps.join("\n");

/**
 * Moves one item up (-1) or down (1). Out-of-range moves return the same
 * array, so callers can skip saving when nothing changed.
 */
export const moveExperience = <T>(
    list: T[],
    index: number,
    delta: -1 | 1
): T[] => {
    const target = index + delta;
    if (index < 0 || index >= list.length) return list;
    if (target < 0 || target >= list.length) return list;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
};

/**
 * `IMAGE (1).JPG` -> `1731234567890-image--1-.jpg`. Phones name most uploads
 * `image.jpg`; a timestamp keeps one experience's photo from overwriting
 * another's.
 */
export const uniqueName = (fileName: string): string =>
    `${Date.now()}-${fileName.toLowerCase().replace(/[^a-z0-9._-]/g, "-")}`;

/**
 * Trims the named string fields so a stray space never renders as an empty
 * «» or place line on the storefront.
 */
export const trimFields = <T extends object>(obj: T, keys: (keyof T)[]): T => {
    const next = { ...obj };
    for (const key of keys) {
        const value = next[key];
        if (typeof value === "string") {
            next[key] = value.trim() as T[keyof T];
        }
    }
    return next;
};
