import { vi, describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("~/trpc/react", () => ({
  api: {
    meet: {
      getLink: {
        useMutation: () => ({
          isPending: false,
          isError: false,
          data: null,
          error: null,
          mutateAsync: vi.fn(),
        }),
      },
    },
  },
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));
vi.mock("react-copy-to-clipboard", () => ({
  CopyToClipboard: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

import Meet from "./page";

afterEach(() => {
  cleanup();
});

describe("Meet page", () => {
  it("renders Create Link button", () => {
    render(<Meet />);
    expect(screen.getByText("Create Link")).toBeInTheDocument();
  });
});
