import { Link, Outlet } from "react-router";
import type { Route } from "./+types/author";
import styles from "./author.module.css";
import SvgIcon, { SvgImageList } from "~/components/SvgIcon/SvgIcon";
import { SearchBar } from "~/components/SearchBar/SearchBar";
import SisterLinks from "~/components/SisterLinks/SisterLinks";

export default function AuthorLayout({ params }: Route.ComponentProps) {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.iconColumn}>
          <Link to="/" className={styles.back}>
            <SvgIcon
              className={styles.scribeReaderIcon}
              name={SvgImageList.ScribeReaderLogo}
            />
          </Link>
          <div className={styles.linksContainer}>
            <SisterLinks />
          </div>
        </div>
        <div className={styles.searchColumn}>
          <SearchBar key={params.author} initialValue={params.author} />
        </div>
        <div className={styles.rightColumn}></div>
      </header>
      <Outlet />
    </>
  );
}
