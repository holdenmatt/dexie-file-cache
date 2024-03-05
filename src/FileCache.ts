import Dexie, { Table } from "dexie";

import { unzip, zip } from "./util/compress";
import { log } from "./util/log";

/**
 * Public metadata about a cached file.
 */
export type FileMetadata = {
  /** Size of the uncompressed blob. */
  size: number;

  /** Size of the compressed blob (or undefined if it isn't compressed). */
  compressedSize?: number;
};

/**
 * Internal file entries cached in Dexie.
 */
type CachedFile = FileMetadata & {
  /** Unique id used as a cache key. */
  id: string;

  /** The content of the cached file. */
  blob: Blob;

  /** The file name. */
  name: string;

  /** The file type. */
  type: string;

  /** Last modified timestamp of the cached file. */
  lastModified: number;

  /** Time when the file was last cached. */
  cachedAt: Date;
};

class FileCacheDatabase extends Dexie {
  files!: Table<CachedFile>;

  constructor(databaseName: string) {
    super(databaseName);
    this.version(1).stores({
      files: "&id, cachedAt",
    });
  }
}

type FileCacheProps = {
  /** Name to use for the Dexie.js database. */
  databaseName?: string;
};

export class FileCache {
  private db: FileCacheDatabase;

  constructor(options?: FileCacheProps) {
    const { databaseName = "dexie-file-cache" } = options || {};

    log("Creating FileCacheDatabase");
    this.db = new FileCacheDatabase(databaseName);
    log("FileCacheDatabase created");
  }

  /**
   * Cache a file for a given id.
   *
   * Compress it by default, unless `compress` is false.
   */
  async put(id: string, file: File, compress = true): Promise<void> {
    const size = file.size;
    let compressedSize: number | undefined = undefined;

    let blob = file.slice();

    if (compress) {
      blob = await zip(blob);
      compressedSize = blob.size;
      log(`Zipped ${file.size} bytes to ${compressedSize}`);
    }

    const cachedFile: CachedFile = {
      id,
      blob,
      name: file.name,
      type: file.type,
      lastModified: file.lastModified,
      cachedAt: new Date(),
      size,
      compressedSize,
    };

    const existingFile = await this.db.files.get(id);
    if (existingFile) {
      await this.db.files.update(id, cachedFile);
      log(`Updated existing file ${file.name} (${id})`);
    } else {
      await this.db.files.put(cachedFile);
      log(`Put new file ${file.name} (${id})`);
    }
  }

  /**
   * Get a file by id.
   *
   * If no file exists, return undefined.
   */
  async get(id: string): Promise<{ file: File; metadata: FileMetadata } | undefined> {
    const cached = await this.db.files.get(id);
    if (cached) {
      log(`Get file ${cached.name} (${id})`);

      let blob = cached.blob;

      if (cached.compressedSize !== undefined) {
        blob = await unzip(blob);
        log(`Unzipped file`);
      }

      const file = new File([blob], cached.name, {
        type: cached.type,
        lastModified: cached.lastModified,
      });

      const metadata = {
        size: cached.size,
        compressedSize: cached.compressedSize,
      };

      return { file, metadata };
    }

    log(`Cache miss getting file (${id})`);
    return undefined;
  }

  /**
   * Delete the cached file with a given id, if it exists.
   */
  async delete(id: string): Promise<void> {
    const start = performance.now();
    const cached = await this.db.files.get(id);
    if (cached) {
      await this.db.files.delete(cached.id);
      log(`Deleted file (${id})`);
    }

    log(`Cache miss deleting file (${id})`);
  }

  /**
   * Clear all cached files.
   */
  async clear(): Promise<void> {
    await this.db.files.clear();
    log(`Cleared all files`);
  }
}
