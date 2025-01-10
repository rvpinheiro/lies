import styles from "./page.module.css";
import { Roboto } from 'next/font/google';
import Counter from "@/components/Counter/Counter";
import Ranking from "@/components/Ranking/Ranking";
import Header from "@/components/Header/Header";

const roboto = Roboto({
  weight: '400',
  subsets: ['latin'],
});

export default function Home() {
  return (
    <div className={`${styles.container} ${roboto.className}`}>
      <div>
        <Header />
        <Counter />
        <Ranking />
      </div>
    </div>
  );
}
