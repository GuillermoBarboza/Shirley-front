"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import ArtworkList from "../../components/ArtworkList/ArtworkList";
import AddArtworkForm from "../../components/AddArtworkForm/AddArtworkForm";
import styles from "./admin.module.css";
import AdminContactInfo from "@/components/ContactInfo/AdminContactInfo";

const AdminPage = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
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
                    console.log("User is authenticated");
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
        return <p>Loading...</p>;
    }

    return (
        <div className={`${styles.container} shadow-lg p-6 rounded-lg`}>
            <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={handleLogout}
            >
                Logout
            </button>
            <h1 className="prose prose-lg text-gray-800 font-bold mb-4">
                Panel de administración
            </h1>
            <p className="text-gray-600 mb-6">
                Aquí puedes agregar y eliminar obras de tu galería.
            </p>
            <AdminContactInfo />
            {/* Add more content or components as needed */}
            <AddArtworkForm />
            <ArtworkList />
        </div>
    );
};

export default AdminPage;
