import { useState } from "react";
import { useNavigate } from "react-router";
import { resolveAuthorPath } from "~/lib/resolveAuthorPath";
import styles from "./SearchBar.module.css";

interface Props {
  initialValue?: string;
  compact?: boolean;
}

export function SearchBar({ initialValue = "", compact = false }: Props) {
  const navigate = useNavigate();
  const [value, setValue] = useState(initialValue);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);
    const result = await resolveAuthorPath(value);
    setLoading(false);
    if (result.ok) {
      navigate(result.path);
    } else if (result.error) {
      setErrorMessage(result.error);
    }
  }

  const containerClass = compact
    ? `${styles.inputContainer} ${styles.inputContainerCompact}`
    : styles.inputContainer;

  const inputClass = [
    styles.input,
    compact && styles.inputCompact,
    errorMessage && styles.inputError,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={containerClass}>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (errorMessage) setErrorMessage("");
          }}
          placeholder="alice.bsky.social"
          className={inputClass}
          autoFocus={!compact}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          disabled={loading}
        />
        {errorMessage && (
          <p className={styles.errorMessage}>{errorMessage}</p>
        )}
      </div>
    </form>
  );
}
