import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

import UploadProgress from "./upload-progress";

describe("UploadProgress", () => {
  it("renders filename correctly", () => {
    const { getByText } = render(
      <UploadProgress
        progress={50}
        filename="document.pdf"
        status="uploading"
      />,
    );
    expect(getByText("document.pdf")).toBeDefined();
  });

  it("shows percentage when uploading", () => {
    const { getByText } = render(
      <UploadProgress progress={67} filename="file.txt" status="uploading" />,
    );
    expect(getByText("67%")).toBeDefined();
  });

  it("shows 'Uploading...' text when status is uploading", () => {
    const { getByText } = render(
      <UploadProgress progress={30} filename="file.txt" status="uploading" />,
    );
    expect(getByText("Uploading...")).toBeDefined();
  });

  it("shows 'Done' text when status is done", () => {
    const { getByText } = render(
      <UploadProgress progress={100} filename="file.txt" status="done" />,
    );
    expect(getByText("Done")).toBeDefined();
  });

  it("shows 'Failed' text when status is error", () => {
    const { getByText } = render(
      <UploadProgress progress={0} filename="file.txt" status="error" />,
    );
    expect(getByText("Failed")).toBeDefined();
  });

  it("shows checkmark SVG (polyline element) when done", () => {
    const { container } = render(
      <UploadProgress progress={100} filename="file.txt" status="done" />,
    );
    const polyline = container.querySelector("polyline");
    expect(polyline).not.toBeNull();
  });

  it("shows '!' when status is error", () => {
    const { getByText } = render(
      <UploadProgress progress={0} filename="file.txt" status="error" />,
    );
    expect(getByText("!")).toBeDefined();
  });
});
