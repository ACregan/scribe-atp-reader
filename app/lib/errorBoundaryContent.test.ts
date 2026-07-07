import { describe, it, expect } from "vitest";
import { errorBoundaryContent } from "./errorBoundaryContent";

// isRouteErrorResponse duck-types on { status, statusText, internal, data }
// rather than an instanceof check, so a plain object matching that shape
// stands in for the ErrorResponseImpl the router constructs internally when
// a route throws a Response.
function routeErrorResponse(status: number, statusText = "") {
  return { status, statusText, internal: false, data: null };
}

describe("errorBoundaryContent", () => {
  it("shows a 404 message for a 404 route error response", () => {
    const error = routeErrorResponse(404);
    expect(errorBoundaryContent(error, false)).toEqual({
      message: "404",
      details: "The requested page could not be found.",
      stack: undefined,
    });
  });

  it("uses the response's statusText for a non-404 route error response", () => {
    const error = routeErrorResponse(500, "Internal Server Error");
    expect(errorBoundaryContent(error, false)).toEqual({
      message: "Error",
      details: "Internal Server Error",
      stack: undefined,
    });
  });

  it("falls back to a generic message when a non-404 route error has no statusText", () => {
    const error = routeErrorResponse(500);
    expect(errorBoundaryContent(error, false).details).toBe("An unexpected error occurred.");
  });

  it("exposes the error message and stack for a plain Error in dev", () => {
    const error = new Error("something broke");
    const result = errorBoundaryContent(error, true);
    expect(result.message).toBe("Error");
    expect(result.details).toBe("something broke");
    expect(result.stack).toBe(error.stack);
  });

  it("hides the error message and stack for a plain Error outside dev", () => {
    const error = new Error("something broke");
    const result = errorBoundaryContent(error, false);
    expect(result.details).toBe("An unexpected error occurred.");
    expect(result.stack).toBeUndefined();
  });

  it("falls back to a generic message for a non-Error, non-route-response throw", () => {
    expect(errorBoundaryContent("boom", true)).toEqual({
      message: "Error",
      details: "An unexpected error occurred.",
      stack: undefined,
    });
  });
});
