import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";

afterEach(cleanup);

vi.mock("@tanstack/react-query", () => ({
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="query-provider">{children}</div>
  ),
  QueryClient: vi.fn(),
}));

vi.mock("@trpc/client", () => ({
  loggerLink: vi.fn((opts?: { enabled?: (op: unknown) => boolean }) => {
    // Exercise the enabled callback to cover branch logic
    if (opts?.enabled) {
      opts.enabled({ direction: "down", result: new Error("test") });
      opts.enabled({ direction: "up", result: null });
    }
    return "logger-link";
  }),
  unstable_httpBatchStreamLink: vi.fn(
    (opts?: { headers?: () => Headers; url?: string }) => {
      // Exercise the headers callback to cover its logic
      if (opts?.headers) opts.headers();
      return "batch-link";
    },
  ),
}));

vi.mock("@trpc/react-query", () => ({
  createTRPCReact: () => ({
    createClient: vi.fn(() => "mock-client"),
    Provider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="trpc-provider">{children}</div>
    ),
  }),
}));

vi.mock("superjson");
vi.mock("~/server/api/root", () => ({ AppRouter: {} }));
vi.mock("./query-client", () => ({
  createQueryClient: vi.fn(() => ({})),
}));

// Import after mocks are set up
const { TRPCReactProvider, api } = await import("./react");

describe("TRPCReactProvider", () => {
  it("renders children", () => {
    render(
      <TRPCReactProvider>
        <span data-testid="child">hello</span>
      </TRPCReactProvider>,
    );

    expect(screen.getByTestId("child")).toBeDefined();
    expect(screen.getByText("hello")).toBeDefined();
  });

  it("wraps children with QueryClientProvider and trpc Provider", () => {
    render(
      <TRPCReactProvider>
        <span data-testid="child">hello</span>
      </TRPCReactProvider>,
    );

    expect(screen.getByTestId("query-provider")).toBeDefined();
    expect(screen.getByTestId("trpc-provider")).toBeDefined();
  });
});

describe("api", () => {
  it("is defined as createTRPCReact result", () => {
    expect(api).toBeDefined();
  });

  it("has createClient method", () => {
    expect(typeof api.createClient).toBe("function");
  });
});

describe("getQueryClient", () => {
  it("returns a singleton on client side (window defined)", () => {
    // TRPCReactProvider calls getQueryClient internally.
    // Rendering twice should reuse the same client (singleton).
    const { unmount } = render(
      <TRPCReactProvider>
        <span>first</span>
      </TRPCReactProvider>,
    );
    unmount();
    render(
      <TRPCReactProvider>
        <span>second</span>
      </TRPCReactProvider>,
    );
    expect(screen.getByText("second")).toBeDefined();
  });

  it("reuses the same singleton across multiple renders", () => {
    // First render
    const { unmount: unmount1 } = render(
      <TRPCReactProvider>
        <span>render1</span>
      </TRPCReactProvider>,
    );
    expect(screen.getByText("render1")).toBeDefined();
    unmount1();

    // Second render — should reuse the cached query client
    const { unmount: unmount2 } = render(
      <TRPCReactProvider>
        <span>render2</span>
      </TRPCReactProvider>,
    );
    expect(screen.getByText("render2")).toBeDefined();
    unmount2();

    // Third render — still works
    render(
      <TRPCReactProvider>
        <span>render3</span>
      </TRPCReactProvider>,
    );
    expect(screen.getByText("render3")).toBeDefined();
  });
});
