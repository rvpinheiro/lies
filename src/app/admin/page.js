'use client'

import { useEffect, useState } from "react";
import { getDatabase, ref, get, set, remove } from "firebase/database";  // Funções do Firebase Realtime Database
import { database } from "@/firebase/firebaseConfig";  // Importação da configuração do Firebase
import styles from './page.module.css';  // Importação das classes de CSS modules
import { useRouter } from 'next/navigation';  // Hook para navegação entre páginas

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [newUserName, setNewUserName] = useState("");  // Nome do novo utilizador
    const router = useRouter();  // Hook para redirecionamento

    // Função para listar os utilizadores existentes
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
                    liesCount: userData.liesCount,  // Número de mentiras
                });
            });
            setUsers(usersList);
        }
    };

    // Função para adicionar um novo utilizador
    const addUser = async () => {
        if (!newUserName) {
            alert("Por favor, preencha o nome do utilizador!");
            return;
        }

        const newUserId = `user_${Date.now()}`;  // Gera um ID único para o utilizador
        const userRef = ref(database, 'users/' + newUserId);  // Caminho onde o utilizador será guardado

        // Adiciona o utilizador com o nome, inicializa o número de mentiras em 0 e cria o subnó "lies"
        await set(userRef, {
            name: newUserName,
            liesCount: 0,  // Número de mentiras começa em 0
            lies: {},  // O subnó "lies" começa vazio (sem mentiras)
        });

        // Limpa o campo de nome
        setNewUserName("");

        // Atualiza a lista de utilizadores
        fetchUsers();
    };

    // Função para remover um utilizador
    const removeUser = async (uid) => {
        const userRef = ref(database, `users/${uid}`);
        await remove(userRef);  // Remove o utilizador do Firebase

        // Atualiza a lista de utilizadores após remoção
        fetchUsers();
    };

    useEffect(() => {
        fetchUsers();  // Carrega a lista de utilizadores quando a página carrega
    }, []);

    // Função para voltar à página inicial
    const handleGoBack = () => {
        router.push('/');  // Redireciona para a página inicial
    };

    return (
        <div className={styles.adminPageContainer}>
            <h1>Página de Administração</h1>

            {/* Botão para voltar à página inicial */}
            <button className={styles.goBackButton} onClick={handleGoBack}>Voltar à Página Inicial</button>

            {/* Formulário para adicionar novo utilizador */}
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

            {/* Tabela de utilizadores */}
            <table className={styles.usersTable}>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Número de Mentiras</th>
                        <th>Acções</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.uid}>
                            <td>{user.name}</td>
                            <td>{user.liesCount}</td>
                            <td>
                                <button
                                    className={styles.removeUserButton}
                                    onClick={() => removeUser(user.uid)}
                                >
                                    Remover
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
