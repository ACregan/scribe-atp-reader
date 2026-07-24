import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

import { errorBoundaryContent } from "~/lib/errorBoundaryContent";
import { ErrorDisplay } from "~/components/ErrorDisplay/ErrorDisplay";
import type { Route } from "./+types/root";
import "./app.css";

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
  const content = errorBoundaryContent(error, import.meta.env.DEV);
  return <ErrorDisplay {...content} />;
}
