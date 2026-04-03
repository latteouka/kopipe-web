import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

vi.mock("./DotPulse.css", () => ({}));

import {
  LoadingSpinner,
  LoadingSphere,
  LoadingDotPulse,
  LoadingPageDot,
  default as LoadingPage,
} from "./loading";

describe("LoadingSpinner", () => {
  it("renders with default size (20)", () => {
    const { container } = render(<LoadingSpinner />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("width")).toBe("20");
    expect(svg?.getAttribute("height")).toBe("20");
  });

  it("renders with custom size", () => {
    const { container } = render(<LoadingSpinner size={40} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("40");
    expect(svg?.getAttribute("height")).toBe("40");
  });

  it("uses <output> element as wrapper", () => {
    const { container } = render(<LoadingSpinner />);
    const output = container.querySelector("output");
    expect(output).not.toBeNull();
  });
});

describe("LoadingSphere", () => {
  it("renders", () => {
    const { container } = render(<LoadingSphere />);
    expect(container.firstChild).not.toBeNull();
  });
});

describe("LoadingDotPulse", () => {
  it("renders with dot-pulse class", () => {
    const { container } = render(<LoadingDotPulse />);
    const dotPulse = container.querySelector(".dot-pulse");
    expect(dotPulse).not.toBeNull();
  });
});

describe("LoadingPage (default export)", () => {
  it("renders", () => {
    const { container } = render(<LoadingPage />);
    expect(container.firstChild).not.toBeNull();
  });
});

describe("LoadingPageDot", () => {
  it("renders", () => {
    const { container } = render(<LoadingPageDot />);
    expect(container.firstChild).not.toBeNull();
  });
});
