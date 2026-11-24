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
