"use client";
import { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCard from "@/components/AuthCard/AuthCard";
import styles from "./reset-password.module.css";

const ResetPasswordForm = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [tokenValid, setTokenValid] = useState(false);
    const [validating, setValidating] = useState(true);

    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const userId = searchParams.get("id");

    useEffect(() => {
        // Validate token on page load
        const validateToken = async () => {
            if (!token || !userId) {
                setError("El enlace no es válido");
                setValidating(false);
                return;
            }

            try {
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_LOGIN_ENDPOINT}/users/validate-reset-token`,
                    { token, userId }
                );

                if (response.data.valid) {
                    setTokenValid(true);
                } else {
                    setError("Este enlace expiró o no es válido");
                }
            } catch {
                setError("Este enlace expiró o no es válido");
            } finally {
                setValidating(false);
            }
        };

        validateToken();
    }, [token, userId]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);

        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_LOGIN_ENDPOINT}/users/reset-password`,
                {
                    userId,
                    token,
                    newPassword: password,
                }
            );

            setSuccess(true);

            // Back to the login screen, which lives at "/".
            setTimeout(() => {
                router.push("/");
            }, 2200);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(
                    err.response?.data?.message ||
                        "No pudimos actualizar la contraseña"
                );
            } else {
                setError("No pudimos actualizar la contraseña");
            }
        } finally {
            setLoading(false);
        }
    };

    if (validating) {
        return (
            <AuthCard centered>
                <p className={styles.message}>Validando el enlace…</p>
            </AuthCard>
        );
    }

    if (error && !tokenValid) {
        return (
            <AuthCard heading="Este enlace expiró" centered>
                <p className={styles.body}>
                    El enlace para restablecer tu contraseña ya no es válido.
                    Pedí uno nuevo.
                </p>
                <button
                    onClick={() => router.push("/forgot-password")}
                    className="adm-btn adm-btn--block"
                >
                    Solicitar uno nuevo
                </button>
            </AuthCard>
        );
    }

    return (
        <AuthCard heading="Elegí una nueva contraseña">
            {error && (
                <div className="adm-banner adm-banner--error">{error}</div>
            )}
            {success && (
                <div className="adm-banner adm-banner--ok">
                    Contraseña actualizada. Redirigiendo…
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <label className="adm-label" htmlFor="password">
                    Nueva contraseña
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`adm-input ${styles.field}`}
                    required
                    disabled={loading || success}
                />

                <label className="adm-label" htmlFor="confirmPassword">
                    Confirmar contraseña
                </label>
                <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`adm-input ${styles.field}`}
                    required
                    disabled={loading || success}
                />

                <button
                    type="submit"
                    className="adm-btn adm-btn--block"
                    disabled={loading || success}
                >
                    {loading ? "Guardando…" : "Guardar contraseña"}
                </button>
            </form>
        </AuthCard>
    );
};

/**
 * useSearchParams() opts the route into client-side rendering, which Next 15
 * requires to sit behind a Suspense boundary — without it the production build
 * fails to prerender this page.
 */
const ResetPasswordPage = () => (
    <Suspense
        fallback={
            <AuthCard centered>
                <p className={styles.message}>Validando el enlace…</p>
            </AuthCard>
        }
    >
        <ResetPasswordForm />
    </Suspense>
);

export default ResetPasswordPage;
