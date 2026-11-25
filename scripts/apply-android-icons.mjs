import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ICON_SOURCE = 'assets/icon.png';
const NOTIF_LOGO_SOURCE = 'src/assets/images/logo_gkd_mobility_clean.png';
const ANDROID_RES_DIR = 'android/app/src/main/res';

const sizes = [
  { name: 'mipmap-mdpi', size: 48 },
  { name: 'mipmap-hdpi', size: 72 },
  { name: 'mipmap-xhdpi', size: 96 },
  { name: 'mipmap-xxhdpi', size: 144 },
  { name: 'mipmap-xxxhdpi', size: 192 },
];

const notifSizes = [
  { name: 'drawable-mdpi', size: 24 },
  { name: 'drawable-hdpi', size: 36 },
  { name: 'drawable-xhdpi', size: 48 },
  { name: 'drawable-xxhdpi', size: 72 },
  { name: 'drawable-xxxhdpi', size: 96 },
  { name: 'drawable', size: 96 },
];

async function generateIcons() {
  if (!fs.existsSync(ANDROID_RES_DIR)) {
    console.log(`Android res directory not found at ${ANDROID_RES_DIR}, skipping.`);
    return;
  }

  if (fs.existsSync(ICON_SOURCE)) {
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
  } else {
    console.log(`Source icon not found at ${ICON_SOURCE}, skipping launcher icon generation.`);
  }

  // Generate Android notification smallIcon (white silhouette on transparent background) from app logo
  const notifSource = fs.existsSync(NOTIF_LOGO_SOURCE) ? NOTIF_LOGO_SOURCE : ICON_SOURCE;
  if (fs.existsSync(notifSource)) {
    const { data, info } = await sharp(notifSource)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const out = Buffer.alloc(data.length);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      let newAlpha = 0;
      if (a > 0 && lum < 220) {
        newAlpha = Math.min(255, Math.round(((220 - lum) / 140) * 255));
      }
      out[i] = 255;
      out[i + 1] = 255;
      out[i + 2] = 255;
      out[i + 3] = newAlpha;
    }

    const baseSilhouette = sharp(out, {
      raw: { width: info.width, height: info.height, channels: 4 }
    });

    for (const { name, size } of notifSizes) {
      const targetDir = path.join(ANDROID_RES_DIR, name);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const pad = Math.max(2, Math.round(size * 0.08));
      const inner = size - pad * 2;
      const resizedBuf = await baseSilhouette
        .clone()
        .resize(inner, inner, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toBuffer();

      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      })
        .composite([{ input: resizedBuf, gravity: 'center' }])
        .png()
        .toFile(path.join(targetDir, 'ic_stat_icon_config_sample.png'));

      console.log(`Generated notification smallIcon for ${name} (${size}x${size})`);
    }
  }
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
