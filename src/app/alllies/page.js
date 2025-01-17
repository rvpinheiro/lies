'use client'

import { useState, useEffect } from "react";
import { ref, get, update } from "firebase/database";
import { database } from "@/firebase/firebaseConfig";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import styles from './page.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons';

const LiesPage = () => {
    const [usersLies, setUsersLies] = useState({});
    const [authUsersCount, setAuthUsersCount] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    const [pendingDislike, setPendingDislike] = useState(null);
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const router = useRouter();

    const fetchLies = async () => {
        const usersRef = ref(database, 'users');
        const authUsersRef = ref(database, 'authUsersCount');

        try {
            const [usersSnapshot, authUsersSnapshot] = await Promise.all([
                get(usersRef),
                get(authUsersRef)
            ]);

            if (authUsersSnapshot.exists()) {
                setAuthUsersCount(authUsersSnapshot.val());
            }

            if (usersSnapshot.exists()) {
                const allLies = {};

                usersSnapshot.forEach((userSnapshot) => {
                    const userId = userSnapshot.key;
                    const userData = userSnapshot.val();

                    allLies[userId] = {
                        userName: userData.name,
                        lies: [],
                        liesCount: 0,
                    };

                    if (userData.lies) {
                        Object.entries(userData.lies).forEach(([lieId, lieData]) => {
                            const dislikesCount = lieData.dislikes
                                ? Object.keys(lieData.dislikes).length
                                : 0;

                            allLies[userId].lies.push({
                                lieId,
                                lie: lieData.lie,
                                timestamp: lieData.timestamp,
                                dislikes: lieData.dislikes || {},
                                dislikesCount,
                            });
                        });

                        allLies[userId].lies.sort((a, b) => b.timestamp - a.timestamp);
                        allLies[userId].liesCount = allLies[userId].lies.length;
                    }
                });

                setUsersLies(allLies);
            }
        } catch (error) {
            console.error("Erro ao buscar mentiras:", error);
        }
    };

    const handleDislike = async (userId, lieId) => {
        if (!currentUser) {
            alert("Tem de estar autenticado para votar!");
            return;
        }

        const uid = currentUser.uid;
        const lieRef = ref(database, `users/${userId}/lies/${lieId}/dislikes`);

        try {
            const snapshot = await get(lieRef);
            const dislikes = snapshot.val() || {};
            const isFinalVote = Object.keys(dislikes).length + 1 >= Math.floor(authUsersCount / 2) + 1;

            if (dislikes[uid]) {
                delete dislikes[uid];
                await update(ref(database), {
                    [`users/${userId}/lies/${lieId}/dislikes`]: dislikes
                });
                fetchLies();
            } else {
                if (isFinalVote) {
                    setPendingDislike({ userId, lieId });
                    setShowPopup(true);
                } else {
                    dislikes[uid] = true;
                    await update(ref(database), {
                        [`users/${userId}/lies/${lieId}/dislikes`]: dislikes
                    });
                    fetchLies();
                }
            }
        } catch (error) {
            console.error("Erro ao atualizar dislikes:", error);
        }
    };

    const confirmDislike = async () => {
        if (pendingDislike) {
            const { userId, lieId } = pendingDislike;
            const uid = currentUser.uid;
            const lieRef = ref(database, `users/${userId}/lies/${lieId}`);
            const dislikesRef = ref(database, `users/${userId}/lies/${lieId}/dislikes`);
            const userRef = ref(database, `users/${userId}`);

            try {
                const snapshot = await get(dislikesRef);
                const dislikes = snapshot.val() || {};

                dislikes[uid] = true;

                const totalDislikes = Object.keys(dislikes).length;
                const requiredVotes = Math.floor(authUsersCount / 2) + 1;
                if (totalDislikes >= requiredVotes) {
                    const userSnapshot = await get(userRef);
                    if (userSnapshot.exists()) {
                        const userData = userSnapshot.val();
                        const updatedLiesCount = userData.liesCount > 0 ? userData.liesCount - 1 : 0;
                        await update(ref(database), {
                            [`users/${userId}/lies/${lieId}`]: null,
                            [`users/${userId}/liesCount`]: updatedLiesCount,
                        });
                    }
                } else {
                    await update(ref(database), {
                        [`users/${userId}/lies/${lieId}/dislikes`]: dislikes,
                    });
                }

                fetchLies();
                setShowPopup(false);
                setPendingDislike(null);
            } catch (error) {
                console.error("Erro ao confirmar dislike:", error);
            }
        }
    };

    const cancelDislike = () => {
        setShowPopup(false);
        setPendingDislike(null);
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const getLieLabel = (count) => (count === 1 ? 'mentira' : 'mentiras');

    useEffect(() => {
        fetchLies();
    }, []);

    const handleBack = () => {
        router.push("/");
    };

    const sortedUsers = Object.entries(usersLies)
        .sort((a, b) => a[1].userName.localeCompare(b[1].userName));

    return (
        <div className={styles.liesPageContainer}>
            <h1>Lista de Mentiras</h1>
            <button className={styles.backButton} onClick={handleBack}>
                Voltar à Página Inicial
            </button>
            <div className={styles.liesList}>
                {sortedUsers.length === 0 ? (
                    <p className={styles.noLiesMessage}>Não há mentiras registadas.</p>
                ) : (
                    sortedUsers.map(([userId, userLies]) => (
                        <div key={userId} className={styles.userLiesContainer}>
                            <h2>
                                {userLies.userName} ({userLies.liesCount} {getLieLabel(userLies.liesCount)})
                            </h2>
                            {userLies.lies.length === 0 ? (
                                <p className={styles.noLies}>Sem mentiras registadas.</p>
                            ) : (
                                userLies.lies.map((lie, lieIndex) => {
                                    const requiredVotes = Math.floor(authUsersCount / 2) + 1;
                                    const hasDisliked = lie.dislikes[currentUser?.uid];

                                    return (
                                        <div key={lieIndex} className={styles.lieItem}>
                                            <p>{lie.lie}</p>
                                            <small>{formatDate(lie.timestamp)}</small>
                                            {currentUser && (
                                                <div className={styles.dislikes}>
                                                    <p>
                                                        {lie.dislikesCount}/<strong>{requiredVotes}</strong>
                                                    </p>
                                                    <button
                                                        className={styles.dislikeButton}
                                                        onClick={() => handleDislike(userId, lie.lieId)}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faThumbsDown}
                                                            className={hasDisliked ? styles.dislikedIcon : ''}
                                                        />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ))
                )}
            </div>

            {showPopup && (
                <>
                    <div className={styles.popupOverlay} onClick={cancelDislike}></div>
                    <div className={styles.popup}>
                        <p>És o voto final para esta mentira ser eliminada. Tens a certeza?</p>
                        <div className={styles.popupButtons}>
                            <button onClick={confirmDislike}>Sim</button>
                            <button onClick={cancelDislike}>Não</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LiesPage;
