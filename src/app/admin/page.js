'use client'

import { useEffect, useState } from "react";
import { ref, get, set, remove, update } from "firebase/database";
import { database } from "@/firebase/firebaseConfig";
import styles from './page.module.css';
import { useRouter } from 'next/navigation';

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [newUserName, setNewUserName] = useState("");
    const [editingUser, setEditingUser] = useState(null); // Para controlar o utilizador em edição
    const [editedName, setEditedName] = useState(""); // Para armazenar o nome editado
    const router = useRouter();

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
                    liesCount: userData.liesCount,
                    isActive: userData.isActive,
                });
            });
            setUsers(usersList);
        }
    };

    const resetCounter = async () => {
        const counterRef = ref(database, 'counter');
        const newTime = Date.now();
        await update(counterRef, {
            maxTimeWithoutLie: 0,
            time: newTime,
        });

        alert("Contadores reiniciados com sucesso!");
    };

    const addUser = async () => {
        if (!newUserName) {
            alert("Por favor, preencha o nome do utilizador!");
            return;
        }

        const newUserId = `user_${Date.now()}`;
        const userRef = ref(database, 'users/' + newUserId);

        await set(userRef, {
            name: newUserName,
            liesCount: 0,
            lies: {},
            isActive: true,
        });

        setNewUserName("");
        fetchUsers();
    };

    const removeUser = async (uid) => {
        const userRef = ref(database, `users/${uid}`);
        await remove(userRef);
        fetchUsers();
    };

    const resetLies = async (uid) => {
        const userRef = ref(database, `users/${uid}`);

        await update(userRef, {
            liesCount: 0,
            lies: {},
        });

        alert("Mentiras do utilizador apagadas com sucesso!");
        fetchUsers();
    };

    const toggleUserStatus = async (uid, isActive) => {
        const userRef = ref(database, `users/${uid}`);
        await update(userRef, {
            isActive: !isActive,
        });

        fetchUsers();
    };

    const editUserName = async (uid, newName) => {
        const userRef = ref(database, `users/${uid}`);
        await update(userRef, {
            name: newName
        });
        setEditingUser(null); // Remove o estado de edição
        fetchUsers(); // Atualiza a lista de utilizadores
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleGoBack = () => {
        router.push('/');
    };

    return (
        <div className={styles.adminPageContainer}>
            <h1>Página de Administração</h1>
            <button className={styles.goBackButton} onClick={handleGoBack}>Voltar à Página Inicial</button>
            <div className={styles.resetCounterContainer}>
                <button className={styles.addUserButton} onClick={resetCounter}>
                    Reiniciar Contadores
                </button>
            </div>
            <div className={styles.addUserContainer}>
                <h2>Adicionar Novo Utilizador</h2>
                <div className={styles.inputField}>
                    <label>Nome: </label>
                    <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                    />
                </div>
                <button className={styles.addUserButton} onClick={addUser}>Adicionar Utilizador</button>
            </div>
            <div className={styles.usersContainer}>
                {users.map(user => (
                    <div key={user.uid} className={styles.userCard}>
                        <h3>
                            {editingUser === user.uid ? (
                                <input
                                    type="text"
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                />
                            ) : (
                                user.name
                            )}
                        </h3>
                        <p>Mentiras: {user.liesCount}</p>
                        <div className={styles.buttons}>
                            <button
                                className={styles.removeUserButton}
                                onClick={() => removeUser(user.uid)}
                            >
                                Remover
                            </button>
                            <button
                                className={styles.removeUserButton}
                                onClick={() => resetLies(user.uid)}
                            >
                                Eliminar Mentiras
                            </button>
                            {editingUser === user.uid ? (
                                <button
                                    className={styles.removeUserButton}
                                    onClick={() => editUserName(user.uid, editedName)}
                                >
                                    Salvar
                                </button>
                            ) : (
                                <button
                                    className={styles.editUserButton}
                                    onClick={() => {
                                        setEditingUser(user.uid);
                                        setEditedName(user.name);
                                    }}
                                >
                                    Editar
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminPage;
