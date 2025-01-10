'use client'

import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { useRouter } from "next/navigation";
import styles from './page.module.css';

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState(""); // Campo para o nome
    const router = useRouter();

    const handleRegister = (e) => {
        e.preventDefault();
        const auth = getAuth();

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;

                // Após criar o utilizador, guardar o nome na base de dados
                const db = getDatabase();
                set(ref(db, 'users/' + user.uid), {
                    name: name,
                    email: email
                });

                router.push("/"); // Redirecionar para login após o registo
            })
            .catch((error) => {
                console.error("Erro ao registar:", error.message);
            });
    };

    const handleBack = () => {
        router.push("/");  // Voltar à página inicial
    };

    return (
        <div className={styles.container}>
            <div className={styles.form}>
                <h2 className={styles.title}>Registar</h2>
                <form onSubmit={handleRegister} className={styles.formContent}>
                    <input
                        type="text"
                        placeholder="Nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className={styles.input}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={styles.input}
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={styles.input}
                    />
                    <button type="submit" className={styles.submitButton}>Registar</button>
                    <button type="button" className={styles.backButton} onClick={handleBack}>Voltar à Página Inicial</button>
                </form>
            </div>
        </div>
    );
};

export default Register;
