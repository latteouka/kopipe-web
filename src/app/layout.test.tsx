import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";

afterEach(cleanup);

vi.mock("~/styles/globals.css", () => ({}));

vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "mock-font-var" }),
}));

vi.mock("~/trpc/react", () => ({
  TRPCReactProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="trpc-provider">{children}</div>
  ),
}));

vi.mock("~/components/ui/sonner", () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

vi.mock("~/lib/utils", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));

const { default: RootLayout } = await import("./layout");

describe("RootLayout", () => {
  it("renders children", () => {
    render(
      <RootLayout>
        <span data-testid="child">page content</span>
      </RootLayout>,
    );

    expect(screen.getByTestId("child")).toBeDefined();
    expect(screen.getByText("page content")).toBeDefined();
  });

  it("renders Toaster", () => {
    render(
      <RootLayout>
        <span>content</span>
      </RootLayout>,
    );

    expect(screen.getByTestId("toaster")).toBeDefined();
  });

  it("renders TRPCReactProvider", () => {
    render(
      <RootLayout>
        <span>content</span>
      </RootLayout>,
    );

    expect(screen.getByTestId("trpc-provider")).toBeDefined();
  });
});
