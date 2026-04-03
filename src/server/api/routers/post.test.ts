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

describe("postRouter – create procedure", () => {
  const create = postRouter.create as unknown as ProcedureStub;

  it("creates a post with content only", async () => {
    const mockCreate = vi.fn().mockResolvedValue({ id: "1", content: "hello", filename: null });
    const ctx = { db: { post: { create: mockCreate } } };

    const result = await create._fn({ input: { content: "hello" }, ctx });
    expect(mockCreate).toHaveBeenCalledWith({
      data: { content: "hello", filename: undefined },
    });
    expect(result).toEqual({ post: { id: "1", content: "hello", filename: null } });
  });

  it("creates a post with content and filename", async () => {
    const mockCreate = vi.fn().mockResolvedValue({ id: "2", content: "test", filename: "file.pdf" });
    const ctx = { db: { post: { create: mockCreate } } };

    const result = await create._fn({ input: { content: "test", filename: "file.pdf" }, ctx });
    expect(mockCreate).toHaveBeenCalledWith({
      data: { content: "test", filename: "file.pdf" },
    });
    expect(result).toEqual({ post: { id: "2", content: "test", filename: "file.pdf" } });
  });
});

describe("postRouter – findMany procedure", () => {
  const findMany = postRouter.findMany as unknown as ProcedureStub;

  it("returns posts ordered by createdAt desc", async () => {
    const mockPosts = [
      { id: "2", content: "newer" },
      { id: "1", content: "older" },
    ];
    const mockFindMany = vi.fn().mockResolvedValue(mockPosts);
    const ctx = { db: { post: { findMany: mockFindMany } } };

    const result = await findMany._fn({ ctx });
    expect(mockFindMany).toHaveBeenCalledWith({ orderBy: { createdAt: "desc" } });
    expect(result).toEqual({ posts: mockPosts });
  });
});

describe("postRouter – deletePost procedure", () => {
  const deletePost = postRouter.deletePost as unknown as ProcedureStub;

  it("deletes a post by id", async () => {
    const mockDelete = vi.fn().mockResolvedValue({ id: "1", content: "deleted" });
    const ctx = { db: { post: { delete: mockDelete } } };

    const result = await deletePost._fn({ input: { id: "1" }, ctx });
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "1" } });
    expect(result).toEqual({ post: { id: "1", content: "deleted" } });
  });
});
