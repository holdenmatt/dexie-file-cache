import { formatFileSize } from "../src/util/size";

describe("formatFileSize", () => {
  test('should return "0 Bytes" for 0 bytes', () => {
    expect(formatFileSize(0)).toBe("0 Bytes");
  });

  test("should format bytes correctly", () => {
    expect(formatFileSize(500)).toBe("500 Bytes");
  });

  test("should format kilobytes correctly", () => {
    expect(formatFileSize(1500)).toBe("1.5 KB");
  });

  test("should format megabytes correctly", () => {
    expect(formatFileSize(5 * 1000 * 1000)).toBe("5 MB");
  });

  test("should format gigabytes correctly", () => {
    expect(formatFileSize(3.5 * 1000 * 1000 * 1000)).toBe("3.5 GB");
  });

  test("should format terabytes correctly", () => {
    expect(formatFileSize(2 * 1000 * 1000 * 1000 * 1000)).toBe("2 TB");
  });

  test("should format petabytes correctly", () => {
    expect(formatFileSize(1.25 * 1000 * 1000 * 1000 * 1000 * 1000)).toBe("1.25 PB");
  });

  test("should allow custom decimal precision", () => {
    expect(formatFileSize(1500, 0)).toBe("2 KB"); // rounds up
    expect(formatFileSize(1499, 0)).toBe("1 KB"); // rounds down
    expect(formatFileSize(5.444 * 1000 * 1000, 1)).toBe("5.4 MB"); // single decimal
  });

  test("should handle negative numbers", () => {
    expect(() => formatFileSize(-500)).toThrow("Invalid size");
  });

  test("should handle large numbers beyond petabytes", () => {
    const hugeNumber = 10 ** 18; // Exabyte
    expect(formatFileSize(hugeNumber)).toBe("1000 PB"); // beyond array so default to PB
  });
});
