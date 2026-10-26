// Renders public/og-image.png (1200x630), the social preview used by Open Graph and X cards.
// Run: node scripts/generate-og-image.mjs
import sharp from 'sharp';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#17121f"/>
      <stop offset="1" stop-color="#241a36"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="80" y="96" width="12" height="150" rx="6" fill="#b69cff"/>
  <text x="124" y="170" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="88" font-weight="700" fill="#f4f1fa">Kaggle Bible</text>
  <text x="124" y="236" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="40" fill="#cfc7de">Learn from what Kaggle competitors actually tried.</text>
  <g font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="28" fill="#f4f1fa">
    <rect x="124" y="320" width="350" height="64" rx="32" fill="#2f2545" stroke="#b69cff" stroke-opacity="0.5"/>
    <text x="299" y="361" text-anchor="middle">Evidence-backed guides</text>
    <rect x="494" y="320" width="250" height="64" rx="32" fill="#2f2545" stroke="#b69cff" stroke-opacity="0.5"/>
    <text x="619" y="361" text-anchor="middle">Best practices</text>
    <rect x="764" y="320" width="380" height="64" rx="32" fill="#2f2545" stroke="#b69cff" stroke-opacity="0.5"/>
    <text x="954" y="361" text-anchor="middle">Runs on real Kaggle data</text>
  </g>
  <text x="124" y="470" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="30" fill="#a99fbb">Validation · features · models · compute · what transfers</text>
  <text x="124" y="550" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="30" font-weight="700" fill="#b69cff">kaggle-bible.vercel.app</text>
</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile('public/og-image.png');
console.log('Wrote public/og-image.png');
