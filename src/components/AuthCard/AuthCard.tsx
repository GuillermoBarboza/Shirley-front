import React from "react";
import styles from "./AuthCard.module.css";

interface AuthCardProps {
    /** Shows the cursive wordmark + "Panel de administración" above the content. */
    brand?: boolean;
    /** Editorial heading, for the screens that don't carry the brand block. */
    heading?: string;
    centered?: boolean;
    children: React.ReactNode;
}

/**
 * The single frame behind login, forgot-password and both reset-password states.
 * These four screens previously had three different layouts — two of them
 * full-bleed with no padding at all.
 */
const AuthCard: React.FC<AuthCardProps> = ({
    brand,
    heading,
    centered,
    children,
}) => (
    <div className={styles.screen}>
        <div
            className={`${styles.card} ${centered ? styles.centered : ""}`}
        >
            {brand && (
                <div className={styles.brand}>
                    <div className={styles.wordmark}>Shirley Madero</div>
                    <div className={styles.kicker}>
                        Panel de administración
                    </div>
                </div>
            )}
            {heading && <h1 className={styles.heading}>{heading}</h1>}
            {children}
        </div>
    </div>
);

export default AuthCard;
