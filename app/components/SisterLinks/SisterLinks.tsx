import { Link } from "react-router";
import styles from "./SisterLinks.module.css";

const SisterLinks = () => {
  return (
    <>
      <Link
        className={styles.link}
        to={`https://scribe-cms.app/`}
        target="_blank"
      >
        <span>CMS</span>
      </Link>
      <Link
        className={styles.link}
        to={`https://docs.scribe-atp.app/`}
        target="_blank"
      >
        <span>Docs</span>
      </Link>
      <Link
        className={styles.link}
        to={`https://www.npmjs.com/org/scribe-atp`}
        target="_blank"
      >
        <span>SDK</span>
      </Link>
    </>
  );
};

export default SisterLinks;
