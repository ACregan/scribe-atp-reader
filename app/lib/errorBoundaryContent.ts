import { isRouteErrorResponse } from "react-router";

export interface ErrorBoundaryContent {
  message: string;
  details: string;
  stack?: string;
  canRetry: boolean;
}

const UNEXPECTED_ERROR_DETAILS =
  "Something went wrong reading from the AT Protocol network. This is often temporary — try again.";

// Pure decision logic behind root.tsx's ErrorBoundary, extracted so it's
// testable without a DOM (this repo's vitest config runs in "node", not
// jsdom). `isDev` is passed in rather than read from import.meta.env so the
// function has no build-time dependency.
//
// canRetry is false only for a genuine 404 — retrying won't make a missing
// record appear. Every other error (a non-404 route response, a network
// failure, an unexpected exception) is treated as a possibly-transient PDS
// read failure, since that's the dominant real-world cause here.
export function errorBoundaryContent(error: unknown, isDev: boolean): ErrorBoundaryContent {
  let message = "Error";
  let details = UNEXPECTED_ERROR_DETAILS;
  let stack: string | undefined;
  let canRetry = true;

  if (isRouteErrorResponse(error)) {
    const isNotFound = error.status === 404;
    message = isNotFound ? "404" : "Error";
    details = isNotFound
      ? "The requested page could not be found."
      : error.statusText || details;
    canRetry = !isNotFound;
  } else if (isDev && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return { message, details, stack, canRetry };
}
