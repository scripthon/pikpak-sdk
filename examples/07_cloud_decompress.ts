// pikpak-sdk/examples/07_cloud_decompress.ts
import { PikPak } from '../src/index';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function runTest() {
  const client = PikPak.fromEnv();

  try {
    // 1. Auth check
    if (!client.isAuthenticated) {
      console.log("🔑 Logging in...");
      await client.login();
    }

    // 2. Create dummy zip for upload test
    const fileName = "auto_test.zip";
    const filePath = path.resolve(process.cwd(), fileName);
    console.log(`📦 Creating ${fileName}...`);
    execSync(`zip ${fileName} README.md`);

    // 3. Upload using client.drive
    console.log("📤 Uploading zip to PikPak...");
    const uploadRes = await client.drive.uploadFile(filePath);
    const fileId = uploadRes.id;
    const gcid = uploadRes.hash;

    console.log(`✅ Upload complete. ID: ${fileId}, GCID: ${gcid}`);

    // 4. Request cloud decompression
    console.log("🪄 Requesting cloud decompression...");
    const decompressRes = await client.drive.decompress(fileId, gcid, fileName);

    console.log("\n🚀 DECOMPRESS RESULT:");
    console.log(JSON.stringify(decompressRes, null, 2));

    if (decompressRes.url) {
      console.log("\n✅ SUCCESS: Cloud decompression URL obtained.");
    }

    // Cleanup local test zip
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error: any) {
    console.error("\n❌ Test failed:", error.message);
  }
}

runTest();
