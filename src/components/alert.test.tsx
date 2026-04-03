import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import Alert from "./alert";

vi.mock("use-local-storage-state", () => ({
  default: (_key: string, options: { defaultValue: unknown }) => [
    options.defaultValue,
  ],
}));

describe("Alert", () => {
  it("renders without crashing", () => {
    expect(() => render(<Alert />)).not.toThrow();
  });

  it("renders an empty div", () => {
    const { container } = render(<Alert />);
    const div = container.firstChild;
    expect(div).not.toBeNull();
    expect(div?.nodeName).toBe("DIV");
    expect(div).toBeEmptyDOMElement();
  });
});
