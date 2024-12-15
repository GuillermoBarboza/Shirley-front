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

    /*  useEffect(() => {
        setToken(localStorage.getItem("token"));
    }, []); */

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Email or Username:</label>
                    <input
                        type="text"
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {error && <p>{error}</p>}
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default LoginPage;

/* export default function App() {
  return (
    <main className='p-8 mx-auto max-w-screen-xl bg-orange-100 shadow-md rounded-lg'>
      <Home />
    </main>

  );
} */
