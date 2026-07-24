import { useAsyncError } from "react-router";
import { errorBoundaryContent } from "~/lib/errorBoundaryContent";
import { ErrorDisplay } from "~/components/ErrorDisplay/ErrorDisplay";

// Used as every route's <Await errorElement>. React Router's streaming SSR
// doesn't reliably propagate a rejected <Await> promise up to an ancestor
// route's ErrorBoundary across route segments (confirmed live: it produces
// a bare sanitized 500 instead of reaching root.tsx's ErrorBoundary) — so
// each route needs its own errorElement rather than relying on bubbling.
export function AwaitErrorBoundary() {
  const error = useAsyncError();
  const content = errorBoundaryContent(error, import.meta.env.DEV);
  return <ErrorDisplay {...content} />;
}
