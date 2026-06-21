import { useState } from "react";
import { useNavigate } from "react-router";
import { parseAuthorInput } from "~/lib/parseAuthorInput";
import styles from "./home.module.css";
import SvgIcon, { SvgImageList } from "~/components/SvgIcon/SvgIcon";

export function meta() {
  return [{ title: "Scribe Reader" }];
}

export default function Home() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = parseAuthorInput(value);
    if (trimmed) navigate(`/${trimmed}`);
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        {/* <h1 className={styles.title}>Scribe Reader</h1> */}
        <div className={styles.readerLogoContainer}>
          <SvgIcon name={SvgImageList.ScribeReaderLogo} />
        </div>
        <p className={styles.subtitle}>Browse any Scribe author's content</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="alice.bsky.social"
            className={styles.input}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </form>
        <p className={styles.hint}>
          Paste a handle, DID, or <code>at://</code> URI — press Enter to browse
        </p>
      </div>
    </main>
  );
}
