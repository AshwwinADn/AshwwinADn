import { mkdir, writeFile } from 'node:fs/promises';

const owner = process.env.PROFILE_OWNER;
if (!owner) throw new Error('Set PROFILE_OWNER to your GitHub username.');

const headers = { Accept: 'application/vnd.github+json' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const response = await fetch(`https://api.github.com/users/${encodeURIComponent(owner)}/repos?type=owner&sort=pushed&per_page=30`, { headers, signal: AbortSignal.timeout(15000) });
if (!response.ok) throw new Error(`GitHub repository lookup failed: ${response.status}`);

const repositories = (await response.json())
  .filter(repo => repo.visibility === 'public' && !repo.fork && !repo.archived)
  .slice(0, 3);

const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
const escape = value => value.replace(/[&<>"']/g, character => entities[character]);
const rows = repositories.map(repo => {
  const name = repo.name.toLowerCase() === owner.toLowerCase() ? 'Profile repository' : repo.name;
  const label = name.length > 34 ? `${name.slice(0, 33)}…` : name;
  return { label, date: repo.pushed_at?.slice(0, 10) ?? '' };
});
if (!rows.length) rows.push({ label: 'No public project updates yet', date: '' });

await mkdir('dist', { recursive: true });
for (const [file, colors] of [
  ['latest.svg', { ink: '#23383f', muted: '#52666f', rule: '#ccd6db' }],
  ['latest-dark.svg', { ink: '#e7efef', muted: '#aebdc3', rule: '#425660' }],
]) {
  const height = rows.length * 36;
  const svgRows = rows.map(({ label, date }, index) => {
    const y = index * 36;
    return `<path d="M0 ${y + 35}H560"/><text x="0" y="${y + 23}">${escape(label)}</text><text class="date" x="560" y="${y + 23}" text-anchor="end">${escape(date)}</text>`;
  }).join('\n');
  await writeFile(`dist/${file}`, `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="${height}" viewBox="0 0 560 ${height}">
  <title>Recently pushed public projects</title>
  <desc>${escape(rows.map(({ label, date }) => [label, date].filter(Boolean).join(', ')).join('; '))}</desc>
  <style>
    :root { --ink: ${colors.ink}; --muted: ${colors.muted}; --rule: ${colors.rule}; --type: system-ui, sans-serif; }
    text { fill: var(--ink); font: 17px var(--type); }
    .date { fill: var(--muted); font-size: 14px; }
    path { stroke: var(--rule); }
  </style>
  ${svgRows}
</svg>\n`);
}
