'use client'

import { useState, useEffect } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { database } from "@/firebase/firebaseConfig";  // Importação da configuração do Firebase
import { useRouter } from "next/navigation"; // Importação do router para navegar
import styles from './page.module.css';  // Estilos da página (adapta conforme necessário)

const LiesPage = () => {
    const [usersLies, setUsersLies] = useState({});  // Estado para armazenar as mentiras agrupadas por utilizador
    const router = useRouter(); // Função para redirecionamento

    // Função para buscar todas as mentiras e agrupar por utilizador
    const fetchLies = async () => {
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
            const allLies = {};

            snapshot.forEach((userSnapshot) => {
                const userId = userSnapshot.key;  // UID do utilizador
                const userData = userSnapshot.val();

                // Inicializa o objeto para cada utilizador
                allLies[userId] = {
                    userName: userData.name,  // Nome do utilizador (mentiroso)
                    lies: [],  // Lista de mentiras do utilizador
                    liesCount: 0,  // Contador de mentiras do utilizador
                };

                // Verifica se o utilizador tem mentiras
                if (userData.lies) {
                    // Itera sobre as mentiras desse utilizador e as armazena no array
                    Object.entries(userData.lies).forEach(([lieId, lieData]) => {
                        allLies[userId].lies.push({
                            lie: lieData.lie,  // A mentira
                            timestamp: lieData.timestamp,  // Data da mentira
                        });
                    });

                    // Atualiza o contador de mentiras
                    allLies[userId].liesCount = allLies[userId].lies.length;
                }
            });

            setUsersLies(allLies);  // Atualiza o estado com as mentiras agrupadas
        }
    };

    // Chama a função para buscar as mentiras assim que a página carrega
    useEffect(() => {
        fetchLies();
    }, []);

    // Função para formatar o timestamp para uma data legível
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);

        // Formatar para garantir que o dia, mês, hora e minutos tenham sempre dois dígitos
        const day = String(date.getDate()).padStart(2, '0');  // Ex: '01' em vez de '1'
        const month = String(date.getMonth() + 1).padStart(2, '0');  // Ex: '09' em vez de '9'
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');  // Ex: '08' em vez de '8'
        const minutes = String(date.getMinutes()).padStart(2, '0');  // Ex: '06' em vez de '6'

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };


    const getLieLabel = (count) => {
        return count === 1 ? 'mentira' : 'mentiras';
    };

    // Ordenar os utilizadores por nome
    const sortedUsers = Object.entries(usersLies)
        .sort((a, b) => a[1].userName.localeCompare(b[1].userName));  // Ordena pelo nome do utilizador

    // Função para voltar à página inicial
    const handleBack = () => {
        router.push("/");  // Volta à página inicial
    };

    return (
        <div className={styles.liesPageContainer}>
            <h1>Lista de Mentiras</h1>
            <button className={styles.backButton} onClick={handleBack}>Voltar à Página Inicial</button>
            <div className={styles.liesList}>
                {sortedUsers.length === 0 ? (
                    <p className={styles.noLiesMessage}>Não há mentiras registadas.</p>
                ) : (
                    sortedUsers.map(([userId, userLies], index) => (
                        <div key={userId} className={styles.userLiesContainer}>
                            <h2>{userLies.userName} ({userLies.liesCount} {getLieLabel(userLies.liesCount)})</h2> {/* Nome do utilizador e número de mentiras */}
                            {userLies.lies.length === 0 ? (
                                <p className={styles.noLies}>Este utilizador não tem mentiras registadas.</p>
                            ) : (
                                userLies.lies.map((lie, lieIndex) => (
                                    <div key={lieIndex} className={styles.lieItem}>
                                        <p>{lie.lie}</p> {/* A mentira */}
                                        <small>{formatDate(lie.timestamp)}</small> {/* Data da mentira */}
                                    </div>
                                ))
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LiesPage;
