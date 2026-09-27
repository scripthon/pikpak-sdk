// pikpak-sdk/examples/02_drive_operations.ts
import { PikPak } from '../src/index';

/**
 * Example 2: Managing files, folders, moving, renaming, and trash
 */
async function main() {
  const client = PikPak.fromEnv();

  try {
    if (!client.isAuthenticated) {
      await client.login();
    }

    // 1. Check storage quota
    const quota = await client.drive.getQuota();
    console.log('📊 Storage Quota:');
    console.log(`- Used: ${quota.quota.usage} bytes`);
    console.log(`- Limit: ${quota.quota.limit} bytes`);

    // 2. List root files
    console.log('\n📂 Listing files in Root:');
    const rootList = await client.drive.listFiles({ limit: 10 });
    for (const file of rootList.files) {
      console.log(`- [${file.kind.includes('folder') ? 'DIR' : 'FILE'}] ${file.name} (id: ${file.id})`);
    }

    // 3. Create a test folder
    console.log('\n📁 Creating new folder: "SDK Test Folder"...');
    const newFolder = await client.drive.createFolder('SDK Test Folder');
    const folderId = newFolder.file?.id;
    console.log(`Folder created with ID: ${folderId}`);

    if (folderId) {
      // 4. Rename the folder
      console.log('✏️ Renaming folder to "SDK Test Folder Renamed"...');
      await client.drive.renameFile(folderId, 'SDK Test Folder Renamed');

      // 5. Star the folder
      console.log('⭐ Starring folder...');
      await client.drive.starFiles([folderId], true);

      // 6. Move to trash
      console.log('🗑️ Moving folder to trash...');
      await client.drive.trashFiles([folderId]);

      // 7. Restore from trash
      console.log('♻️ Restoring folder from trash...');
      await client.drive.untrashFiles([folderId]);

      // 8. Delete permanently
      console.log('❌ Deleting folder permanently...');
      await client.drive.deleteFilesPermanent([folderId]);
      console.log('Cleanup complete!');
    }

  } catch (error: any) {
    console.error('❌ Operation failed:', error.message);
  }
}

main();
