"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
    Experience,
    ExperiencesIntro,
    ExperiencesPage,
    fetchExperiencesAdmin,
    saveExperiences,
    moveExperience,
    uploadExperiencePhoto,
    deleteExperiencePhotos,
    trimFields,
} from "../../app/utils/experiences";
import ExperienceDialog from "../ExperienceDialog/ExperienceDialog";
import styles from "./AdminExperiences.module.css";

const AdminExperiences: React.FC = () => {
    const [page, setPage] = useState<ExperiencesPage | null>(null);
    const [intro, setIntro] = useState<ExperiencesIntro>({
        eyebrow: "",
        title: "",
        lede: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [introSaved, setIntroSaved] = useState(false);
    // null = dialog closed; { index: null } = new experience.
    const [editing, setEditing] = useState<{ index: number | null } | null>(
        null
    );

    // Stable so the dialog's Escape listener isn't re-bound every render.
    const closeDialog = useCallback(() => {
        setEditing(null);
        setError("");
    }, []);

    useEffect(() => {
        fetchExperiencesAdmin()
            .then((data) => {
                setPage(data);
                setIntro(data.intro);
            })
            .catch((err) => {
                console.error("Error fetching experiences:", err);
                setError("No pudimos cargar las experiencias.");
            })
            .finally(() => setLoading(false));
    }, []);

    /**
     * Every action saves the whole page. No reload afterwards — that would
     * drop Shirley back on the Obras tab — so state comes from the response.
     */
    const persist = async (next: ExperiencesPage): Promise<boolean> => {
        setError("");
        setSaving(true);
        try {
            const saved = await saveExperiences(next);
            setPage(saved);
            return true;
        } catch (err) {
            console.error("Error saving experiences:", err);
            setError("No pudimos guardar los cambios. Probá de nuevo.");
            return false;
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Cargando experiencias…</div>;
    }

    if (!page) {
        return (
            <div className="adm-banner adm-banner--error">
                {error || "No pudimos cargar las experiencias."}
            </div>
        );
    }

    const experiences = page.experiences;

    const saveIntro = async () => {
        const trimmed = trimFields(intro, ["eyebrow", "title", "lede"]);
        if (await persist({ ...page, intro: trimmed })) {
            setIntro(trimmed);
            setIntroSaved(true);
            window.setTimeout(() => setIntroSaved(false), 2400);
        }
    };

    const move = (index: number, delta: -1 | 1) => {
        const reordered = moveExperience(experiences, index, delta);
        if (reordered !== experiences) {
            persist({ ...page, experiences: reordered });
        }
    };

    const editingIndex = editing?.index ?? null;
    const editingExperience =
        editingIndex === null ? null : experiences[editingIndex];

    /**
     * Upload first, then save the page; the previous photo is removed only
     * once the save that replaces it succeeded. If the save fails, the
     * just-uploaded files are removed instead so nothing is orphaned.
     */
    const handleSave = async (next: Experience, photo: File | null) => {
        let uploaded: { photoUrl: string; photoWebUrl: string | null } | null =
            null;
        if (photo) {
            setSaving(true);
            try {
                uploaded = await uploadExperiencePhoto(photo);
            } catch (err) {
                console.error("Error uploading experience photo:", err);
                setError("No pudimos subir la foto. Probá de nuevo.");
                setSaving(false);
                return;
            }
        }

        const saved: Experience = uploaded ? { ...next, ...uploaded } : next;
        const list =
            editingIndex === null
                ? [...experiences, saved]
                : experiences.map((e, i) => (i === editingIndex ? saved : e));

        if (await persist({ ...page, experiences: list })) {
            if (uploaded && editingExperience) {
                await deleteExperiencePhotos(editingExperience);
            }
            setEditing(null);
        } else if (uploaded) {
            await deleteExperiencePhotos(uploaded);
        }
    };

    const handleDelete = async () => {
        if (editingIndex === null || !editingExperience) return;
        const list = experiences.filter((_, i) => i !== editingIndex);
        if (await persist({ ...page, experiences: list })) {
            await deleteExperiencePhotos(editingExperience);
            setEditing(null);
        }
    };

    const toggleVisible = (index: number) =>
        persist({
            ...page,
            experiences: experiences.map((e, i) =>
                i === index ? { ...e, visible: !e.visible } : e
            ),
        });

    return (
        <div>
            {error && (
                <div className="adm-banner adm-banner--error">{error}</div>
            )}

            <div className={styles.panel}>
                <h2 className={styles.panelTitle}>Encabezado de la página</h2>
                <div className={styles.field}>
                    <label className="adm-label" htmlFor="exp-intro-eyebrow">
                        Etiqueta
                    </label>
                    <input
                        id="exp-intro-eyebrow"
                        className="adm-input"
                        value={intro.eyebrow}
                        onChange={(e) =>
                            setIntro({ ...intro, eyebrow: e.target.value })
                        }
                    />
                </div>
                <div className={styles.field}>
                    <label className="adm-label" htmlFor="exp-intro-title">
                        Título
                    </label>
                    <input
                        id="exp-intro-title"
                        className="adm-input"
                        value={intro.title}
                        onChange={(e) =>
                            setIntro({ ...intro, title: e.target.value })
                        }
                    />
                </div>
                <div className={styles.field}>
                    <label className="adm-label" htmlFor="exp-intro-lede">
                        Texto de introducción
                    </label>
                    <textarea
                        id="exp-intro-lede"
                        className="adm-textarea"
                        rows={3}
                        value={intro.lede}
                        onChange={(e) =>
                            setIntro({ ...intro, lede: e.target.value })
                        }
                    />
                </div>
                <button
                    className="adm-btn"
                    onClick={saveIntro}
                    disabled={saving}
                >
                    {saving ? "Guardando…" : "Guardar intro"}
                </button>
                {introSaved && <div className={styles.saved}>Guardado.</div>}
            </div>

            <div className={styles.listHeader}>
                <h2 className={styles.listTitle}>
                    Experiencias · {experiences.length}
                </h2>
                <button
                    className="adm-btn"
                    onClick={() => setEditing({ index: null })}
                    disabled={saving}
                >
                    + Nueva experiencia
                </button>
            </div>

            {experiences.length === 0 ? (
                <div className={styles.empty}>
                    Todavía no hay experiencias. Creá la primera.
                </div>
            ) : (
                <ul className={styles.list}>
                    {experiences.map((experience: Experience, index) => {
                        const photo =
                            experience.photoWebUrl || experience.photoUrl;
                        return (
                            <li
                                key={experience._id ?? index}
                                className={styles.row}
                            >
                                <div className={styles.main}>
                                    {photo ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={photo}
                                            alt=""
                                            className={styles.thumb}
                                        />
                                    ) : (
                                        <div
                                            className={`${styles.thumb} ${
                                                experience.accent === "olive"
                                                    ? styles.thumbOlive
                                                    : styles.thumbGold
                                            }`}
                                        />
                                    )}
                                    <div className={styles.text}>
                                        <div className={styles.title}>
                                            {experience.title}
                                        </div>
                                        <div className={styles.meta}>
                                            {[experience.kicker, experience.place]
                                                .filter(Boolean)
                                                .join(" · ")}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.controls}>
                                    <button
                                        className={`adm-btn adm-btn--ghost ${styles.arrow}`}
                                        aria-label="Subir"
                                        onClick={() => move(index, -1)}
                                        disabled={saving || index === 0}
                                    >
                                        ▲
                                    </button>
                                    <button
                                        className={`adm-btn adm-btn--ghost ${styles.arrow}`}
                                        aria-label="Bajar"
                                        onClick={() => move(index, 1)}
                                        disabled={
                                            saving ||
                                            index === experiences.length - 1
                                        }
                                    >
                                        ▼
                                    </button>
                                    <button
                                        className={`${styles.pill} ${
                                            experience.visible
                                                ? styles.pillOn
                                                : styles.pillOff
                                        }`}
                                        onClick={() => toggleVisible(index)}
                                        disabled={saving}
                                        title={
                                            experience.visible
                                                ? "Ocultar de la página"
                                                : "Mostrar en la página"
                                        }
                                    >
                                        {experience.visible
                                            ? "Visible"
                                            : "Oculta"}
                                    </button>
                                    <button
                                        className="adm-btn adm-btn--ghost"
                                        onClick={() => setEditing({ index })}
                                        disabled={saving}
                                    >
                                        Editar
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {editing && (
                <ExperienceDialog
                    key={editingExperience?._id ?? "new"}
                    experience={editingExperience}
                    saving={saving}
                    saveError={error}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    onClose={closeDialog}
                />
            )}
        </div>
    );
};

export default AdminExperiences;
