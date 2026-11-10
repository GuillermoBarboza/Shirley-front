"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/AuthCard/AuthCard";
import styles from "./login.module.css";

const LoginPage = () => {
    const [emailOrUsername, setEmailOrUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            const response = await axios.post(
                process.env.NEXT_PUBLIC_LOGIN_ENDPOINT + "/users/login",
                {
                    emailOrUsername,
                    password,
                }
            );
            localStorage.setItem("token", response.data.token);
            router.push("/admin"); // Redirect to admin page
        } catch {
            setError("Usuario o contraseña incorrectos.");
            setSubmitting(false);
        }
    };

    return (
        <AuthCard brand>
            {error && (
                <div className="adm-banner adm-banner--error">{error}</div>
            )}

            <form onSubmit={handleLogin}>
                <label className="adm-label" htmlFor="emailOrUsername">
                    Email o usuario
                </label>
                <input
                    id="emailOrUsername"
                    type="text"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    className={`adm-input ${styles.field}`}
                />

                <label className="adm-label" htmlFor="password">
                    Contraseña
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="adm-input"
                />

                <div className={styles.forgotRow}>
                    <button
                        type="button"
                        className={styles.forgotLink}
                        onClick={() => router.push("/forgot-password")}
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
                </div>

                <button
                    type="submit"
                    className="adm-btn adm-btn--block"
                    disabled={submitting}
                >
                    {submitting ? "Ingresando…" : "Ingresar"}
                </button>
            </form>
        </AuthCard>
    );
};

export default LoginPage;
