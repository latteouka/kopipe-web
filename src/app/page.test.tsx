import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mutable store so individual tests can override the posts data
let mockPostsData: { posts: { id: string; content: string }[] } = {
  posts: [],
};

// Mock tRPC
const mockRefetch = vi.fn();
const mockMutateAsync = vi.fn();
vi.mock("~/trpc/react", () => ({
  api: {
    post: {
      findMany: {
        useQuery: () => ({
          data: mockPostsData,
          refetch: mockRefetch,
        }),
      },
      create: {
        useMutation: () => ({
          mutateAsync: mockMutateAsync,
        }),
      },
    },
  },
}));

// Mock react-dropzone — capture onDrop so tests can simulate file drops
let capturedOnDrop: ((files: File[]) => void) | null = null;
vi.mock("react-dropzone", () => ({
  useDropzone: ({ onDrop }: { onDrop: (files: File[]) => void }) => {
    capturedOnDrop = onDrop;
    return {
      getRootProps: () => ({}),
      getInputProps: () => ({}),
      isDragActive: false,
    };
  },
}));

// Mock framer-motion
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

// Mock sonner
vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn(), loading: vi.fn(), dismiss: vi.fn() },
}));

// Mock child components to avoid their own dependency chains
vi.mock("~/components/post-item", () => ({
  default: ({ post }: { post: { content: string } }) => (
    <div data-testid="post-item">{post.content}</div>
  ),
}));
vi.mock("~/components/alert", () => ({
  default: () => <div data-testid="alert" />,
}));
vi.mock("~/components/upload-progress", () => ({
  default: ({
    progress,
    filename,
    status,
  }: {
    progress: number;
    filename: string;
    status: string;
  }) => (
    <div data-testid="upload-progress" data-status={status}>
      {filename} {progress}%
    </div>
  ),
}));

// Mock axios
vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  X: (props: React.HTMLAttributes<HTMLSpanElement>) => (
    <span data-testid="x-icon" onClick={props.onClick} />
  ),
}));

// Mock dayjs/plugin/relativeTime so dayjs.extend() doesn't fail in jsdom
vi.mock("dayjs/plugin/relativeTime", () => ({ default: () => void 0 }));

import Home from "./page";
import { toast } from "sonner";
import axios from "axios";

