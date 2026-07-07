import { describe, it, expect } from "vitest";
import { withNotFound } from "./withNotFound";

describe("withNotFound", () => {
  it("returns the resolved value when fn succeeds", async () => {
    await expect(withNotFound(() => Promise.resolve("ok"))).resolves.toBe("ok");
  });

  it("converts a 'Bad Request' error into a 404 Response", async () => {
    await expect(
      withNotFound(() => Promise.reject(new Error("XRPC error: Bad Request"))),
    ).rejects.toBeInstanceOf(Response);

    try {
      await withNotFound(() => Promise.reject(new Error("XRPC error: Bad Request")));
      throw new Error("expected withNotFound to throw");
    } catch (e) {
      expect(e).toBeInstanceOf(Response);
      expect((e as Response).status).toBe(404);
    }
  });

  it("rethrows any other error unchanged", async () => {
    const original = new Error("network down");
    await expect(withNotFound(() => Promise.reject(original))).rejects.toBe(original);
  });

  it("rethrows non-Error rejections unchanged", async () => {
    await expect(withNotFound(() => Promise.reject("boom"))).rejects.toBe("boom");
  });
});
