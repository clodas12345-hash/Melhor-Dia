const fs = require('fs');
const sharp = require('sharp');

const svgText = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="roadGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0066cc"/>
      <stop offset="100%" stop-color="#00aaff"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- Canvas Base -->
  <rect width="512" height="512" fill="#ffffff"/>
  
  <!-- Outer Card Frame (Matching uploaded image style) -->
  <rect x="32" y="32" width="448" height="448" rx="80" fill="#ffffff" filter="url(#shadow)" stroke="#f0f2f5" stroke-width="2"/>

  <g transform="translate(0, 15)">
    <!-- Main Logo: GKB -->
    <!-- G -->
    <path d="M 85 240 C 85 190 120 170 170 170 L 205 170 L 195 202 L 165 202 C 138 202 122 212 122 240 C 122 268 138 278 165 278 L 180 278 L 180 248 L 150 248 L 150 220 L 212 220 L 212 290 C 190 305 160 308 135 308 C 95 308 85 280 85 240 Z" fill="#091e42"/>

    <!-- K Left Stem -->
    <path d="M 210 170 L 248 170 L 222 308 L 184 308 Z" fill="#091e42"/>

    <!-- K Road Swoosh / Upper Arm -->
    <path d="M 205 308 C 235 255 260 215 330 170 L 290 170 C 235 210 210 250 180 308 Z" fill="url(#roadGrad)"/>
    
    <!-- White Road Marking Line -->
    <path d="M 212 288 C 235 248 260 215 300 182" stroke="#ffffff" stroke-width="4" stroke-dasharray="10 8" fill="none"/>

    <!-- K Lower Right Arm -->
    <path d="M 252 240 L 308 308 L 265 308 L 225 255 Z" fill="#091e42"/>

    <!-- B -->
    <path d="M 315 170 L 395 170 C 428 170 442 186 442 208 C 442 224 430 234 415 238 C 435 244 445 258 445 278 C 445 298 428 308 395 308 L 315 308 Z M 352 196 L 352 224 L 388 224 C 400 224 406 218 406 210 C 406 202 400 196 388 196 Z M 352 250 L 352 282 L 390 282 C 404 282 410 274 410 266 C 410 258 404 250 390 250 Z" fill="#091e42"/>

    <!-- MOBILITY Subtitle Section -->
    <line x1="75" y1="340" x2="115" y2="340" stroke="#0077ff" stroke-width="2.5" stroke-linecap="round"/>
    
    <text x="256" y="347" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="700" font-size="25" fill="#4a5568" letter-spacing="10" text-anchor="middle">MOBILITY</text>
    
    <line x1="397" y1="340" x2="437" y2="340" stroke="#0077ff" stroke-width="2.5" stroke-linecap="round"/>
  </g>
</svg>
`;

async function generate() {
  const buf512 = await sharp(Buffer.from(svgText))
    .resize(512, 512)
    .png()
    .toBuffer();

  const buf192 = await sharp(Buffer.from(svgText))
    .resize(192, 192)
    .png()
    .toBuffer();

  fs.writeFileSync('public/pwa-512x512.png', buf512);
  fs.writeFileSync('public/pwa-192x192.png', buf192);
  fs.writeFileSync('public/apple-touch-icon.png', buf192);

  console.log('Successfully generated 512x512 and 192x192 images!');
  console.log('512 png size:', buf512.length);
  console.log('192 png size:', buf192.length);
}

generate();
