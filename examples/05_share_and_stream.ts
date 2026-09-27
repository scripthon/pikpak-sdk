// pikpak-sdk/examples/05_share_and_stream.ts
import { PikPak, parseShareUrl } from '../src/index';

/**
 * Example 5: Browsing public share links, extracting direct video stream links,
 * and restoring (saving) files into your own PikPak drive.
 */
async function main() {
  const client = PikPak.fromEnv();

  // Example public PikPak share link
  const sampleShareUrl = 'https://mypikpak.com/s/xxxx4xxxyxxxxxxxxxxxxxxx';

  try {
    // 1. Parse share URL
    const { shareId } = parseShareUrl(sampleShareUrl);
    console.log(`🔗 Target Share ID: ${shareId}`);

    // 2. Fetch share info & pass code token (handles public & password-protected shares)
    console.log('📖 Fetching share details...');
    const info = await client.share.getShareInfo(shareId);
    console.log(`Share Title: ${info.share_status_text || 'OK'}`);

    const passCodeToken = await client.share.getPassCodeToken(shareId);

    // 3. List files in the share folder
    const listRes = await client.share.listShareFiles(shareId, { passCodeToken, limit: 10 });
    console.log(`\nFound ${(listRes.files || []).length} shared items:`);

    let targetFileId = '';
    for (const file of listRes.files || []) {
      console.log(`- [${file.kind}] ${file.name} (id: ${file.id})`);
      if (file.kind === 'drive#file' && !targetFileId) {
        targetFileId = file.id;
      }
    }

    // 4. Resolve direct video stream or download URL WITHOUT restoring/saving to drive!
    if (targetFileId) {
      console.log(`\n🎬 Resolving direct stream URL for file: ${targetFileId}...`);
      const streamUrl = await client.share.resolveContentUrl(shareId, targetFileId, passCodeToken);
      console.log('Stream / Download URL:', streamUrl);
    }

    // 5. If authenticated, restore (save) shared items into own account
    if (client.isAuthenticated && targetFileId) {
      console.log('\n📥 Resolving folder hierarchy and restoring to account...');
      const ancestors = await client.share.resolveAncestorIds(shareId, targetFileId, passCodeToken);
      const restoreRes = await client.share.restore({
        shareId,
        fileIds: [targetFileId],
        ancestorIds: ancestors,
        passCodeToken,
      });
      console.log('Restore result:', restoreRes.restore_status);
    }

  } catch (error: any) {
    console.error('❌ Share operation failed:', error.message);
  }
}

main();
