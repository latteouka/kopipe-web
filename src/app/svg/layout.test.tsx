import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

describe("SVG layout", () => {
  it("renders children", async () => {
    const mod = await import("./layout");
    const Layout = mod.default;
    render(
      <Layout>
        <span>svg child</span>
      </Layout>,
    );
    expect(screen.getByText("svg child")).toBeInTheDocument();
  });
});
