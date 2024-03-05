/**
 * Gzip/unzip files using fflate.
 *
 * We could probably replace this with native browser compression, once Firefox adds it:
 * https://developer.mozilla.org/en-US/docs/Web/API/Compression_Streams_API
 */
import { gunzip, gzip } from "fflate";

import { log } from "./log";
import { formatFileSize } from "./size";

// This seems to be significantly faster without being much bigger.
const GZIP_LEVEL = 3;

export function zip(blob: Blob): Promise<Blob> {
  return new Promise((resolve) => {
    blob.arrayBuffer().then((buffer) => {
      const array = new Uint8Array(buffer);
      gzip(array, { consume: true, level: GZIP_LEVEL }, (err, data) => {
        if (err) {
          throw err;
        }
        const zipped = new Blob([data]);
        log(`Gzipped ${formatFileSize(blob.size)} to ${formatFileSize(zipped.size)}`);

        resolve(zipped);
      });
    });
  });
}

export function unzip(blob: Blob): Promise<Blob> {
  return new Promise((resolve) => {
    blob.arrayBuffer().then((buffer) => {
      const array = new Uint8Array(buffer);
      gunzip(array, { consume: true }, (err, data) => {
        if (err) {
          throw err;
        }
        const unzipped = new Blob([data]);
        log(`Unzipped ${formatFileSize(blob.size)} to ${formatFileSize(unzipped.size)}`);

        resolve(unzipped);
      });
    });
  });
}
