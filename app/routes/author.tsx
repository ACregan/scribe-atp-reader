import { Link, Outlet } from "react-router";
import type { Route } from "./+types/author";
import styles from "./author.module.css";

export default function AuthorLayout({ params }: Route.ComponentProps) {
  return (
    <>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>← Scribe Reader</Link>
        <span className={styles.handle}>{params.author}</span>
      </header>
      <Outlet />
    </>
  );
}
