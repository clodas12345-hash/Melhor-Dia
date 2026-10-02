import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ICON_SOURCE = 'assets/icon.png';
const ANDROID_RES_DIR = 'android/app/src/main/res';

const sizes = [
  { name: 'mipmap-mdpi', size: 48 },
  { name: 'mipmap-hdpi', size: 72 },
  { name: 'mipmap-xhdpi', size: 96 },
  { name: 'mipmap-xxhdpi', size: 144 },
  { name: 'mipmap-xxxhdpi', size: 192 },
];

async function generateIcons() {
  if (!fs.existsSync(ICON_SOURCE)) {
    console.log(`Source icon not found at ${ICON_SOURCE}, skipping icon generation.`);
    return;
  }

  if (!fs.existsSync(ANDROID_RES_DIR)) {
    console.log(`Android res directory not found at ${ANDROID_RES_DIR}, skipping.`);
    return;
  }

  for (const { name, size } of sizes) {
    const targetDir = path.join(ANDROID_RES_DIR, name);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetPath = path.join(targetDir, 'ic_launcher.png');
    const targetPathRound = path.join(targetDir, 'ic_launcher_round.png');

    await sharp(ICON_SOURCE)
      .resize(size, size)
      .toFile(targetPath);

    // Round version
    const circleShape = Buffer.from(
      `<svg><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" /></svg>`
    );

    await sharp(ICON_SOURCE)
      .resize(size, size)
      .composite([{
        input: circleShape,
        blend: 'dest-in'
      }])
      .toFile(targetPathRound);

    console.log(`Generated icons for ${name} (${size}x${size})`);
  }
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
