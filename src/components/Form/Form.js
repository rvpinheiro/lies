'use client'

import { useEffect, useState } from "react";
import { getDatabase, ref, set, get, update } from "firebase/database";
import { database } from "@/firebase/firebaseConfig";
import styles from './Form.module.css';
import Button from "../Button/Button";

const Form = ({ onClose, onSubmit }) => {
    const [liar, setLiar] = useState("");
    const [lie, setLie] = useState("");
    const [users, setUsers] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [timeoutId, setTimeoutId] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            const usersRef = ref(database, 'users');
            const snapshot = await get(usersRef);
            if (snapshot.exists()) {
                const usersList = [];
                snapshot.forEach((childSnapshot) => {
                    const userData = childSnapshot.val();
                    usersList.push({
                        uid: childSnapshot.key,
                        name: userData.name,
                        liesCount: userData.liesCount || 0,
                    });
                });
                setUsers(usersList);
            }
        };

        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (liar && lie) {
            const userRef = ref(database, 'users/' + liar);

            const newLieRef = ref(database, `users/${liar}/lies/lie_${Date.now()}`);
            const newLie = {
                lie: lie,
                timestamp: Date.now(),
            };
            await set(newLieRef, newLie);

            const userSnapshot = await get(userRef);
            const currentLiesCount = userSnapshot.exists() ? userSnapshot.val().liesCount || 0 : 0;

            await update(userRef, {
                liesCount: currentLiesCount + 1,
            });

            setLiar("");
            setLie("");
            setSuccessMessage("Mentira adicionada!");
            const id = setTimeout(() => {
                onSubmit();
                onClose();
                setSuccessMessage("");
            }, 2000);

            setTimeoutId(id);
        }
    };

    const handleClose = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        onClose();
    };

    return (
        <div className={styles.container}>
            <div className={styles.overlay} onClick={handleClose}></div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <h2 className={styles.title}>Registar Mentira</h2>
                <div className={styles.field}>
                    <label htmlFor="liar" className={styles.label}>O mentiroso:</label>
                    <select
                        id="liar"
                        value={liar}
                        onChange={(e) => setLiar(e.target.value)}
                        required
                        className={styles.input}
                    >
                        <option value="">Seleciona um nome</option>
                        {users.map(user => (
                            <option key={user.uid} value={user.uid}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.field}>
                    <label htmlFor="lie" className={styles.label}>A mentira:</label>
                    <textarea
                        id="lie"
                        value={lie}
                        onChange={(e) => setLie(e.target.value)}
                        required
                        className={styles.textarea}
                    />
                </div>
                <div className={styles.buttons}>
                    <Button text="Enviar" />
                    <Button text="Fechar" onClick={handleClose} />
                </div>

                {successMessage && (
                    <div className={styles.successMessage}>{successMessage}</div>
                )}
            </form>
        </div>
    );
};

export default Form;
