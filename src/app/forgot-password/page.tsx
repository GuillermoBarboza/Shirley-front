
// ForgotPassword.tsx
"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import styles from "./forgot-password.module.css";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState({ type: "", message: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_LOGIN_ENDPOINT}/users/forgot-password`,
                { email }
            );
            
            // Always show success even if email doesn't exist (security best practice)
            setStatus({
                type: "success",
                message: "If an account exists with this email, you'll receive password reset instructions shortly."
            });
        } catch (error) {
            setStatus({
                type: "error",
                message: "Something went wrong. Please try again later."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackToLogin = () => {
        router.push("/");
    };

    return (
        <div className={styles.forgotContainer}>
            <h2 className={styles.forgotTitle}>Reset Your Password</h2>
            
            {status.type === "success" ? (
                <div className={styles.successBox}>
                    <p>{status.message}</p>
                    <button 
                        onClick={handleBackToLogin}
                        className={styles.backButton}
                    >
                        Back to Login
                    </button>
                </div>
            ) : (
                <>
                    <p className={styles.instructions}>
                        Enter your email address and we'll send you instructions to reset your password.
                    </p>
                    
                    <form onSubmit={handleSubmit} className={styles.forgotForm}>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email Address:</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.formInput}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        
                        {status.type === "error" && (
                            <p className={styles.errorMessage}>{status.message}</p>
                        )}
                        
                        <div className={styles.buttonGroup}>
                            <button 
                                type="submit" 
                                className={styles.resetButton}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Sending..." : "Send Reset Link"}
                            </button>
                            
                            <button 
                                type="button"
                                onClick={handleBackToLogin}
                                className={styles.backButton}
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

export default ForgotPasswordPage;