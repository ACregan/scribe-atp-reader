import { Link, Outlet } from "react-router";
import type { Route } from "./+types/author";
import styles from "./author.module.css";
import SvgIcon, { SvgImageList } from "~/components/SvgIcon/SvgIcon";

export default function AuthorLayout({ params }: Route.ComponentProps) {
  return (
    <>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>
          <div className={styles.backIconContainer}>
            <SvgIcon name={SvgImageList.ArrowLeft} />
            <SvgIcon name={SvgImageList.ScribeReaderLogo} />
          </div>
        </Link>
        <span className={styles.handle}>{params.author}</span>
      </header>
      <Outlet />
    </>
  );
}
