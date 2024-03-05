import { FileCache } from "../src/FileCache";

// @ts-ignore
global.File = MockFile = class MockFile extends Blob {
  name: string;
  lastModified: number;

  constructor(blobParts: BlobPart[], name: string, options: FilePropertyBag) {
    super(blobParts, options);
    this.name = name;
    this.lastModified = options?.lastModified || Date.now();
  }
};

describe("FileCache", () => {
  const databaseName = "test-db";
  let fileCache: FileCache;

  beforeEach(() => {
    fileCache = new FileCache({ databaseName });
  });

  afterEach(async () => {
    await fileCache.clear();
  });

  describe("Basic CRUD operations", () => {
    test("should cache and retrieve a file", async () => {
      const id = "id1";
      const lastModified = new Date().getTime();
      const originalFile = new File(["Hello, World!"], "test.txt", {
        lastModified,
        type: "text/plain",
      });

      await fileCache.put(id, originalFile);
      const result = await fileCache.get(id);

      expect(result).not.toBeUndefined();
      const { file, metadata } = result || {};

      expect(file instanceof Blob).toBeTruthy();

      expect(file?.name).toBe("test.txt");
      expect(file?.type).toBe("text/plain");
      expect(file?.lastModified).toBe(lastModified);

      expect(metadata?.size).toBe(originalFile.size);

      expect(await file?.text()).toBe("Hello, World!");
    });

    test("should cache and delete a file", async () => {
      const id = "id2";
      const originalFile = new File(["Hello, World!"], "test.txt");

      await fileCache.put(id, originalFile);
      await fileCache.delete(id);
      const retrievedFile = await fileCache.get(id);

      expect(retrievedFile).toBeUndefined();
    });
  });
});
