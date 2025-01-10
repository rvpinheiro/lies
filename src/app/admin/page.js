// src/app/admin/page.js
'use client'

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";  // Importa o método de autenticação
import { getDatabase, ref, get, set } from "firebase/database";  // Funções do Firebase Realtime Database
import { useRouter } from "next/navigation";
import { database } from "@/firebase/firebaseConfig";  // Importação da configuração do Firebase

const AdminPage = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [users, setUsers] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            // Verifica se o utilizador é um administrador
            const checkAdminStatus = async () => {
                const adminsRef = ref(database, 'admins/' + user.uid);  // Verifica no nó admins
                const snapshot = await get(adminsRef);

                if (snapshot.exists() && snapshot.val() === true) {
                    setIsAdmin(true);
                    fetchUsers();  // Caso seja administrador, buscar os utilizadores
                } else {
                    setIsAdmin(false);
                    router.push("/");  // Redireciona para a página inicial se não for admin
                }
            };

            checkAdminStatus();
        } else {
            router.push("/login");  // Se não estiver logado, redireciona para login
        }
    }, [router]);

    // Função para listar os utilizadores
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
                    email: userData.email,
                    isAdmin: userData.isAdmin,
                });
            });
            setUsers(usersList);
        }
    };

    // Função para alterar o status de admin
    const toggleAdminStatus = async (uid, currentStatus) => {
        const userRef = ref(database, 'users/' + uid);
        await set(userRef, {
            ...users.find(user => user.uid === uid),
            isAdmin: !currentStatus,
        });

        // Atualiza a lista localmente
        setUsers(prevUsers =>
            prevUsers.map(user =>
                user.uid === uid ? { ...user, isAdmin: !currentStatus } : user
            )
        );
    };

    if (!isAdmin) {
        return <div>Acesso negado. Apenas administradores têm acesso a esta página.</div>;
    }

    return (
        <div>
            <h1>Página de Administração</h1>
            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Admin</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.uid}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.isAdmin ? 'Sim' : 'Não'}</td>
                            <td>
                                <button onClick={() => toggleAdminStatus(user.uid, user.isAdmin)}>
                                    {user.isAdmin ? 'Remover Admin' : 'Tornar Admin'}
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