describe("Home page", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    mockPostsData = { posts: [] };
    mockMutateAsync.mockResolvedValue({});
    mockRefetch.mockResolvedValue({});
  });

  it("renders the page title 'kopipe'", () => {
    render(<Home />);
    expect(screen.getByText("kopipe")).toBeInTheDocument();
  });

  it("renders textarea with placeholder 'Paste something...'", () => {
    render(<Home />);
    expect(
      screen.getByPlaceholderText("Paste something..."),
    ).toBeInTheDocument();
  });

  it("renders the upload dropzone with 'Upload file' text", () => {
    render(<Home />);
    expect(screen.getByText("Upload file")).toBeInTheDocument();
  });

  it("renders the Add button", () => {
    render(<Home />);
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("shows toast error when Add is clicked with empty content and no file", async () => {
    const user = userEvent.setup();
    render(<Home />);

    const addButton = screen.getByRole("button", { name: "Add" });
    await user.click(addButton);

    await waitFor(() => {
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
        "Input content or upload a file.",
      );
    });
  });

  it("renders posts from tRPC query data", () => {
    mockPostsData = {
      posts: [
        { id: "1", content: "First post" },
        { id: "2", content: "Second post" },
      ],
    };

    render(<Home />);

    const items = screen.getAllByTestId("post-item");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("First post");
    expect(items[1]).toHaveTextContent("Second post");
  });

  it("can type in the textarea", async () => {
    const user = userEvent.setup();
    render(<Home />);

    const textarea = screen.getByPlaceholderText("Paste something...");
    await user.type(textarea, "Hello world");

    expect(textarea).toHaveValue("Hello world");
  });

  it("calls mutateAsync with content when Add button is clicked", async () => {
    const user = userEvent.setup();
    render(<Home />);

    const textarea = screen.getByPlaceholderText("Paste something...");
    await user.type(textarea, "Test content");

    const addButton = screen.getByRole("button", { name: "Add" });
    await user.click(addButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        content: "Test content",
        filename: undefined,
      });
    });
  });

  it("clears textarea and refetches after successful submit", async () => {
    const user = userEvent.setup();
    render(<Home />);

    const textarea = screen.getByPlaceholderText("Paste something...");
    await user.type(textarea, "Some content");
    await user.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(textarea).toHaveValue("");
    });
  });

  it("shows selected file name after drop", async () => {
    render(<Home />);
    const file = new File(["content"], "test.pdf", { type: "application/pdf" });
    act(() => capturedOnDrop?.([file]));
    await waitFor(() => {
      expect(screen.getByText("test.pdf")).toBeInTheDocument();
    });
  });

  it("clears selected file when X is clicked", async () => {
    const user = userEvent.setup();
    render(<Home />);
    const file = new File(["content"], "test.pdf", { type: "application/pdf" });
    act(() => capturedOnDrop?.([file]));
    await waitFor(() => {
      expect(screen.getByText("test.pdf")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("x-icon"));
    expect(screen.queryByText("test.pdf")).toBeNull();
  });

  it("uploads file via axios when Add is clicked with a file", async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const mockAxiosPost = vi.mocked(axios.post);
    mockAxiosPost.mockResolvedValueOnce({
      data: { success: true, name: "test.pdf" },
    });
    const user = userEvent.setup();
    render(<Home />);

    const file = new File(["content"], "test.pdf", { type: "application/pdf" });
    capturedOnDrop?.([file]);

    await user.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(mockAxiosPost).toHaveBeenCalledWith(
        "/api/upload",
        expect.any(FormData),
        expect.objectContaining({
          headers: { "Content-Type": "multipart/form-data" },
        }),
      );
    });
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        content: "",
        filename: "test.pdf",
      });
    });
  });

  it("handles mutateAsync error gracefully", async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error("Network error"));
    const user = userEvent.setup();
    render(<Home />);

    const textarea = screen.getByPlaceholderText("Paste something...");
    await user.type(textarea, "Will fail");
    await user.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });
    // Button should be re-enabled after error
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Add" })).not.toBeDisabled();
    });
  });

  it("invokes onUploadProgress callback during file upload", async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const mockAxiosPost = vi.mocked(axios.post);
    mockAxiosPost.mockImplementation((_url, _data, config) => {
      // Simulate progress callback
      const onProgress = config?.onUploadProgress;
      if (onProgress) {
        onProgress({ loaded: 50, total: 100 } as unknown as import("axios").AxiosProgressEvent);
        onProgress({ loaded: 100, total: 100 } as unknown as import("axios").AxiosProgressEvent);
      }
      return Promise.resolve({ data: { success: true, name: "prog.pdf" } });
    });

    const user = userEvent.setup();
    render(<Home />);

    const file = new File(["content"], "prog.pdf", { type: "application/pdf" });
    act(() => capturedOnDrop?.([file]));

    await user.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(mockAxiosPost).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        content: "",
        filename: "prog.pdf",
      });
    });
  });

  it("handles upload failure gracefully and re-enables button", async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const mockAxiosPost = vi.mocked(axios.post);
    mockAxiosPost.mockRejectedValueOnce(new Error("Upload failed"));

    const user = userEvent.setup();
    render(<Home />);

    const file = new File(["content"], "fail.pdf", { type: "application/pdf" });
    act(() => capturedOnDrop?.([file]));

    await user.click(screen.getByRole("button", { name: "Add" }));

    // Button should be re-enabled after error
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Add" })).not.toBeDisabled();
    });
    // mutateAsync should NOT have been called since upload failed
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("handles onUploadProgress when total is undefined", async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const mockAxiosPost = vi.mocked(axios.post);
    mockAxiosPost.mockImplementation((_url, _data, config) => {
      const onProgress = config?.onUploadProgress;
      if (onProgress) {
        // No total — should not crash
        onProgress({ loaded: 50 } as unknown as import("axios").AxiosProgressEvent);
      }
      return Promise.resolve({ data: { success: true, name: "nototal.pdf" } });
    });

    const user = userEvent.setup();
    render(<Home />);

    const file = new File(["content"], "nototal.pdf", { type: "application/pdf" });
    act(() => capturedOnDrop?.([file]));

    await user.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        content: "",
        filename: "nototal.pdf",
      });
    });
  });
});
