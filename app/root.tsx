import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRevalidator } from "react-router";

import { errorBoundaryContent } from "~/lib/errorBoundaryContent";
import type { Route } from "./+types/root";
import "./app.css";
import styles from "./root.module.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          defer
          src="https://analytics.perpetualsummer.ltd/script.js"
          data-website-id="e2980095-6518-43a3-8db9-513952f2a37b"
        ></script>
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const { message, details, stack, canRetry } = errorBoundaryContent(error, import.meta.env.DEV);
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
