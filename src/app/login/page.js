'use client'

import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import styles from './page.module.css';
import { auth } from '@/firebase/firebaseConfig';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/"); // Redireciona para a página inicial após login bem-sucedido
        } catch (err) {
            setError(err.message);  // Definir erro caso ocorra
        }
    };


    const handleBack = () => {
        router.push("/");
    };

    return (
        <div className={styles.container}>
            <h2>Login</h2>
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Entrar</button>
            </form>
            <button className={styles.backButton} onClick={handleBack}>
                Voltar à Página Inicial
            </button>
        </div>
    );
};

export default Login;
