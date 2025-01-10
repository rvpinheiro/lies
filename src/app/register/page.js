'use client'

import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { useRouter } from "next/navigation";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState(""); // Campo para o nome
    const router = useRouter();

    const handleRegister = (e) => {
        e.preventDefault();
        const auth = getAuth();

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;

                // Após criar o utilizador, guardar o nome na base de dados
                const db = getDatabase();
                set(ref(db, 'users/' + user.uid), {
                    name: name,
                    email: email
                });

                router.push("/"); // Redirecionar para login após o registo
            })
            .catch((error) => {
                console.error("Erro ao registar:", error.message);
            });
    };

    return (
        <div>
            <h2>Registar</h2>
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Registar</button>
            </form>
        </div>
    );
};

export default Register;
