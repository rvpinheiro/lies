'use client'

import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import styles from './page.module.css';
import { auth } from '@/firebase/firebaseConfig';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/");
        } catch (err) {
            let customMessage = "Erro desconhecido.";

            switch (err.code) {
                case 'auth/invalid-email':
                    customMessage = "O email fornecido não é válido.";
                    break;
                case 'auth/user-disabled':
                    customMessage = "A conta foi desativada.";
                    break;
                case 'auth/user-not-found':
                    customMessage = "Nenhum utilizador encontrado com este email.";
                    break;
                case 'auth/wrong-password':
                    customMessage = "A senha está incorreta.";
                    break;
                case 'auth/invalid-credential':
                    customMessage = "Credenciais inválidas.";
                    break;
                default:
                    customMessage = err.message;
            }

            setErrorMessage(customMessage);
        }
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
                <h2 className={styles.title}>Entrar</h2>
                <form onSubmit={handleLogin} className={styles.formContent}>
                    <div className={styles.inputWrapper}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>
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
                    <button type="submit" className={styles.submitButton}>Entrar</button>
                    <button type="button" className={styles.backButton} onClick={handleBack}>Voltar à Página Inicial</button>
                </form>
                {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}  {/* Exibe a mensagem de erro */}
            </div>
        </div>
    );
};

export default Login;
