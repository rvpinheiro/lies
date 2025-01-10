'use client'

import { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy } from '@fortawesome/free-solid-svg-icons';
import styles from './Ranking.module.css';

const Ranking = () => {
    const [ranking, setRanking] = useState([]);

    useEffect(() => {
        const db = getDatabase();
        const usersRef = ref(db, "users");  // Escutar o nó de utilizadores

        const updateRanking = (usersSnapshot) => {
            const liarCounts = [];
            usersSnapshot.forEach((userSnapshot) => {
                const userData = userSnapshot.val();
                const liar = userData.name;
                const liesCount = userData.liesCount || 0;  // Pega a contagem de mentiras (se existir)
                liarCounts.push({ liar, count: liesCount });
            });

            // Ordenar pelo número de mentiras de forma decrescente
            const sortedLiarCounts = liarCounts.sort((a, b) => b.count - a.count);
            setRanking(sortedLiarCounts);
        };

        // Escutar mudanças no nó de utilizadores
        onValue(usersRef, updateRanking);

        return () => {
            // Clean up listeners
        };
    }, []);

    // Encontra o número máximo de mentiras
    const maxLies = ranking.length > 0 ? ranking[0].count : 0;

    return (
        <div className={styles.rankingContainer}>
            <div className={styles.title}>Ranking de Mentirosos</div>
            <ul className={styles.rankingList}>
                {ranking.map((item, index) => (
                    <li
                        key={index}
                        className={`${styles.rankingItem} ${item.count === maxLies ? styles.firstPlace : ''}`}
                    >
                        {/* Mostrar a taça para todos os que tiverem o maior número de mentiras */}
                        {item.count === maxLies && (
                            <FontAwesomeIcon icon={faTrophy} className={styles.trophy} />
                        )}
                        <span className={styles.position}>{index + 1}</span>
                        <span className={styles.name}>{item.liar}</span>
                        <span className={styles.count}>
                            {item.count} {item.count === 1 ? 'mentira' : 'mentiras'}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Ranking;
