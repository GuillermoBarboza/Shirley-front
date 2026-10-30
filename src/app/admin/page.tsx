"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import ArtworkList from "../../components/ArtworkList/ArtworkList";
import AddArtworkForm from "../../components/AddArtworkForm/AddArtworkForm";
import AdminContactInfo from "@/components/ContactInfo/AdminContactInfo";
import AdminAccount from "@/components/Account/AdminAccount";
import styles from "./admin.module.css";

type Tab = "obras" | "contacto" | "cuenta";

const TABS: { id: Tab; label: string }[] = [
    { id: "obras", label: "Obras" },
    { id: "contacto", label: "Contacto" },
    { id: "cuenta", label: "Cuenta" },
];

const AdminPage = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [tab, setTab] = useState<Tab>("obras");
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/"); // Redirect to login if no token
            return;
        }

        axios
            .get(process.env.NEXT_PUBLIC_LOGIN_ENDPOINT + "/verify-token", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                if (response.data.role === "admin") {
                    setIsAuthenticated(true);
                } else {
                    router.push("/"); // Redirect to login if not admin
                }
            })
            .catch(() => {
                router.push("/"); // Redirect to login on error
            });
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/"); // Redirect to login page
    };

    if (!isAuthenticated) {
        return <div className={styles.loading}>Verificando tu sesión…</div>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.bar}>
                <div className={styles.brand}>
                    <div className={styles.wordmark}>Shirley Madero</div>
                    <div className={styles.badge}>Panel</div>
                </div>
                <button
                    className="adm-btn adm-btn--ghost"
                    onClick={handleLogout}
                >
                    Cerrar sesión
                </button>
            </div>

            <div className={styles.tabs}>
                {TABS.map(({ id, label }) => (
                    <button
                        key={id}
                        className={`${styles.tab} ${
                            tab === id ? styles.tabActive : ""
                        }`}
                        onClick={() => setTab(id)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {tab === "obras" && (
                <div className={styles.obras}>
                    <AddArtworkForm />
                    <ArtworkList />
                </div>
            )}

            {tab === "contacto" && (
                <div className={styles.narrow}>
                    <AdminContactInfo />
                </div>
            )}

            {tab === "cuenta" && (
                <div className={styles.narrow}>
                    <AdminAccount onLogout={handleLogout} />
                </div>
            )}
        </div>
    );
};

export default AdminPage;
