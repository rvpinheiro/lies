'use client'

import { useState, useEffect } from "react";
import { getDatabase, ref, onChildAdded, onChildChanged } from "firebase/database";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy } from '@fortawesome/free-solid-svg-icons';
import styles from './Ranking.module.css';

const Ranking = () => {
    const [ranking, setRanking] = useState([]);

    useEffect(() => {
        const liarCounts = {};

        const db = getDatabase();
        const liesRef = ref(db, "lies");

        const handleNewLie = (snapshot) => {
            const lie = snapshot.val();
            if (lie && lie.liar) {
                liarCounts[lie.liar] = (liarCounts[lie.liar] || 0) + 1;
                updateRanking();
            }
        };

        const handleUpdatedLie = (snapshot) => {
            const lie = snapshot.val();
            if (lie && lie.liar) {
                liarCounts[lie.liar] = (liarCounts[lie.liar] || 0) + 1;
                updateRanking();
            }
        };

        const updateRanking = () => {
            const sortedLiarCounts = Object.entries(liarCounts)
                .map(([liar, count]) => ({ liar, count }))
                .sort((a, b) => b.count - a.count);

            setRanking(sortedLiarCounts);
        };

        onChildAdded(liesRef, handleNewLie);
        onChildChanged(liesRef, handleUpdatedLie);

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
