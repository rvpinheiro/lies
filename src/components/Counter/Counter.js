'use client';

import { useState, useEffect } from "react";
import { database, ref, set, get } from "@/firebase/firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from 'next/navigation';
import styles from './Counter.module.css';
import Button from "../Button/Button";
import Form from "../Form/Form";

const Counter = () => {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [maxTimeWithoutLie, setMaxTimeWithoutLie] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [monthlyLiars, setMonthlyLiars] = useState([]);
    const [monthName, setMonthName] = useState("");
    const router = useRouter();

    useEffect(() => {
        const counterRef = ref(database, 'counter/time');
        const maxTimeRef = ref(database, 'counter/maxTimeWithoutLie');
        const usersRef = ref(database, 'users');
        const auth = getAuth();

        onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
            }
        });

        // Buscar o tempo desde o início
        get(counterRef).then((snapshot) => {
            if (snapshot.exists()) {
                const savedStartTime = new Date(snapshot.val());
                setStartTime(savedStartTime);
                setElapsedTime(Math.floor((new Date() - savedStartTime) / 1000));
            } else {
                const now = new Date();
                setStartTime(now);
                setElapsedTime(0);
                set(counterRef, now.getTime());
            }
        });

        // Buscar o tempo máximo sem mentiras
        get(maxTimeRef).then((snapshot) => {
            if (snapshot.exists()) {
                setMaxTimeWithoutLie(snapshot.val());
            }
        });

        // Calcular os mentirosos do mês
        get(usersRef).then((snapshot) => {
            if (snapshot.exists()) {
                const users = snapshot.val();
                let liarsOfTheMonth = [];
                let maxLiesCount = 0;

                const currentDate = new Date();
                const currentMonth = currentDate.getMonth();
                const currentYear = currentDate.getFullYear();
                const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
                const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

                // Lista dos meses
                const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

                setMonthName(months[lastMonth]);

                Object.values(users).forEach(user => {
                    let count = 0;

                    Object.values(user.lies || {}).forEach(lie => {
                        const lieDate = new Date(lie.timestamp);
                        const lieMonth = lieDate.getMonth();
                        const lieYear = lieDate.getFullYear();

                        if (lieMonth === lastMonth && lieYear === lastMonthYear) {
                            count++;
                        }
                    });

                    if (count > maxLiesCount) {
                        liarsOfTheMonth = [{ name: user.name, count }];
                        maxLiesCount = count;
                    } else if (count === maxLiesCount && count > 0) {
                        liarsOfTheMonth.push({ name: user.name, count });
                    }
                });

                setMonthlyLiars(liarsOfTheMonth);
            }
        });
    }, []);

    useEffect(() => {
        if (!startTime) return;

        const interval = setInterval(() => {
            setElapsedTime(Math.floor((new Date() - startTime) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    const handleStart = () => {
        const now = new Date();
        setStartTime(now);
        setElapsedTime(0);
        set(ref(database, 'counter/time'), now.getTime());
    };

    const formatTime = (seconds) => {
        const days = Math.floor(seconds / (24 * 3600));
        const hours = Math.floor((seconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${days}d ${hours}h ${minutes}m ${secs}s`;
    };

    const toggleForm = () => {
        setShowForm((prev) => !prev);
    };

    const updateMaxTimeWithoutLie = (newTime) => {
        const maxTimeRef = ref(database, 'counter/maxTimeWithoutLie');

        if (newTime > maxTimeWithoutLie) {
            set(maxTimeRef, newTime);
            setMaxTimeWithoutLie(newTime);
        }
    };

    const handleFormSubmit = () => {
        const now = new Date();
        const timeWithoutLie = Math.floor((now - startTime) / 1000);

        updateMaxTimeWithoutLie(timeWithoutLie);

        const counterRef = ref(database, 'counter/time');
        set(counterRef, now.getTime());

        setStartTime(now);
        setElapsedTime(0);
    };

    const goToLiesPage = () => {
        router.push('/alllies');
    };

    return (
        <div className={styles.container}>
            <div className={styles.counterText}>
                <p>Ultras primos sem mentiras há:</p>
            </div>
            <h1 className={styles.counterTime}>{formatTime(elapsedTime)}</h1>
            <div className={styles.maxTimeText}>
                <p>Tempo máximo sem mentiras:</p>
                <h2>{formatTime(maxTimeWithoutLie)}</h2>
            </div>

            <div className={styles.monthlyLiar}>
                {monthlyLiars.length > 0 ? (
                    <>
                        <p className={styles.lierMouthTitle}>Mentiroso{monthlyLiars.length > 1 ? "s" : ""} do mês de {monthName}:</p>
                        <p>
                            {monthlyLiars.map((liar, index) => (
                                <span key={index}>
                                    <span className={styles.liarName}>{liar.name}, com {liar.count} mentira{liar.count !== 1 ? "s" : ""}.</span>
                                    {index < monthlyLiars.length - 1 ? " e " : ""}
                                </span>
                            ))}
                        </p>
                    </>
                ) : (
                    <>
                        <p>Mentiroso do mês de {monthName}:</p>
                        <p>Ainda sem vencedor.</p>
                    </>
                )}
            </div>

            <div className={styles.buttonContainer}>
                {isLoggedIn && !showForm && (
                    <Button text="Inserir mentira" onClick={toggleForm} />
                )}
                <Button text="Ver todas as mentiras" onClick={goToLiesPage} />
            </div>
            {showForm && <Form onClose={toggleForm} onSubmit={handleFormSubmit} />}
        </div>
    );
};

export default Counter;
