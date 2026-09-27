import { describe, expect, it } from 'bun:test';
import { parseShareUrl } from '../src/utils/url';

describe('Share URL Parser', () => {
  it('parses standard mypikpak.com share URLs', () => {
    const res = parseShareUrl('https://mypikpak.com/s/testShareId123');
    expect(res.shareId).toBe('testShareId123');
    expect(res.parentId).toBe('');
  });

  it('parses share URLs containing subfolder parentId', () => {
    const res = parseShareUrl('https://mypikpak.com/s/testShareId123/subFolderId456');
    expect(res.shareId).toBe('testShareId123');
    expect(res.parentId).toBe('subFolderId456');
  });

  it('handles query parameters and hashes in URL', () => {
    const res = parseShareUrl('https://mypikpak.com/s/ABC123XYZ/folder789?pass_code=1234#preview');
    expect(res.shareId).toBe('ABC123XYZ');
    expect(res.parentId).toBe('folder789');
  });

  it('handles raw share IDs', () => {
    const res = parseShareUrl('testShareId123');
    expect(res.shareId).toBe('testShareId123');
    expect(res.parentId).toBe('');
  });

  it('handles empty input gracefully', () => {
    const res = parseShareUrl('');
    expect(res.shareId).toBe('');
    expect(res.parentId).toBe('');
  });
});
