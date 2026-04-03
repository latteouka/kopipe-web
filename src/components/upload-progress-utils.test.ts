import { describe, it, expect } from "vitest";
import {
  RADIUS,
  CIRCUMFERENCE,
  RING_COLORS,
  STATUS_TEXTS,
  calculateOffset,
} from "./upload-progress-utils";

describe("upload-progress-utils", () => {
  describe("CIRCUMFERENCE", () => {
    it("應根據 RADIUS 正確計算圓周長", () => {
      expect(CIRCUMFERENCE).toBeCloseTo(2 * Math.PI * RADIUS);
    });

    it("RADIUS 應為 24", () => {
      expect(RADIUS).toBe(24);
    });

    it("CIRCUMFERENCE 應約為 150.796", () => {
      expect(CIRCUMFERENCE).toBeCloseTo(150.796, 2);
    });
  });

  describe("calculateOffset", () => {
    it("progress 為 0% 時，offset 應等於完整圓周長（環全空）", () => {
      expect(calculateOffset(0)).toBeCloseTo(CIRCUMFERENCE);
    });

    it("progress 為 100% 時，offset 應為 0（環全滿）", () => {
      expect(calculateOffset(100)).toBeCloseTo(0);
    });

    it("progress 為 50% 時，offset 應為 CIRCUMFERENCE 的一半", () => {
      expect(calculateOffset(50)).toBeCloseTo(CIRCUMFERENCE / 2);
    });

    it("progress 為 25% 時，offset 應為 CIRCUMFERENCE 的 75%", () => {
      expect(calculateOffset(25)).toBeCloseTo(CIRCUMFERENCE * 0.75);
    });

    it("progress 為 75% 時，offset 應為 CIRCUMFERENCE 的 25%", () => {
      expect(calculateOffset(75)).toBeCloseTo(CIRCUMFERENCE * 0.25);
    });
  });

  describe("RING_COLORS", () => {
    it("done 狀態應對應綠色", () => {
      expect(RING_COLORS.done).toBe("#22c55e");
    });

    it("error 狀態應對應紅色", () => {
      expect(RING_COLORS.error).toBe("#ef4444");
    });

    it("uploading 狀態應對應藍色", () => {
      expect(RING_COLORS.uploading).toBe("#3b82f6");
    });

    it("應包含所有三種狀態", () => {
      expect(Object.keys(RING_COLORS)).toEqual(
        expect.arrayContaining(["done", "error", "uploading"]),
      );
    });
  });

  describe("STATUS_TEXTS", () => {
    it("done 狀態應顯示 'Done'", () => {
      expect(STATUS_TEXTS.done).toBe("Done");
    });

    it("error 狀態應顯示 'Failed'", () => {
      expect(STATUS_TEXTS.error).toBe("Failed");
    });

    it("uploading 狀態應顯示 'Uploading...'", () => {
      expect(STATUS_TEXTS.uploading).toBe("Uploading...");
    });

    it("應包含所有三種狀態", () => {
      expect(Object.keys(STATUS_TEXTS)).toEqual(
        expect.arrayContaining(["done", "error", "uploading"]),
      );
    });
  });
});
