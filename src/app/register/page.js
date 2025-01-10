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
    const [errorMessage, setErrorMessage] = useState("");  // Estado para armazenar a mensagem de erro
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

                router.push("/");
            })
            .catch((error) => {
                let customMessage = "Erro desconhecido.";
                switch (error.code) {
                    case 'auth/invalid-email':
                        customMessage = "O email fornecido não é válido.";
                        break;
                    case 'auth/email-already-in-use':
                        customMessage = "Este email já está em uso.";
                        break;
                    case 'auth/weak-password':
                        customMessage = "A senha deve ter pelo menos 6 caracteres.";
                        break;
                    case 'auth/invalid-credential':
                        customMessage = "Credenciais inválidas. Verifica os dados e tenta novamente.";
                        break;
                    default:
                        customMessage = error.message;
                }
                setErrorMessage(customMessage);
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
                {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
            </div>
        </div>
    );
};

export default Register;
