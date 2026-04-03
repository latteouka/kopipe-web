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
  loggerLink: vi.fn(() => "logger-link"),
  unstable_httpBatchStreamLink: vi.fn(() => "batch-link"),
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
