// pikpak-sdk/examples/01_authentication.ts
import { PikPak } from '../src/index';

/**
 * Example 1: Authenticating with credentials or existing tokens
 */
async function main() {
  // Option A: Initialize automatically from environment variables
  // (reads PIKPAK_USERNAME, PIKPAK_PASSWORD, PIKPAK_ACCESS_TOKEN, etc.)
  const client = PikPak.fromEnv();

  // Option B: Initialize with manual options
  // const client = new PikPak({
  //   username: 'your_email@example.com',
  //   password: 'your_password',
  //   onTokenRefresh: (accessToken, refreshToken) => {
  //     console.log('🔄 Token refreshed automatically!');
  //     console.log('New Access Token:', accessToken.slice(0, 20) + '...');
  //   },
  // });

  try {
    // 1. Perform login if no access token is set
    if (!client.isAuthenticated) {
      console.log('🔐 Logging in with username and password...');
      const loginRes = await client.login();
      console.log('✅ Logged in successfully!');
      console.log('Token expires in:', loginRes.expires_in, 'seconds');
    }

    // 2. Fetch current user profile
    const profile = await client.auth.me();
    console.log('\n👤 User Profile:');
    console.log(`- User ID: ${profile.sub}`);
    console.log(`- Name: ${profile.name}`);
    console.log(`- Email: ${profile.email}`);

    // 3. List active authorized devices
    const devices = await client.auth.listDevices();
    console.log(`\n📱 Authorized Devices (${devices.length}):`);
    devices.forEach((dev) => {
      console.log(`- ${dev.device_name || 'Device'} (${dev.device_id}) ${dev.is_current ? '[Current]' : ''}`);
    });

  } catch (error: any) {
    console.error('❌ Authentication failed:', error.message);
  }
}

main();
