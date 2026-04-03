import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import Layout from "./layout";

afterEach(() => {
  cleanup();
});

describe("Meet layout", () => {
  it("renders children", () => {
    render(
      <Layout>
        <span>child content</span>
      </Layout>,
    );
    expect(screen.getByText("child content")).toBeInTheDocument();
  });
});
