import { describe, expect, it } from 'bun:test';
import { calculateGcid, calculateGcidFromBuffer, getGcidBlockSize } from '../src/utils/gcid';
import fs from 'fs';
import path from 'path';

describe('GCID Hash Calculator', () => {
  it('calculates correct block size based on file size thresholds', () => {
    expect(getGcidBlockSize(100)).toBe(262144); // <= 128MB -> 256KB
    expect(getGcidBlockSize(134217728)).toBe(262144); // 128MB
    expect(getGcidBlockSize(200000000)).toBe(524288); // <= 256MB -> 512KB
    expect(getGcidBlockSize(400000000)).toBe(1048576); // <= 512MB -> 1MB
    expect(getGcidBlockSize(600000000)).toBe(2097152); // > 512MB -> 2MB
  });

  it('calculates GCID from in-memory buffer', () => {
    const data = Buffer.from('hello pikpak sdk test buffer content');
    const hash = calculateGcidFromBuffer(data);
    expect(hash).toBeString();
    expect(hash).toHaveLength(40);
    expect(hash).toBe(hash.toUpperCase());
  });

  it('calculates matching GCID between file and buffer', async () => {
    const tmpFile = path.join(import.meta.dir, 'tmp_gcid_test.txt');
    const content = Buffer.from('PikPak SDK GCID consistency verification test 1234567890');
    await fs.promises.writeFile(tmpFile, content);

    try {
      const fileHash = await calculateGcid(tmpFile);
      const bufferHash = calculateGcidFromBuffer(content);
      expect(fileHash).toBe(bufferHash);
    } finally {
      if (fs.existsSync(tmpFile)) {
        await fs.promises.unlink(tmpFile);
      }
    }
  });

  it('handles empty buffers gracefully', () => {
    const emptyHash = calculateGcidFromBuffer(Buffer.alloc(0));
    expect(emptyHash).toBeString();
    expect(emptyHash).toHaveLength(40);
  });
});
