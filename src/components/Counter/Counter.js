'use client';

import { useState, useEffect } from "react";
import { database, ref, set, get } from "@/firebase/firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import styles from './Counter.module.css'
import Button from "../Button/Button";
import Form from "../Form/Form";

const Counter = () => {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [maxTimeWithoutLie, setMaxTimeWithoutLie] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const counterRef = ref(database, 'counter/time');
        const maxTimeRef = ref(database, 'counter/maxTimeWithoutLie');
        const auth = getAuth();

        onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
            }
        });

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

        get(maxTimeRef).then((snapshot) => {
            if (snapshot.exists()) {
                setMaxTimeWithoutLie(snapshot.val());
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
            <div className={styles.buttonContainer}>
                {isLoggedIn && !showForm && (
                    <Button text="Inserir mentira" onClick={toggleForm} />
                )}
            </div>
            {showForm && <Form onClose={toggleForm} onSubmit={handleFormSubmit} />}
        </div>
    );
};

export default Counter;
