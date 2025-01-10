'use client'

import { useEffect, useState } from "react";
import { ref, get, set, remove, update } from "firebase/database";
import { database } from "@/firebase/firebaseConfig";
import styles from './page.module.css';
import { useRouter } from 'next/navigation';

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [newUserName, setNewUserName] = useState("");
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
                });
            });
            setUsers(usersList);
        }
    };

    // Função para reiniciar o "counter" (global)
    const resetCounter = async () => {
        const counterRef = ref(database, 'counter');
        const newTime = Date.now();
        await update(counterRef, {
            maxTimeWithoutLie: 0,
            time: newTime,
        });

        alert("Contadores reiniciados com sucesso!");
    };

    // Função para adicionar um novo utilizador
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
        });

        setNewUserName("");
        fetchUsers();
    };

    // Função para remover um utilizador
    const removeUser = async (uid) => {
        const userRef = ref(database, `users/${uid}`);
        await remove(userRef);
        fetchUsers();
    };

    // Função para eliminar as mentiras de um utilizador
    const resetLies = async (uid) => {
        const userRef = ref(database, `users/${uid}`);

        // Define o contador de mentiras a 0 e apaga as mentiras associadas
        await update(userRef, {
            liesCount: 0,
            lies: {},  // Apaga todas as mentiras
        });

        alert("Mentiras do utilizador apagadas com sucesso!");
        fetchUsers();  // Atualiza a lista de utilizadores
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
            <table className={styles.usersTable}>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Número de Mentiras</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.uid}>
                            <td>{user.name}</td>
                            <td>{user.liesCount}</td>
                            <td className={styles.buttons}>
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
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminPage;
