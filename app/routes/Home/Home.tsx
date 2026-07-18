import styles from "./Home.module.css";
import SvgIcon, { SvgImageList } from "~/components/SvgIcon/SvgIcon";
import { SearchBar } from "~/components/SearchBar/SearchBar";
import { Link } from "react-router";
import SisterLinks from "~/components/SisterLinks/SisterLinks";

export function meta() {
  return [{ title: "Scribe Reader" }];
}

export default function Home() {
  return (
    <main className={styles.page}>
      <div className={styles.linksContainer}>
        <SisterLinks />
      </div>
      <div className={styles.inner}>
        <div className={styles.readerLogoContainer}>
          <SvgIcon name={SvgImageList.ScribeReaderLogo} />
        </div>
        <p className={styles.subtitle}>Browse any Scribe author's content</p>
        <SearchBar />
        <p className={styles.hint}>
          Paste a handle, DID, or <code>at://</code> URI — press Enter to browse
        </p>
      </div>
    </main>
  );
}
