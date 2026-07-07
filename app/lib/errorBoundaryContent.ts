import { isRouteErrorResponse } from "react-router";

export interface ErrorBoundaryContent {
  message: string;
  details: string;
  stack?: string;
}

// Pure decision logic behind root.tsx's ErrorBoundary, extracted so it's
// testable without a DOM (this repo's vitest config runs in "node", not
// jsdom). `isDev` is passed in rather than read from import.meta.env so the
// function has no build-time dependency.
export function errorBoundaryContent(error: unknown, isDev: boolean): ErrorBoundaryContent {
  let message = "Error";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (isDev && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return { message, details, stack };
}
