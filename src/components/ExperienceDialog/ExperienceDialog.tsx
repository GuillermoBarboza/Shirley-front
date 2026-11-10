"use client";
import React, { useEffect, useRef, useState } from "react";
import {
    Accent,
    Experience,
    parseSteps,
    stepsToText,
    trimFields,
    MAX_PHOTO_BYTES,
} from "../../app/utils/experiences";
import css from "./ExperienceDialog.module.css";

interface ExperienceDialogProps {
    /** null = new experience. */
    experience: Experience | null;
    saving: boolean;
    /** Save/upload failure reported by the parent, shown inside the dialog. */
    saveError?: string;
    onSave(next: Experience, photo: File | null): Promise<void>;
    /** Only offered when editing an existing experience. */
    onDelete(): Promise<void>;
    onClose(): void;
}

const BLANK: Experience = {
    kicker: "",
    title: "",
    quote: "",
    place: "",
    description: "",
    steps: [],
    note: "",
    accent: "olive",
    visible: true,
};

/**
 * Collects input only. The parent owns uploads, saving and Storage cleanup, so
 * a photo is never deleted unless the page save that replaces it succeeded.
 */
const ExperienceDialog: React.FC<ExperienceDialogProps> = ({
    experience,
    saving,
    saveError,
    onSave,
    onDelete,
    onClose,
}) => {
    const [draft, setDraft] = useState<Experience>(experience ?? BLANK);
    const [stepsText, setStepsText] = useState(
        stepsToText((experience ?? BLANK).steps)
    );
    const [photo, setPhoto] = useState<File | null>(null);
    const [error, setError] = useState("");
    const [armed, setArmed] = useState(false);
    const disarmTimer = useRef<number | undefined>(undefined);

    // Lock the page behind the dialog and wire Escape to close it.
    useEffect(() => {
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", onKey);
            window.clearTimeout(disarmTimer.current);
        };
    }, [onClose]);

    const set =
        (key: "kicker" | "title" | "quote" | "place" | "description" | "note") =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setDraft((d) => ({ ...d, [key]: e.target.value }));

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file && file.size > MAX_PHOTO_BYTES) {
            setError("La imagen supera los 16 MB.");
            setPhoto(null);
            e.target.value = "";
            return;
        }
        setError("");
        setPhoto(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!draft.title.trim()) {
            setError("El título es obligatorio.");
            return;
        }
        setError("");
        const trimmed = trimFields(draft, [
            "kicker",
            "title",
            "quote",
            "place",
            "description",
            "note",
        ]);
        await onSave({ ...trimmed, steps: parseSteps(stepsText) }, photo);
    };

    const handleDelete = async () => {
        if (!armed) {
            setArmed(true);
            disarmTimer.current = window.setTimeout(() => setArmed(false), 3000);
            return;
        }
        window.clearTimeout(disarmTimer.current);
        await onDelete();
    };

    const current = experience?.photoWebUrl || experience?.photoUrl;

    return (
        <div className={css.overlay} onClick={onClose} role="presentation">
            <div
                className={css.dialog}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={experience ? "Editar experiencia" : "Nueva experiencia"}
            >
                <button
                    onClick={onClose}
                    className={css.close}
                    aria-label="Cerrar"
                >
                    ✕
                </button>

                <h2 className={css.title}>
                    {experience ? "Editar experiencia" : "Nueva experiencia"}
                </h2>

                {(error || saveError) && (
                    <div className="adm-banner adm-banner--error">
                        {error || saveError}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className={css.field}>
                        <label className="adm-label" htmlFor="exp-photo">
                            Foto
                        </label>
                        <input
                            id="exp-photo"
                            type="file"
                            accept="image/*"
                            onChange={handlePhoto}
                            className={css.file}
                        />
                        {current && !photo && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={current}
                                alt={experience?.title || "Foto actual"}
                                className={css.current}
                            />
                        )}
                    </div>

                    <div className={css.field}>
                        <label className="adm-label" htmlFor="exp-kicker">
                            Etiqueta
                        </label>
                        <input
                            id="exp-kicker"
                            className="adm-input"
                            placeholder="Experiencia sensorial"
                            value={draft.kicker}
                            onChange={set("kicker")}
                        />
                    </div>

                    <div className={css.field}>
                        <label className="adm-label" htmlFor="exp-title">
                            Título
                        </label>
                        <input
                            id="exp-title"
                            className="adm-input"
                            value={draft.title}
                            onChange={set("title")}
                        />
                    </div>

                    <div className={css.field}>
                        <label className="adm-label" htmlFor="exp-quote">
                            Cita
                        </label>
                        <input
                            id="exp-quote"
                            className="adm-input"
                            value={draft.quote}
                            onChange={set("quote")}
                        />
                        <div className={css.hint}>
                            Sin comillas, se agregan solas.
                        </div>
                    </div>

                    <div className={css.field}>
                        <label className="adm-label" htmlFor="exp-place">
                            Lugar
                        </label>
                        <input
                            id="exp-place"
                            className="adm-input"
                            value={draft.place}
                            onChange={set("place")}
                        />
                    </div>

                    <div className={css.field}>
                        <label className="adm-label" htmlFor="exp-description">
                            Descripción
                        </label>
                        <textarea
                            id="exp-description"
                            className="adm-textarea"
                            rows={3}
                            value={draft.description}
                            onChange={set("description")}
                        />
                    </div>

                    <div className={css.field}>
                        <label className="adm-label" htmlFor="exp-steps">
                            Pasos
                        </label>
                        <textarea
                            id="exp-steps"
                            className="adm-textarea"
                            rows={4}
                            value={stepsText}
                            onChange={(e) => setStepsText(e.target.value)}
                        />
                        <div className={css.hint}>Uno por línea. Opcional.</div>
                    </div>

                    <div className={css.field}>
                        <label className="adm-label" htmlFor="exp-note">
                            Nota
                        </label>
                        <input
                            id="exp-note"
                            className="adm-input"
                            value={draft.note}
                            onChange={set("note")}
                        />
                        <div className={css.hint}>Opcional.</div>
                    </div>

                    <fieldset className={css.accents}>
                        <legend className="adm-label">Color</legend>
                        {(
                            [
                                ["olive", "Oliva"],
                                ["gold", "Dorado"],
                            ] as [Accent, string][]
                        ).map(([value, label]) => (
                            <label key={value} className={css.accent}>
                                <input
                                    type="radio"
                                    name="exp-accent"
                                    value={value}
                                    checked={draft.accent === value}
                                    onChange={() =>
                                        setDraft((d) => ({ ...d, accent: value }))
                                    }
                                />
                                <span
                                    className={`${css.swatch} ${
                                        value === "olive"
                                            ? css.swatchOlive
                                            : css.swatchGold
                                    }`}
                                />
                                {label}
                            </label>
                        ))}
                    </fieldset>

                    <label className={css.checkbox}>
                        <input
                            type="checkbox"
                            checked={draft.visible}
                            onChange={(e) =>
                                setDraft((d) => ({
                                    ...d,
                                    visible: e.target.checked,
                                }))
                            }
                        />
                        Visible en la página
                    </label>

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
                            className="adm-btn adm-btn--ghost"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancelar
                        </button>
                    </div>

                    {experience && (
                        <button
                            type="button"
                            className={`adm-btn adm-btn--danger-outline ${css.delete}`}
                            onClick={handleDelete}
                            disabled={saving}
                        >
                            {armed ? "Confirmar borrado" : "Borrar experiencia"}
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ExperienceDialog;
