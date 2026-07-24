import { describe, it, expect } from "vitest";
import { errorBoundaryContent } from "./errorBoundaryContent";
import { NotFoundError, PdsFetchError, PdsUnreachableError } from "@scribe-atp/core";

// isRouteErrorResponse duck-types on { status, statusText, internal, data }
// rather than an instanceof check, so a plain object matching that shape
// stands in for the ErrorResponseImpl the router constructs internally when
// a route throws a Response.
function routeErrorResponse(status: number, statusText = "") {
  return { status, statusText, internal: false, data: null };
}

const UNEXPECTED_ERROR_DETAILS =
  "Something went wrong reading from the AT Protocol network. This is often temporary — try again.";

describe("errorBoundaryContent", () => {
  it("shows a 404 message for a 404 route error response, with no retry", () => {
    const error = routeErrorResponse(404);
    expect(errorBoundaryContent(error, false)).toEqual({
      message: "404",
      details: "The requested page could not be found.",
      stack: undefined,
      canRetry: false,
    });
  });

  it("uses the response's statusText for a non-404 route error response, and allows retry", () => {
    const error = routeErrorResponse(500, "Internal Server Error");
    expect(errorBoundaryContent(error, false)).toEqual({
      message: "Error",
      details: "Internal Server Error",
      stack: undefined,
      canRetry: true,
    });
  });

  it("falls back to a generic message when a non-404 route error has no statusText", () => {
    const error = routeErrorResponse(500);
    expect(errorBoundaryContent(error, false).details).toBe(UNEXPECTED_ERROR_DETAILS);
  });

  it("exposes the error message and stack for a plain Error in dev, and allows retry", () => {
    const error = new Error("something broke");
    const result = errorBoundaryContent(error, true);
    expect(result.message).toBe("Error");
    expect(result.details).toBe("something broke");
    expect(result.stack).toBe(error.stack);
    expect(result.canRetry).toBe(true);
  });

  it("hides the error message and stack for a plain Error outside dev", () => {
    const error = new Error("something broke");
    const result = errorBoundaryContent(error, false);
    expect(result.details).toBe(UNEXPECTED_ERROR_DETAILS);
    expect(result.stack).toBeUndefined();
    expect(result.canRetry).toBe(true);
  });

  it("falls back to a generic message for a non-Error, non-route-response throw, and allows retry", () => {
    expect(errorBoundaryContent("boom", true)).toEqual({
      message: "Error",
      details: UNEXPECTED_ERROR_DETAILS,
      stack: undefined,
      canRetry: true,
    });
  });

  it("shows a 404 message for a NotFoundError, with no retry, even in dev", () => {
    const error = new NotFoundError("Article not found: x");
    expect(errorBoundaryContent(error, true)).toEqual({
      message: "404",
      details: "The requested page could not be found.",
      stack: undefined,
      canRetry: false,
    });
  });

  it("shows a service-unavailable message for a PdsUnreachableError, and allows retry", () => {
    const error = new PdsUnreachableError("Could not reach PDS: https://example.com");
    const result = errorBoundaryContent(error, false);
    expect(result.message).toBe("Service unavailable");
    expect(result.canRetry).toBe(true);
    expect(result.stack).toBeUndefined();
  });

  it("shows a couldn't-load message for a PdsFetchError, and allows retry", () => {
    const error = new PdsFetchError("Failed to fetch article: 500");
    const result = errorBoundaryContent(error, false);
    expect(result.message).toBe("Couldn't load that");
    expect(result.canRetry).toBe(true);
    expect(result.stack).toBeUndefined();
  });

  it("classifies a PdsUnreachableError as service-unavailable, not couldn't-load, since it extends PdsFetchError", () => {
    const error = new PdsUnreachableError("Could not reach PDS: https://example.com");
    expect(errorBoundaryContent(error, false).message).toBe("Service unavailable");
  });
});
