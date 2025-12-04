"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const LoginPage = () => {
    const [emailOrUsername, setEmailOrUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    //const [token, setToken] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
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
            setError("Invalid email/username or password");
        }
    };

    const handleForgotPassword = (e: React.MouseEvent) => {
        e.preventDefault();
        router.push("/forgot-password");
    };


    return (
        <div className="login-container">
            <h2 className="login-title">Login</h2>
            <form onSubmit={handleLogin} className="login-form">
                <div className="form-group">
                    <label htmlFor="emailOrUsername">Email or Username:</label>
                    <input
                        id="emailOrUsername"
                        type="text"
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-input"
                    />
                    <a href="#" className="forgot-password" onClick={handleForgotPassword}>
                        Forgot password?
                    </a>
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="login-button">Login</button>
            </form>
        </div>
    );
};

export default LoginPage;

