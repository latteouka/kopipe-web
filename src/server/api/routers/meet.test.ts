import { describe, it, expect, vi } from "vitest";

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

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

const { meetRouter } = await import("~/server/api/routers/meet");
import axios from "axios";

type ProcedureStub = {
  _fn: (args: { input?: unknown; ctx?: unknown }) => unknown;
  _type: string;
};

describe("meetRouter – getLink procedure", () => {
  const getLink = meetRouter.getLink as unknown as ProcedureStub;

  it("returns meet link URL on success", async () => {
    const mockedAxios = vi.mocked(axios);
    mockedAxios.get.mockResolvedValueOnce({
      data: { url: "https://meet.google.com/abc-defg-hij", message: "ok", statusCode: 200 },
    });

    const result = (await getLink._fn({ input: undefined })) as { url: string };
    expect(result.url).toBe("https://meet.google.com/abc-defg-hij");
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockedAxios.get).toHaveBeenCalledWith("https://api.chundev.com/social/meetLink");
  });

  it("throws TRPCError when response parsing fails", async () => {
    const mockedAxios = vi.mocked(axios);
    mockedAxios.get.mockRejectedValueOnce(new Error("Network error"));

    await expect(getLink._fn({ input: undefined })).rejects.toThrow();
  });
});
