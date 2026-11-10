"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./AdminContactInfo.module.css";

const AdminContactInfo = () => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [newPhoneNumber, setNewPhoneNumber] = useState("");
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    // "Ver en tu pared" on the public gallery. null until loaded.
    const [wallView, setWallView] = useState<boolean | null>(null);
    const [wallSaving, setWallSaving] = useState(false);
    const [wallError, setWallError] = useState("");

    useEffect(() => {
        const fetchPhoneNumber = async () => {
            try {
                const response = await axios.get(
                    process.env.NEXT_PUBLIC_CONTACT_INFO_ENDPOINT + "/"
                );
                setPhoneNumber(response.data.phoneNumber);
                setWallView(response.data?.wallViewEnabled !== false);
            } catch (error) {
                console.error("Error fetching phone number:", error);
            }
        };

        fetchPhoneNumber();
    }, []);

    const handleUpdatePhoneNumber = async () => {
        if (!newPhoneNumber.trim()) return;
        setError("");
        setSaving(true);
        try {
            const response = await axios.put(
                process.env.NEXT_PUBLIC_CONTACT_INFO_ENDPOINT + "/",
                { phoneNumber: newPhoneNumber.trim() },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );
            setPhoneNumber(response.data.phoneNumber);
            setNewPhoneNumber("");
            setSaved(true);
            window.setTimeout(() => setSaved(false), 2400);
        } catch (error) {
            console.error("Error updating phone number:", error);
            setError("No pudimos actualizar el número. Probá de nuevo.");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleWallView = async () => {
        if (wallView === null) return;
        setWallError("");
        setWallSaving(true);
        try {
            const response = await axios.put(
                process.env.NEXT_PUBLIC_CONTACT_INFO_ENDPOINT + "/",
                { wallViewEnabled: !wallView },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );
            setWallView(response.data?.wallViewEnabled !== false);
        } catch (error) {
            console.error("Error updating wall view switch:", error);
            setWallError("No pudimos guardar el cambio. Probá de nuevo.");
        } finally {
            setWallSaving(false);
        }
    };

    return (
        <>
            <div className={styles.panel}>
                <h2 className={styles.title}>Información de contacto</h2>
                <p className={styles.note}>
                    Este número aparece en la galería pública para consultas por
                    WhatsApp.
                </p>

                <div className={styles.label}>Número actual</div>
                <div className={styles.current}>{phoneNumber || "—"}</div>

                {error && (
                    <div className="adm-banner adm-banner--error">{error}</div>
                )}

                <label className="adm-label" htmlFor="newPhone">
                    Nuevo número
                </label>
                <input
                    id="newPhone"
                    type="text"
                    value={newPhoneNumber}
                    onChange={(e) => setNewPhoneNumber(e.target.value)}
                    placeholder="+598 ..."
                    className={`adm-input ${styles.field}`}
                />
                <button
                    onClick={handleUpdatePhoneNumber}
                    className="adm-btn"
                    disabled={saving || !newPhoneNumber.trim()}
                >
                    {saving ? "Guardando…" : "Actualizar número"}
                </button>

                {saved && <div className={styles.saved}>Número actualizado.</div>}
            </div>

            <div className={`${styles.panel} ${styles.panelGap}`}>
                <h2 className={styles.title}>Funciones de la página</h2>
                <p className={styles.note}>
                    “Ver en tu pared” permite a los visitantes ver una obra colgada
                    en su pared, a tamaño real, con la cámara del celular.
                </p>

                {wallError && (
                    <div className="adm-banner adm-banner--error">{wallError}</div>
                )}

                <div className={styles.switchRow}>
                    <span className={styles.switchLabel}>Ver en tu pared</span>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={wallView === true}
                        onClick={handleToggleWallView}
                        disabled={wallView === null || wallSaving}
                        className={`${styles.switch} ${
                            wallView ? styles.switchOn : styles.switchOff
                        }`}
                    >
                        {wallView === null
                            ? "…"
                            : wallSaving
                            ? "Guardando…"
                            : wallView
                            ? "Activado"
                            : "Desactivado"}
                    </button>
                </div>
            </div>
        </>
    );
};

export default AdminContactInfo;
