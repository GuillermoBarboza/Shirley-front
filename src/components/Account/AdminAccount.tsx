"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./AdminAccount.module.css";

interface AdminAccountProps {
    onLogout: () => void;
}

/** Reads `_id` out of the JWT payload without pulling in a jwt library. */
const userIdFromToken = (token: string): string | null => {
    try {
        const [, payload] = token.split(".");
        const json = JSON.parse(
            atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
        );
        return json?._id ?? null;
    } catch {
        return null;
    }
};

const AdminAccount: React.FC<AdminAccountProps> = ({ onLogout }) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const id = userIdFromToken(token);
        if (!id) return;

        axios
            .get(`${process.env.NEXT_PUBLIC_LOGIN_ENDPOINT}/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setUsername(res.data?.username ?? "");
                setEmail(res.data?.email ?? "");
            })
            .catch((err) => {
                console.error("Error fetching account:", err);
            });
    }, []);

    /**
     * Password changes go through the same emailed-link flow as a forgotten
     * password, so there is only one reset path to keep correct.
     */
    const handleChangePassword = async () => {
        if (!email) return;
        setError("");
        setSending(true);
        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_LOGIN_ENDPOINT}/users/forgot-password`,
                { email }
            );
            setSent(true);
        } catch {
            setError("No pudimos enviar el enlace. Probá de nuevo.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className={styles.panel}>
            <h2 className={styles.title}>Cuenta</h2>

            <div className={styles.label}>Usuario</div>
            <div className={styles.value}>{username || "—"}</div>

            <div className={styles.label}>Email</div>
            <div className={styles.value}>{email || "—"}</div>

            {error && (
                <div className="adm-banner adm-banner--error">{error}</div>
            )}
            {sent ? (
                <div className="adm-banner adm-banner--ok">
                    Te enviamos un enlace a {email} para cambiar la contraseña.
                </div>
            ) : (
                <button
                    className="adm-link"
                    onClick={handleChangePassword}
                    disabled={sending || !email}
                >
                    {sending ? "Enviando…" : "Cambiar contraseña"}
                </button>
            )}

            <div className={styles.divider}>
                <button
                    className="adm-btn adm-btn--danger-outline"
                    onClick={onLogout}
                >
                    Cerrar sesión
                </button>
            </div>
        </div>
    );
};

export default AdminAccount;
