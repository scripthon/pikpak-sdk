// pikpak-sdk/examples/03_upload_file.ts
import { PikPak } from '../src/index';
import fs from 'fs';
import path from 'path';

/**
 * Example 3: Uploading files from local path, buffer, or memory
 */
async function main() {
  const client = PikPak.fromEnv();

  try {
    if (!client.isAuthenticated) {
      await client.login();
    }

    // 1. Upload from an in-memory Buffer / Uint8Array
    console.log('📤 Uploading from in-memory Buffer...');
    const textBuffer = Buffer.from('Hello from PikPak SDK! This file was uploaded from memory.\n');
    const bufferUploadRes = await client.drive.uploadFile(textBuffer, {
      fileName: 'memory_upload_example.txt',
      mimeType: 'text/plain',
    });
    console.log('✅ Buffer uploaded successfully:', bufferUploadRes.id || bufferUploadRes.name);

    // 2. Upload from a local file path
    const localFilePath = path.join(import.meta.dir, 'sample_temp_file.txt');
    await fs.promises.writeFile(localFilePath, 'Sample content for file path upload testing.\n');

    console.log('📤 Uploading from local file path...');
    const fileUploadRes = await client.drive.uploadFile(localFilePath);
    console.log('✅ File uploaded successfully. File ID:', fileUploadRes.id || fileUploadRes.name);

    // 3. Resolve direct download link for the newly uploaded file
    const fileId = fileUploadRes.id;
    if (fileId) {
      const downloadUrl = await client.drive.getDownloadUrl(fileId);
      console.log('🔗 Direct Download URL:', downloadUrl);

      // Clean up remote file
      await client.drive.deleteFilesPermanent([fileId]);
    }

    // Clean up local file
    if (fs.existsSync(localFilePath)) {
      await fs.promises.unlink(localFilePath);
    }

  } catch (error: any) {
    console.error('❌ Upload failed:', error.message);
  }
}

main();
