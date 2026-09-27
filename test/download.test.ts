import { describe, expect, it } from 'bun:test';
import { extractDownloadUrl } from '../src/utils/download';

describe('Download URL Extractor', () => {
  it('extracts direct web_content_link first', () => {
    const file = {
      web_content_link: 'https://dl.example.com/direct.mp4',
      links: {
        'application/octet-stream': { url: 'https://dl.example.com/stream.mp4' },
      },
    };
    expect(extractDownloadUrl(file)).toBe('https://dl.example.com/direct.mp4');
  });

  it('falls back to links.application/octet-stream', () => {
    const file = {
      links: {
        'application/octet-stream': { url: 'https://dl.example.com/stream.mp4' },
      },
    };
    expect(extractDownloadUrl(file)).toBe('https://dl.example.com/stream.mp4');
  });

  it('falls back to medias array', () => {
    const file = {
      medias: [
        { media_name: '720p', link: { url: 'https://dl.example.com/720p.mp4' } },
      ],
    };
    expect(extractDownloadUrl(file)).toBe('https://dl.example.com/720p.mp4');
  });

  it('returns null when no download link exists', () => {
    expect(extractDownloadUrl({})).toBeNull();
    expect(extractDownloadUrl(null as any)).toBeNull();
  });
});
