# pikpak-sdk

An unofficial, production-grade TypeScript & JavaScript SDK for the **PikPak Drive API** with zero external runtime dependencies.

> **Disclaimer**: This is an **unofficial** SDK reverse-engineered from public client endpoints. It is not affiliated with, sponsored by, or endorsed by PikPak. Use at your own discretion.

## Features

- **Unified Client Architecture**: Access all PikPak services via `client.drive`, `client.auth`, `client.share`, `client.vip`, and `client.config`.
- **Headless Captcha & Auth**: Automated sign-in with 15-round salted MD5 captcha bypass and transparent retry on error code 9.
- **Concurrent-Safe Token Refresh**: Automatic token renewal with single-flight mutex locks on HTTP 401.
- **Flexible Uploads**: Upload from local file paths, `Buffer`, `Uint8Array`, `Blob`, or `File` with automatic GCID hash instant matching.
- **Share Streaming & Restore**: Parse public share links, resolve direct video stream URLs without saving, and restore folder hierarchies.
- **Zero Runtime Dependencies**: Pure standard Web APIs (`fetch`, `crypto`, `FormData`, `Blob`).

## Installation

```bash
bun add git+https://github.com/scripthon/pikpak-sdk.git
# or via SSH
bun add git+ssh://git@github.com/scripthon/pikpak-sdk.git
# or via npm
npm install git+https://github.com/scripthon/pikpak-sdk.git
```

## Quick Start

```typescript
import { PikPak } from 'pikpak-sdk';

// 1. Initialize client (reads PIKPAK_USERNAME, PIKPAK_PASSWORD, PIKPAK_ACCESS_TOKEN, etc.)
const client = PikPak.fromEnv();

// Or pass options explicitly:
// const client = new PikPak({ username: 'user@example.com', password: 'secretpassword' });

// Authenticate if access token is not already present
if (!client.isAuthenticated) {
  await client.login();
}

// 2. Get user profile
const profile = await client.auth.me();
console.log(`Logged in as: ${profile.name} (${profile.email})`);

// 3. List files in root directory
const fileList = await client.drive.listFiles({ limit: 20 });
console.log(`Found ${fileList.files.length} items:`);
for (const file of fileList.files) {
  console.log(`- [${file.kind.includes('folder') ? 'DIR' : 'FILE'}] ${file.name}`);
}
```

## Client Sub-Services

The client organizes API endpoints into dedicated sub-services:

| Service | Property | Key Methods |
|---|---|---|
| **Drive** | `client.drive` | `listFiles`, `uploadFile`, `getDownloadUrl`, `createFolder`, `createTask`, `move`, `copy`, `renameFile`, `trashFiles`, `getQuota` |
| **Share** | `client.share` | `getShareInfo`, `listShareFiles`, `resolveContentUrl`, `resolveAncestorIds`, `restore` |
| **Auth** | `client.auth` | `login`, `logout`, `me`, `listDevices`, `revokeDevice`, `getSudoToken`, `refreshToken` |
| **VIP** | `client.vip` | `getVipInfo`, `redeemCode`, `getLbsInfo` |
| **Config** | `client.config` | `getGlobalConfig`, `checkVersion` |

## Examples

For more advanced use cases, explore the numbered examples in [`examples/`](./examples):

- [`01_authentication.ts`](./examples/01_authentication.ts): Username/password sign-in, token auto-refresh callbacks, and device management.
- [`02_drive_operations.ts`](./examples/02_drive_operations.ts): Creating folders, renaming, starring, trash & restore, and quota checks.
- [`03_upload_file.ts`](./examples/03_upload_file.ts): Local file and in-memory `Buffer`/`Uint8Array` uploads with instant GCID hash match.
- [`04_offline_download.ts`](./examples/04_offline_download.ts): Adding Magnet/URL cloud download tasks and tracking progress.
- [`05_share_and_stream.ts`](./examples/05_share_and_stream.ts): Browsing public share folders, resolving direct video stream URLs, and saving shared items into your account.
- [`06_m3u8_playlist.ts`](./examples/06_m3u8_playlist.ts): Generating M3U8 video playlists from cloud folders for VLC or PotPlayer.
- [`07_cloud_decompress.ts`](./examples/07_cloud_decompress.ts): Uploading archives and triggering server-side cloud decompression.

Run any example directly with Bun:
```bash
bun examples/01_authentication.ts
```

## Testing & Typecheck

```bash
bun test
bun run typecheck
```

## Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Ensure all tests and type checks pass:
   ```bash
   bun test
   bun run typecheck
   ```
4. Commit your changes (`git commit -m 'feat: add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

MIT
