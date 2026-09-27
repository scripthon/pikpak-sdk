// pikpak-sdk/examples/04_offline_download.ts
import { PikPak } from '../src/index';

/**
 * Example 4: Adding and monitoring offline cloud download tasks (Magnet / HTTP URL)
 */
async function main() {
  const client = PikPak.fromEnv();

  try {
    if (!client.isAuthenticated) {
      await client.login();
    }

    // 1. Create a cloud download task from a Magnet link or direct file URL
    const testMagnetUrl = 'magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny';
    console.log('⚡ Adding cloud download task...');
    const taskRes = await client.drive.createTask(testMagnetUrl);
    console.log('Task response:', JSON.stringify(taskRes.task || taskRes, null, 2));

    const taskId = taskRes.task?.id;

    // 2. List current offline download tasks
    console.log('\n📋 Fetching offline download tasks list:');
    const taskList = await client.drive.listTasks();
    for (const t of taskList.tasks) {
      console.log(`- [${t.phase}] ${t.file_name || t.name} (${t.progress}% done) ID: ${t.id}`);
    }

    // 3. Check specific task status if taskId exists
    if (taskId) {
      const taskDetail = await client.drive.getTask(taskId);
      console.log(`\n🔍 Task status for ${taskId}: phase=${taskDetail.phase}, progress=${taskDetail.progress}%`);
    }

  } catch (error: any) {
    console.error('❌ Task operation failed:', error.message);
  }
}

main();
