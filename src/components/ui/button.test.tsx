import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import * as React from "react";
import { Button } from "./button";

describe("Button", () => {
  it("renders with children text", () => {
    const { container } = render(<Button>Click me</Button>);
    expect(container.querySelector("button")?.textContent).toBe("Click me");
  });

  it("applies default variant classes", () => {
    const { container } = render(<Button>Default</Button>);
    const btn = container.querySelector("button")!;
    expect(btn).toHaveClass("bg-primary");
    expect(btn).toHaveClass("text-primary-foreground");
    expect(btn).toHaveClass("h-10");
    expect(btn).toHaveClass("px-4");
  });

  it("renders as Slot when asChild is true", () => {
    const { container } = render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    );
    const link = container.querySelector("a");
    expect(link).not.toBeNull();
    expect(link?.textContent).toBe("Link Button");
  });

  it("applies destructive variant classes", () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    const btn = container.querySelector("button")!;
    expect(btn).toHaveClass("bg-destructive");
    expect(btn).toHaveClass("text-destructive-foreground");
  });

  it("applies sm size classes", () => {
    const { container } = render(<Button size="sm">Small</Button>);
    const btn = container.querySelector("button")!;
    expect(btn).toHaveClass("h-9");
    expect(btn).toHaveClass("px-3");
  });

  it("applies lg size classes", () => {
    const { container } = render(<Button size="lg">Large</Button>);
    const btn = container.querySelector("button")!;
    expect(btn).toHaveClass("h-11");
    expect(btn).toHaveClass("px-8");
  });

  it("applies icon size classes", () => {
    const { container } = render(<Button size="icon">★</Button>);
    const btn = container.querySelector("button")!;
    expect(btn).toHaveClass("h-10");
    expect(btn).toHaveClass("w-10");
  });

  it("forwards ref to the underlying button element", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref Button</Button>);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("BUTTON");
  });
});
