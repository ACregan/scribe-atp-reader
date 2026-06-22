import { useState } from "react";
import { useNavigate } from "react-router";
import { parseAuthorInput } from "~/lib/parseAuthorInput";
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
    const trimmed = parseAuthorInput(value);
    if (!trimmed) return;

    setErrorMessage("");

    // Extract just the handle/DID — a full at:// URI may include a collection path
    const authorPart = trimmed.split("/")[0];

    // DIDs are already resolved identifiers — navigate directly
    if (authorPart.startsWith("did:")) {
      navigate(`/${trimmed}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(authorPart)}`
      );
      if (res.status === 400 || res.status === 404) {
        setErrorMessage(`No AT Protocol account found for "${authorPart}"`);
        return;
      }
      if (!res.ok) {
        setErrorMessage("AT Protocol returned an unexpected error. Try again.");
        return;
      }
      navigate(`/${trimmed}`);
    } catch {
      setErrorMessage("Unable to reach the AT Protocol network. Check your connection.");
    } finally {
      setLoading(false);
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
