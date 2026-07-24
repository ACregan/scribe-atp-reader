import { isRouteErrorResponse } from "react-router";
import { NotFoundError, PdsUnreachableError, PdsFetchError } from "@scribe-atp/core";

export interface ErrorBoundaryContent {
  message: string;
  details: string;
  stack?: string;
  canRetry: boolean;
}

const NOT_FOUND_DETAILS = "The requested page could not be found.";
const SERVICE_DOWN_DETAILS =
  "The AT Protocol network isn't responding right now. This is usually temporary — try again shortly.";
const COULD_NOT_LOAD_DETAILS =
  "There was a problem retrieving this content. This is often temporary — try again.";
const UNEXPECTED_ERROR_DETAILS =
  "Something went wrong reading from the AT Protocol network. This is often temporary — try again.";

// Pure decision logic behind root.tsx's ErrorBoundary, extracted so it's
// testable without a DOM (this repo's vitest config runs in "node", not
// jsdom). `isDev` is passed in rather than read from import.meta.env so the
// function has no build-time dependency.
//
// Most requests never reach this at all — loaders retry transient PDS
// failures automatically (see pdsRetry.server.ts) before ever throwing. By
// the time an error lands here, retries are already exhausted, so this is
// about telling three states apart for the reader:
//   - genuinely doesn't exist (404 / NotFoundError) — retrying won't help
//   - the PDS is unreachable entirely (PdsUnreachableError) — likely a
//     broader outage, not just this one page
//   - the PDS responded but errored, or anything else unexpected
//     (PdsFetchError / generic) — probably transient, worth a plain retry
export function errorBoundaryContent(error: unknown, isDev: boolean): ErrorBoundaryContent {
  let message = "Error";
  let details = UNEXPECTED_ERROR_DETAILS;
  let stack: string | undefined;
  let canRetry = true;

  if (isRouteErrorResponse(error)) {
    const isNotFound = error.status === 404;
    message = isNotFound ? "404" : "Error";
    details = isNotFound ? NOT_FOUND_DETAILS : error.statusText || details;
    canRetry = !isNotFound;
  } else if (error instanceof NotFoundError) {
    message = "404";
    details = NOT_FOUND_DETAILS;
    canRetry = false;
  } else if (error instanceof PdsUnreachableError) {
    message = "Service unavailable";
    details = SERVICE_DOWN_DETAILS;
  } else if (error instanceof PdsFetchError) {
    message = "Couldn't load that";
    details = COULD_NOT_LOAD_DETAILS;
  } else if (isDev && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return { message, details, stack, canRetry };
}
