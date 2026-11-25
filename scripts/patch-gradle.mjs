import fs from 'fs';
import path from 'path';

const gradlePath = path.resolve('android/app/build.gradle');
if (!fs.existsSync(gradlePath)) {
  console.error('build.gradle not found at:', gradlePath);
  process.exit(1);
}

let content = fs.readFileSync(gradlePath, 'utf8');

// 1. Auto-increment versionCode and versionName based on GitHub run number or timestamp
const runNumber = process.env.GITHUB_RUN_NUMBER || String(Math.floor(Date.now() / 1000));
content = content.replace(/versionCode\s+\d+/, `versionCode ${runNumber}`);
content = content.replace(/versionName\s+"[^"]+"/, `versionName "1.0.${runNumber}"`);

// 2. Add Kotlin conflict exclusion if not present
if (!content.includes('exclude group: \'org.jetbrains.kotlin\'')) {
  content += `
configurations.all {
    exclude group: 'org.jetbrains.kotlin', module: 'kotlin-stdlib-jdk7'
    exclude group: 'org.jetbrains.kotlin', module: 'kotlin-stdlib-jdk8'
}
`;
}

// 3. Force debug signingConfig if not present
if (!content.includes('android.signingConfigs.debug.storeFile')) {
  content += `
android.signingConfigs.debug.storeFile = new File(System.getProperty("user.home") + "/.android/debug.keystore")
android.signingConfigs.debug.storePassword = "android"
android.signingConfigs.debug.keyAlias = "androiddebugkey"
android.signingConfigs.debug.keyPassword = "android"
android.buildTypes.debug.signingConfig = android.signingConfigs.debug
`;
}

fs.writeFileSync(gradlePath, content, 'utf8');
console.log('Successfully patched build.gradle via patch-gradle.mjs');

// 4. Patch Android styles.xml so system bars (clock & native buttons) are preserved with dark background
const stylesPath = path.resolve('android/app/src/main/res/values/styles.xml');
if (fs.existsSync(stylesPath)) {
  let stylesContent = fs.readFileSync(stylesPath, 'utf8');
  if (!stylesContent.includes('android:windowBackground')) {
    stylesContent = stylesContent.replace(
      /(<style\s+name="AppTheme\.NoActionBar"[^>]*>[\s\S]*?)(<\/style>)/,
      `$1    <item name="android:windowBackground">#0a0a0c</item>\n        <item name="android:statusBarColor">#0a0a0c</item>\n        <item name="android:navigationBarColor">#0a0a0c</item>\n        <item name="android:windowDrawsSystemBarBackgrounds">true</item>\n    $2`
    );
    fs.writeFileSync(stylesPath, stylesContent, 'utf8');
    console.log('Successfully patched values/styles.xml');
  }
}

// 5. Opt out of forced edge-to-edge on Android 15 (API 35)
const valuesV35Dir = path.resolve('android/app/src/main/res/values-v35');
fs.mkdirSync(valuesV35Dir, { recursive: true });
const stylesV35Path = path.join(valuesV35Dir, 'styles.xml');
const stylesV35Content = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme.NoActionBar" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
        <item name="android:background">@null</item>
        <item name="android:windowBackground">#0a0a0c</item>
        <item name="android:statusBarColor">#0a0a0c</item>
        <item name="android:navigationBarColor">#0a0a0c</item>
        <item name="android:windowOptOutEdgeToEdgeEnforcement">true</item>
    </style>
</resources>
`;
fs.writeFileSync(stylesV35Path, stylesV35Content, 'utf8');
console.log('Successfully created values-v35/styles.xml');

// 6. Ensure notification drawable icons exist and configure AndroidManifest.xml for FCM Push Notifications
const resDir = path.resolve('android/app/src/main/res');
const notifFallbackDir = path.resolve('assets/notif-icons');
if (fs.existsSync(resDir) && fs.existsSync(notifFallbackDir)) {
  for (const folder of fs.readdirSync(notifFallbackDir)) {
    const srcFile = path.join(notifFallbackDir, folder, 'ic_stat_icon_config_sample.png');
    if (fs.existsSync(srcFile)) {
      const destDir = path.join(resDir, folder);
      fs.mkdirSync(destDir, { recursive: true });
      const destFile = path.join(destDir, 'ic_stat_icon_config_sample.png');
      if (!fs.existsSync(destFile)) {
        fs.copyFileSync(srcFile, destFile);
      }
    }
  }
}

const manifestPath = path.resolve('android/app/src/main/AndroidManifest.xml');
const drawableIconPath = path.resolve('android/app/src/main/res/drawable/ic_stat_icon_config_sample.png');
if (fs.existsSync(manifestPath) && fs.existsSync(drawableIconPath)) {
  let manifestContent = fs.readFileSync(manifestPath, 'utf8');
  if (!manifestContent.includes('com.google.firebase.messaging.default_notification_icon')) {
    manifestContent = manifestContent.replace(
      /<\/application>/,
      `    <meta-data android:name="com.google.firebase.messaging.default_notification_icon" android:resource="@drawable/ic_stat_icon_config_sample" />\n    </application>`
    );
    fs.writeFileSync(manifestPath, manifestContent, 'utf8');
    console.log('Successfully patched AndroidManifest.xml with default_notification_icon');
  }
}
