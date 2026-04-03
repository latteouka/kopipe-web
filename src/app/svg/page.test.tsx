import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import Svg from "./page";

describe("Svg page", () => {
  it("renders two SVG elements", () => {
    const { container } = render(<Svg />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs).toHaveLength(2);
  });

  it("both SVGs have correct viewBox", () => {
    const { container } = render(<Svg />);
    const svgs = container.querySelectorAll("svg");
    svgs.forEach((svg) => {
      expect(svg.getAttribute("viewBox")).toBe("0 0 24 24");
    });
  });

  it("container has correct dimensions class", () => {
    const { container } = render(<Svg />);
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain("h-[512px]");
    expect(wrapper?.className).toContain("w-[512px]");
  });
});
