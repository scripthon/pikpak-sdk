// pikpak-sdk/examples/06_m3u8_playlist.ts
import { PikPak, generateM3u8 } from '../src/index';

/**
 * Example 6: Generating an M3U8 video playlist for video player streaming (VLC, PotPlayer, HLS)
 */
async function main() {
  const client = PikPak.fromEnv();

  try {
    if (!client.isAuthenticated) {
      await client.login();
    }

    const targetFolderId = process.argv[2] || '';
    const outputPath = 'playlist.m3u8';

    console.log(`🎬 Generating M3U8 playlist for folder: "${targetFolderId || 'Root'}"...`);
    const playlist = await generateM3u8(client.drive, targetFolderId, outputPath);

    console.log(`\n✅ Playlist generated successfully! Saved to: ${outputPath}`);
    console.log('\n--- Playlist Preview ---');
    console.log(playlist.slice(0, 300) + '...\n');

  } catch (error: any) {
    console.error('❌ M3U8 generation failed:', error.message);
  }
}

main();
