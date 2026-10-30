// ForgotPassword.tsx
"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/AuthCard/AuthCard";
import styles from "./forgot-password.module.css";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_LOGIN_ENDPOINT}/users/forgot-password`,
                { email }
            );
            // Always report success even if the email doesn't exist, so the form
            // can't be used to enumerate accounts.
            setSent(true);
        } catch {
            setError("Algo salió mal. Probá de nuevo en unos minutos.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthCard heading="Recuperar contraseña">
            {sent ? (
                <>
                    <p className={styles.body}>
                        Si el correo existe, vas a recibir un enlace para
                        restablecer tu contraseña.
                    </p>
                    <button
                        className="adm-link"
                        onClick={() => router.push("/")}
                    >
                        Volver a iniciar sesión
                    </button>
                </>
            ) : (
                <>
                    {error && (
                        <div className="adm-banner adm-banner--error">
                            {error}
                        </div>
                    )}
                    <p className={styles.intro}>
                        Ingresá tu email y te enviamos un enlace para
                        restablecerla.
                    </p>
                    <form onSubmit={handleSubmit}>
                        <label className="adm-label" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`adm-input ${styles.field}`}
                            disabled={isSubmitting}
                        />
                        <button
                            type="submit"
                            className={`adm-btn adm-btn--block ${styles.submit}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Enviando…" : "Enviar enlace"}
                        </button>
                    </form>
                    <button
                        className={styles.backLink}
                        onClick={() => router.push("/")}
                    >
                        Volver a iniciar sesión
                    </button>
                </>
            )}
        </AuthCard>
    );
};

export default ForgotPasswordPage;
