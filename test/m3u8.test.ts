import { describe, expect, it } from 'bun:test';
import { formatM3u8 } from '../src/utils/m3u8';

describe('M3U8 Formatter', () => {
  it('formats playlist entries correctly', () => {
    const entries = [
      { name: 'Video 1', url: 'https://example.com/video1.mp4' },
      { name: 'Video 2', url: 'https://example.com/video2.mp4', duration: 120 },
    ];

    const result = formatM3u8(entries);
    expect(result).toStartWith('#EXTM3U\n');
    expect(result).toContain('#EXTINF:-1,Video 1\nhttps://example.com/video1.mp4\n');
    expect(result).toContain('#EXTINF:120,Video 2\nhttps://example.com/video2.mp4\n');
  });
});
