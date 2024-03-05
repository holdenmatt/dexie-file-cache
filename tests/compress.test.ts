import { unzip, zip } from "../src/util/compress";

describe("Compression utilities", () => {
  const originalBlobContent = "Hello, World!";
  const largeBlobContent = "A".repeat(10000); // 10,000 characters of "A"

  describe("zip", () => {
    test("should successfully zip a blob and then unzip it", async () => {
      // Zip the content
      const blob = new Blob([originalBlobContent]);
      const zippedBlob = await zip(blob);

      // Unzip the content
      const unzippedBlob = await unzip(zippedBlob);
      const unzippedText = await unzippedBlob.text();

      // Check that the unzipped content matches the original content
      expect(unzippedText).toBe(originalBlobContent);
    });

    test("should reduce the size of compressible content", async () => {
      const blob = new Blob([largeBlobContent]);
      const zippedBlob = await zip(blob);
      expect(zippedBlob.size).toBeLessThan(blob.size);
    });

    test("should throw an error for invalid inputs", async () => {
      const invalidBlob: any = {};
      await expect(zip(invalidBlob)).rejects.toThrow();
    });
  });

  describe("unzip", () => {
    test("should handle large unzipped content", async () => {
      const blob = new Blob([largeBlobContent]);
      const zippedBlob = await zip(blob);
      const unzippedBlob = await unzip(zippedBlob);
      const unzippedText = await unzippedBlob.text();
      expect(unzippedText.length).toBe(largeBlobContent.length);
    });
  });
});
