const k = 1000;
const KB = k;
const MB = k * KB;
const GB = k * MB;
const TB = k * GB;
const PB = k * TB;

/**
 * Format a file size as a nice, human-readable string.
 *
 * Compute decimal MB, GB, etc following Apple's lead, using 1000 (not 1024) as a base:
 * https://apple.fandom.com/wiki/Byte
 *
 * Source: https://gist.github.com/zentala/1e6f72438796d74531803cc3833c039c
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) {
    return "0 Bytes";
  }
  if (bytes < 0) {
    throw new Error("Invalid size");
  }

  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  const index = Math.floor(Math.log(bytes) / Math.log(k));
  const clamped = Math.min(index, sizes.length - 1); // Limit to indexes in sizes array

  return `${Number.parseFloat((bytes / k ** clamped).toFixed(decimals))} ${
    sizes[clamped]
  }`;
}
