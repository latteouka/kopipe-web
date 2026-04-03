import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";

// Mock tRPC
const mockRefetch = vi.fn();
const mockDeleteMutateAsync = vi.fn();
vi.mock("~/trpc/react", () => ({
  api: {
    post: {
      findMany: {
        useQuery: () => ({ refetch: mockRefetch }),
      },
      deletePost: {
        useMutation: () => ({ mutateAsync: mockDeleteMutateAsync }),
      },
    },
  },
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    loading: vi.fn().mockReturnValue("toast-id"),
    dismiss: vi.fn(),
  },
}));

// Mock axios
vi.mock("axios", () => ({
  default: { post: vi.fn().mockResolvedValue({ data: { success: true } }) },
}));

// Mock env
vi.mock("~/env", () => ({
  env: { NEXT_PUBLIC_UPLOAD_FILE_URL: "https://example.com/uploads" },
}));

// Mock react-copy-to-clipboard — render children and call onCopy on click
vi.mock("react-copy-to-clipboard", () => ({
  CopyToClipboard: ({
    children,
    onCopy,
  }: {
    children: React.ReactNode;
    onCopy: () => void;
  }) => <div onClick={onCopy}>{children}</div>,
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Copy: () => <svg data-testid="icon-copy" />,
  Download: () => <svg data-testid="icon-download" />,
  Trash2: () => <svg data-testid="icon-trash" />,
}));

// Mock shadcn Button so we don't need the full component tree
vi.mock("~/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

import PostItem from "./post-item";
import type { Post } from "@prisma/client";

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const mockPost: Post = {
  id: "test-id-1",
  content: "Hello world",
  filename: null,
  createdAt: new Date("2026-04-01T00:00:00Z"),
  updatedAt: new Date("2026-04-01T00:00:00Z"),
};

const mockPostWithFile: Post = {
  id: "test-id-2",
  content: "With attachment",
  filename: "test.pdf",
  createdAt: new Date("2026-04-01T00:00:00Z"),
  updatedAt: new Date("2026-04-01T00:00:00Z"),
};

const mockPostFileOnly: Post = {
  id: "test-id-3",
  content: "",
  filename: "document.pdf",
  createdAt: new Date("2026-04-01T00:00:00Z"),
  updatedAt: new Date("2026-04-01T00:00:00Z"),
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("PostItem", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders post content text", () => {
    render(<PostItem post={mockPost} />);
    expect(screen.getByText("Hello world")).toBeDefined();
  });

  it("shows filename when content is empty (file-only post)", () => {
    render(<PostItem post={mockPostFileOnly} />);
    expect(screen.getByText("document.pdf")).toBeDefined();
  });

  it("shows both content and filename when both exist", () => {
    render(<PostItem post={mockPostWithFile} />);
    // Main content text
    expect(screen.getByText("With attachment")).toBeDefined();
    // Filename shown as secondary label below content
    expect(screen.getByText("test.pdf")).toBeDefined();
  });

  it("shows relative time from dayjs fromNow", () => {
    render(<PostItem post={mockPost} />);
    // dayjs fromNow produces a non-empty string (e.g. "3 days ago")
    // We just verify *something* exists in the time slot; exact wording
    // depends on the test run date relative to 2026-04-01.
    const timeElements = screen
      .getAllByText(/ago|in |just now|a few seconds/i)
      // fallback: look for any element with relative-time text pattern
      .filter(Boolean);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it("shows download button only when filename exists", () => {
    render(<PostItem post={mockPostWithFile} />);
    expect(screen.getByTestId("icon-download")).toBeDefined();
  });

  it("does not show download button for text-only posts", () => {
    render(<PostItem post={mockPost} />);
    expect(screen.queryByTestId("icon-download")).toBeNull();
  });

  it("download link has correct href using env upload URL", () => {
    render(<PostItem post={mockPostWithFile} />);
    const link = screen
      .getByTestId("icon-download")
      .closest("a");
    expect(link).not.toBeNull();
    expect(link?.href).toBe("https://example.com/uploads/test.pdf");
    expect(link?.hasAttribute("download")).toBe(true);
  });

  it("renders copy and trash buttons", () => {
    render(<PostItem post={mockPost} />);
    expect(screen.getByTestId("icon-copy")).toBeDefined();
    expect(screen.getByTestId("icon-trash")).toBeDefined();
  });

  it("calls toast.success when copy button is clicked", async () => {
    const userEvent = await import("@testing-library/user-event");
    const user = userEvent.default.setup();
    const { toast } = await import("sonner");

    render(<PostItem post={mockPost} />);

    // CopyToClipboard mock fires onCopy on click of its wrapper div
    const copyIcon = screen.getByTestId("icon-copy");
    const copyWrapper = copyIcon.closest("div")!;
    await user.click(copyWrapper);

    expect(toast.success).toHaveBeenCalledWith("Copied!");
  });

  it("clicking delete calls deletePost and refetch", async () => {
    const userEvent = await import("@testing-library/user-event");
    const user = userEvent.default.setup();
    mockDeleteMutateAsync.mockResolvedValue({});
    mockRefetch.mockResolvedValue({});

    render(<PostItem post={mockPostWithFile} />);

    const trashButton = screen.getByTestId("icon-trash").closest("button")!;
    await user.click(trashButton);

    const { waitFor } = await import("@testing-library/react");
    await waitFor(() => {
      expect(mockDeleteMutateAsync).toHaveBeenCalledWith({ id: "test-id-2" });
    });
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});
