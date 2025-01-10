'use client'

import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import styles from './page.module.css';

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const router = useRouter();

    const handleRegister = (e) => {
        e.preventDefault();
        const auth = getAuth();

        createUserWithEmailAndPassword(auth, email, password)
            .then(() => {
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
        router.push("/");
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <div className={styles.container}>
            <div className={styles.form}>
                <h2 className={styles.title}>Registar</h2>
                <form onSubmit={handleRegister} className={styles.formContent}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={styles.input}
                    />
                    <div className={styles.passwordContainer}>
                        <input
                            type={passwordVisible ? "text" : "password"}
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={styles.input}
                        />
                        <FontAwesomeIcon
                            icon={passwordVisible ? faEyeSlash : faEye}
                            onClick={togglePasswordVisibility}
                            className={styles.eyeIcon}
                        />
                    </div>
                    <button type="submit" className={styles.submitButton}>Registar</button>
                    <button type="button" className={styles.backButton} onClick={handleBack}>Voltar à Página Inicial</button>
                </form>
                {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
            </div>
        </div>
    );
};

export default Register;
