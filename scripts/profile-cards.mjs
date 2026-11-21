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
      <stop stop-color="#172b40"/>
      <stop offset=".45" stop-color="#0d151e"/>
      <stop offset="1" stop-color="#17303a"/>
    </linearGradient>
    <radialGradient id="card-glow">
      <stop stop-color="#245345" stop-opacity=".6"/>
      <stop offset="1" stop-color="#14362f" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="violet-glow">
      <stop stop-color="#7351a1" stop-opacity=".34"/>
      <stop offset="1" stop-color="#7351a1" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="blue-glow">
      <stop stop-color="#366794" stop-opacity=".4"/>
      <stop offset="1" stop-color="#366794" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect x="1" y="1" width="878" height="${height - 2}" rx="20" fill="url(#card-rim)" stroke="#30495f"/>
  <ellipse cx="115" cy="26" rx="110" ry="25" fill="url(#blue-glow)"/>
  <ellipse cx="543" cy="${height - 17}" rx="226" ry="16" fill="url(#violet-glow)"/>
  <rect x="23" y="19" width="834" height="${height - 38}" rx="15" fill="#0b1119" fill-opacity=".88" stroke="#273e51"/>
  <ellipse cx="700" cy="46" rx="148" ry="28" fill="url(#card-glow)"/>
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
  return `<rect x="${x}" y="61" width="260" height="72" rx="12" fill="#0b131c" fill-opacity=".94" stroke="#30485c"/>
  <rect x="${x + 1}" y="76" width="3" height="42" rx="1" fill="${accent}"/>
  <text x="${x + 17}" y="89" fill="#eef5fc" font-size="16" font-weight="700">${label}</text>
  <text x="${x + 17}" y="111" fill="#b1c0ce" font-size="13">${value}</text>`;
}).join('\n');

const root = /<svg\b[^>]*>/;
const viewBox = snake.match(/<svg\b[^>]*\bviewBox="([^"]+)"/)?.[1];
if (!viewBox) throw new Error('The generated snake SVG is missing its viewBox.');
const animation = snake.trim().replace(root, `<svg x="40" y="66" width="800" height="143" viewBox="${viewBox}">`);

await Promise.all([
  writeFile('dist/profile-highlights.svg', card('GitHub highlights', 162, `
    <text x="39" y="47" fill="#a6bbcc" font-size="12" font-weight="700">Highlights</text>
    ${cells}`)),
  writeFile('dist/profile-snake.svg', card('Contribution snake', 239, `
    <text x="40" y="45" fill="#a6bbcc" font-size="12" font-weight="700">Contribution activity</text>
    <text x="40" y="67" fill="#eef5fc" font-size="20" font-weight="750">Snake trail</text>
    ${animation}`)),
]);
