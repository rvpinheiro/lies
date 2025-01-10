'use client'

import { useState, useEffect } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { database } from "@/firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import styles from './page.module.css';

const LiesPage = () => {
    const [usersLies, setUsersLies] = useState({});
    const router = useRouter();

    const fetchLies = async () => {
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
            const allLies = {};

            snapshot.forEach((userSnapshot) => {
                const userId = userSnapshot.key;
                const userData = userSnapshot.val();

                allLies[userId] = {
                    userName: userData.name,
                    lies: [],
                    liesCount: 0,
                };

                if (userData.lies) {
                    Object.entries(userData.lies).forEach(([lieId, lieData]) => {
                        allLies[userId].lies.push({
                            lie: lieData.lie,
                            timestamp: lieData.timestamp,
                        });
                    });

                    allLies[userId].liesCount = allLies[userId].lies.length;
                }
            });

            setUsersLies(allLies);
        }
    };

    useEffect(() => {
        fetchLies();
    }, []);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };


    const getLieLabel = (count) => {
        return count === 1 ? 'mentira' : 'mentiras';
    };

    const sortedUsers = Object.entries(usersLies)
        .sort((a, b) => a[1].userName.localeCompare(b[1].userName));

    const handleBack = () => {
        router.push("/");
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
                                <p className={styles.noLies}>Sem mentiras registadas.</p>
                            ) : (
                                userLies.lies.map((lie, lieIndex) => (
                                    <div key={lieIndex} className={styles.lieItem}>
                                        <p>{lie.lie}</p>
                                        <small>{formatDate(lie.timestamp)}</small>
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
