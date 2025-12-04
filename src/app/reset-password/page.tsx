"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./reset-password.module.css";

const ResetPasswordPage = () => {
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
                setError("Invalid reset link");
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
                    setError("This password reset link has expired or is invalid");
                }
            } catch (err) {
                setError("This password reset link has expired or is invalid");
            } finally {
                setValidating(false);
            }
        };

        validateToken();
    }, [token, userId]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        
        // Validate passwords
        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }
        
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        
        setLoading(true);
        
        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_LOGIN_ENDPOINT}/users/reset-password`,
                {
                    userId,
                    token,
                    newPassword: password
                }
            );
            
            setSuccess(true);
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push("/login");
            }, 3000);
            
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || "Failed to reset password");
            } else {
                setError("Failed to reset password");
            }
        } finally {
            setLoading(false);
        }
    };

    if (validating) {
        return (
            <div className={styles.resetContainer}>
                <p className={styles.message}>Validating your reset link...</p>
            </div>
        );
    }

    if (error && !tokenValid) {
        return (
            <div className={styles.resetContainer}>
                <h2 className={styles.resetTitle}>Password Reset Failed</h2>
                <p className={styles.errorMessage}>{error}</p>
                <button 
                    onClick={() => router.push("/forgot-password")}
                    className={styles.backButton}
                >
                    Request New Reset Link
                </button>
            </div>
        );
    }

    if (success) {
        return (
            <div className={styles.resetContainer}>
                <h2 className={styles.resetTitle}>Password Reset Successful!</h2>
                <p className={styles.successMessage}>Your password has been updated. Redirecting to login...</p>
            </div>
        );
    }

    return (
        <div className={styles.resetContainer}>
            <h2 className={styles.resetTitle}>Reset Your Password</h2>
            <form onSubmit={handleSubmit} className={styles.resetForm}>
                <div className={styles.formGroup}>
                    <label htmlFor="password">New Password:</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.formInput}
                        required
                        disabled={loading}
                    />
                </div>
                
                <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword">Confirm Password:</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={styles.formInput}
                        required
                        disabled={loading}
                    />
                </div>
                
                {error && <p className={styles.errorMessage}>{error}</p>}
                
                <button 
                    type="submit" 
                    className={styles.resetButton}
                    disabled={loading}
                >
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
            </form>
        </div>
    );
};

export default ResetPasswordPage;