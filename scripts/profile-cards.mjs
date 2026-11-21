import { readFile, writeFile } from 'node:fs/promises';

const owner = encodeURIComponent(process.env.PROFILE_OWNER);
const headers = { Accept: 'application/vnd.github+json' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function github(path) {
  const response = await fetch(`https://api.github.com/users/${owner}${path}`, {
    headers,
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`GitHub lookup failed (${response.status}): ${path}`);
  return response.json();
}

async function totalStars() {
  let stars = 0;
  for (let page = 1; ; page += 1) {
    const repositories = await github(`/repos?type=owner&per_page=100&page=${page}`);
    stars += repositories
      .filter(repo => !repo.private)
      .reduce((sum, repo) => sum + repo.stargazers_count, 0);
    if (repositories.length < 100) return stars;
  }
}

function card(title, height, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="880" height="${height}" viewBox="0 0 880 ${height}" role="img">
  <title>${title}</title>
  <defs>
    <linearGradient id="card-rim" x2="100%" y2="100%">
      <stop stop-color="#122235"/>
      <stop offset=".48" stop-color="#0d1219"/>
      <stop offset="1" stop-color="#22213a"/>
    </linearGradient>
    <radialGradient id="card-glow">
      <stop stop-color="#14362f" stop-opacity=".58"/>
      <stop offset="1" stop-color="#14362f" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect x="1" y="1" width="878" height="${height - 2}" rx="20" fill="url(#card-rim)" stroke="#29435b"/>
  <rect x="24" y="21" width="832" height="${height - 42}" rx="15" fill="#0d141c" stroke="#24394c"/>
  <ellipse cx="677" cy="42" rx="176" ry="39" fill="url(#card-glow)"/>
  <g font-family="system-ui, sans-serif">${content}</g>
</svg>\n`;
}

const [profile, stars, snake] = await Promise.all([
  github(''),
  totalStars(),
  readFile('dist/snake-dark.svg', 'utf8'),
]);
const rows = [
  ['Open Source', `${profile.public_repos} public repositories`, '#5a9bef'],
  ['Impact', `${stars} stars earned`, '#53ba92'],
  ['Community', `${profile.followers} followers`, '#a48ceb'],
];
const cells = rows.map(([label, value, accent], index) => {
  const x = 38 + index * 272;
  return `<rect x="${x}" y="54" width="260" height="73" rx="11" fill="#101922" stroke="#29435b"/>
  <rect x="${x}" y="67" width="3" height="45" rx="1" fill="${accent}"/>
  <text x="${x + 16}" y="83" fill="#f0f5fb" font-size="16" font-weight="650">${label}</text>
  <text x="${x + 16}" y="106" fill="#aebfce" font-size="13">${value}</text>`;
}).join('\n');

const root = /<svg\b[^>]*>/;
const viewBox = snake.match(/<svg\b[^>]*\bviewBox="([^"]+)"/)?.[1];
if (!viewBox) throw new Error('The generated snake SVG is missing its viewBox.');
const animation = snake.trim().replace(root, `<svg x="36" y="54" width="808" height="162" viewBox="${viewBox}">`);

await Promise.all([
  writeFile('dist/profile-highlights.svg', card('GitHub highlights', 153, `
    <text x="39" y="43" fill="#9ab2c8" font-size="12" font-weight="650">Highlights</text>
    ${cells}`)),
  writeFile('dist/profile-snake.svg', card('Contribution snake', 239, `
    <text x="39" y="52" fill="#f0f5fb" font-size="20" font-weight="700">Contribution snake</text>
    ${animation}`)),
]);
