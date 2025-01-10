import { useState } from "react";
import { database, ref, set } from "@/firebase/firebaseConfig";
import styles from './Form.module.css';
import Button from "../Button/Button";

const Form = ({ onClose, onSubmit }) => {
    const [liar, setLiar] = useState("");
    const [lie, setLie] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (liar && lie) {
            const formRef = ref(database, "lies/" + Date.now());
            set(formRef, {
                liar: liar,
                lie: lie,
                timestamp: Date.now(),
            });

            setLiar("");
            setLie("");
            onSubmit();  // Chama a função para resetar o contador
            onClose();   // Fecha o formulário
        }
    };

    return (
        <>
            {/* Adicionando a sobreposição */}
            <div className={styles.overlay} onClick={onClose}></div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                    <label htmlFor="liar" className={styles.label}>Escolha o mentiroso:</label>
                    <select
                        id="liar"
                        value={liar}
                        onChange={(e) => setLiar(e.target.value)}
                        required
                        className={styles.input}
                    >
                        <option value="">Selecione um nome</option>
                        <option value="João">João</option>
                        <option value="Maria">Maria</option>
                        <option value="Pedro">Pedro</option>
                        <option value="Ana">Ana</option>
                    </select>
                </div>
                <div className={styles.field}>
                    <label htmlFor="lie" className={styles.label}>Insira a mentira:</label>
                    <textarea
                        id="lie"
                        value={lie}
                        onChange={(e) => setLie(e.target.value)}
                        required
                        className={styles.input}
                    />
                </div>
                <div className={styles.buttons}>
                    <Button text="Enviar" />
                    <Button text="Fechar" onClick={onClose} />
                </div>
            </form>
        </>
    );
};

export default Form;
