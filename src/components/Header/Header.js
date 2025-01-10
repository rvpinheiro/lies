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
                checkIfAdmin(user.uid);
            } else {
                setIsLoggedIn(false);
                setIsAdmin(false);
            }
        });
    }, []);

    const checkIfAdmin = async (uid) => {
        const db = getDatabase();
        const adminsRef = ref(db, 'admins/' + uid);

        const snapshot = await get(adminsRef);
        if (snapshot.exists() && snapshot.val() === true) {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
    };

    const handleLogout = () => {
        const auth = getAuth();
        auth.signOut().then(() => {
            setIsLoggedIn(false);
            setIsAdmin(false);
            router.push("/");
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
