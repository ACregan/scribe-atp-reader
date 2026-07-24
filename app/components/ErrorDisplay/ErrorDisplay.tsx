import { useRevalidator } from "react-router";
import type { ErrorBoundaryContent } from "~/lib/errorBoundaryContent";
import styles from "./ErrorDisplay.module.css";

// Shared presentational piece behind both root.tsx's route-level
// ErrorBoundary and AwaitErrorBoundary (used per-route for streamed
// <Await> rejections) — same look, same retry affordance, wherever the
// error surfaced from.
export function ErrorDisplay({ message, details, stack, canRetry }: ErrorBoundaryContent) {
  const revalidator = useRevalidator();
  const isRetrying = revalidator.state === "loading";

  return (
    <main className={styles.error}>
      <h1 className={styles.title}>{message}</h1>
      <p className={styles.message}>{details}</p>
      {stack && (
        <pre className={styles.stack}>
          <code>{stack}</code>
        </pre>
      )}
      <div className={styles.actions}>
        {canRetry && (
          <button
            type="button"
            className={styles.retryButton}
            disabled={isRetrying}
            onClick={() => revalidator.revalidate()}
          >
            {isRetrying ? "Retrying…" : "Retry"}
          </button>
        )}
        <a href="/" className={styles.link}>
          Return to search
        </a>
      </div>
    </main>
  );
}
