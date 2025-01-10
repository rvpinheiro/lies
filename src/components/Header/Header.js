'use client'

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { useRouter } from "next/navigation";
import Button from "../Button/Button";
import styles from './Header.module.css';

const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsLoggedIn(true);
                checkIfAdmin(user.uid);  // Verifica se o utilizador é administrador
            } else {
                setIsLoggedIn(false);
                setIsAdmin(false);  // Se o utilizador sair, é removido da função admin
            }
        });
    }, []);

    // Função para verificar se o utilizador é administrador
    const checkIfAdmin = async (uid) => {
        const db = getDatabase();
        const adminsRef = ref(db, 'admins/' + uid);  // Verifica no nó 'admins' do Firebase

        const snapshot = await get(adminsRef);
        if (snapshot.exists() && snapshot.val() === true) {
            setIsAdmin(true);  // Se o utilizador for administrador, define como 'true'
        } else {
            setIsAdmin(false);  // Caso contrário, define como 'false'
        }
    };

    const handleLogout = () => {
        const auth = getAuth();
        auth.signOut().then(() => {
            setIsLoggedIn(false);
            setIsAdmin(false);  // Limpa o estado de admin no logout
            router.push("/");  // Redireciona para a página inicial após logout
        }).catch((error) => {
            console.error("Erro ao sair:", error);
        });
    };

    return (
        <header className={styles.header}>
            <div className={styles.authButtons}>
                {!isLoggedIn && (
                    <>
                        <Button text="Registar" onClick={() => router.push("/register")} />
                        <Button text="Login" onClick={() => router.push("/login")} />
                    </>
                )}

                {isLoggedIn && (
                    <>
                        <Button text="Logout" onClick={handleLogout} />
                        {isAdmin && (
                            <Button text="Administração" onClick={() => router.push("/admin")} />
                        )}
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;
