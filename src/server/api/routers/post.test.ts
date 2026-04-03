import { describe, it, expect, vi } from "vitest";

/**
 * Mock the tRPC infrastructure so we can test the router's handler functions
 * in isolation without needing a real database or tRPC server.
 *
 * The mock captures the handler functions registered via .query() / .mutation()
 * so we can invoke them directly.
 */
vi.mock("~/server/api/trpc", () => {
  const publicProcedure = {
    input: (_schema: unknown) => ({
      query: (fn: (args: unknown) => unknown) => ({ _fn: fn, _type: "query" }),
      mutation: (fn: (args: unknown) => unknown) => ({
        _fn: fn,
        _type: "mutation",
      }),
    }),
    query: (fn: (args: unknown) => unknown) => ({ _fn: fn, _type: "query" }),
    mutation: (fn: (args: unknown) => unknown) => ({
      _fn: fn,
      _type: "mutation",
    }),
  };

  return {
    createTRPCRouter: (routes: Record<string, unknown>) => routes,
    publicProcedure,
  };
});

// Import after mock is set up
const { postRouter } = await import("~/server/api/routers/post");

type ProcedureStub = {
  _fn: (args: { input: unknown; ctx?: unknown }) => unknown;
  _type: string;
};

describe("postRouter – hello procedure", () => {
  const hello = postRouter.hello as unknown as ProcedureStub;

  it("returns the correct greeting for a given text", async () => {
    const result = await hello._fn({ input: { text: "World" } });
    expect(result).toEqual({ greeting: "Hello World" });
  });

  it("interpolates different input texts correctly", async () => {
    const cases = ["Alice", "Bob", "tRPC"];
    for (const text of cases) {
      const result = (await hello._fn({ input: { text } })) as {
        greeting: string;
      };
      expect(result.greeting).toBe(`Hello ${text}`);
    }
  });
});
