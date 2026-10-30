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

    useEffect(() => {
        const fetchPhoneNumber = async () => {
            try {
                const response = await axios.get(
                    process.env.NEXT_PUBLIC_CONTACT_INFO_ENDPOINT + "/"
                );
                setPhoneNumber(response.data.phoneNumber);
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

    return (
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
    );
};

export default AdminContactInfo;
