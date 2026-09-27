// pikpak-sdk/src/utils/gcid.ts
import crypto from 'crypto';
import fs from 'fs';

/**
 * Gets the block size for GCID calculation based on file size.
 */
export function getGcidBlockSize(fileSize: number): number {
  if (fileSize <= 134217728) { // 128MB
    return 262144; // 256KB
  } else if (fileSize <= 268435456) { // 256MB
    return 524288; // 512KB
  } else if (fileSize <= 536870912) { // 512MB
    return 1048576; // 1MB
  } else {
    return 2097152; // 2MB
  }
}

/**
 * Calculates the GCID (PikPak file hash) from a local file path.
 * Uses streaming to handle arbitrarily large files without high memory usage.
 */
export async function calculateGcid(filePath: string): Promise<string> {
  const stats = await fs.promises.stat(filePath);
  const fileSize = stats.size;

  if (fileSize === 0) {
    const emptySha1 = crypto.createHash('sha1').digest();
    return crypto.createHash('sha1').update(emptySha1).digest('hex').toUpperCase();
  }

  const blockSize = getGcidBlockSize(fileSize);
  const masterHash = crypto.createHash('sha1');
  const fd = fs.openSync(filePath, 'r');
  const buffer = Buffer.alloc(Math.min(65536, blockSize));

  let currentBlockBytes = 0;
  let blockHash = crypto.createHash('sha1');
  let totalRead = 0;

  try {
    while (totalRead < fileSize) {
      const bytesToRead = Math.min(buffer.length, fileSize - totalRead);
      const bytesRead = fs.readSync(fd, buffer, 0, bytesToRead, null);
      if (bytesRead === 0) break;

      blockHash.update(buffer.subarray(0, bytesRead));
      currentBlockBytes += bytesRead;
      totalRead += bytesRead;

      if (currentBlockBytes >= blockSize || totalRead === fileSize) {
        masterHash.update(blockHash.digest());
        if (totalRead < fileSize) {
          blockHash = crypto.createHash('sha1');
          currentBlockBytes = 0;
        }
      }
    }
  } finally {
    fs.closeSync(fd);
  }

  return masterHash.digest('hex').toUpperCase();
}

/**
 * Calculates the GCID (PikPak file hash) directly from an in-memory buffer or Uint8Array.
 */
export function calculateGcidFromBuffer(buffer: Uint8Array | Buffer): string {
  const fileSize = buffer.length;
  if (fileSize === 0) {
    const emptySha1 = crypto.createHash('sha1').digest();
    return crypto.createHash('sha1').update(emptySha1).digest('hex').toUpperCase();
  }

  const blockSize = getGcidBlockSize(fileSize);
  const masterHash = crypto.createHash('sha1');

  let offset = 0;
  while (offset < fileSize) {
    const end = Math.min(offset + blockSize, fileSize);
    const chunk = buffer.subarray(offset, end);
    const blockSha1 = crypto.createHash('sha1').update(chunk).digest();
    masterHash.update(blockSha1);
    offset = end;
  }

  return masterHash.digest('hex').toUpperCase();
}
