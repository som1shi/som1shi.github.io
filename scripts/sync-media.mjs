#!/usr/bin/env node
// Pulls the latest books (Goodreads) and films (Letterboxd) from their public RSS feeds,
// saves covers and posters under public/media, and writes src/content/mediaLibrary.json.
// Run with `npm run sync-media`; it also runs before every deploy.
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const GOODREADS_USER_ID = '85950823';
const LETTERBOXD_USER = 'sarvagyas';
const BOOKS_PER_GROUP = 2;
const LOVED_COUNT = 4;
const RECENT_COUNT = 4;

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const mediaDir = path.join(root, 'public', 'media');
const outFile = path.join(root, 'src', 'content', 'mediaLibrary.json');
const favoritesFile = path.join(root, 'scripts', 'letterboxd-favorites.json');
const headers = { 'User-Agent': 'Mozilla/5.0 (som1shi.github.io media sync)' };

const decode = (text = '') => text
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&#x27;/g, "'")
  .trim();

const field = (xml, tag) => {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return match ? decode(match[1]) : '';
};

const items = (xml) => [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => match[1]);

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

const fetchText = async (url) => {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
  return res.text();
};

const download = async (url, folder, name) => {
  if (!url) return null;
  const res = await fetch(url, { headers });
  if (!res.ok) return null;
  const file = `${name}.jpg`;
  await mkdir(path.join(mediaDir, folder), { recursive: true });
  await writeFile(path.join(mediaDir, folder, file), Buffer.from(await res.arrayBuffer()));
  return `/media/${folder}/${file}`;
};

const toDate = (value) => (value ? new Date(value).toISOString().slice(0, 10) : null);

const syncBooks = async () => {
  const shelf = async (name) => items(await fetchText(`https://www.goodreads.com/review/list_rss/${GOODREADS_USER_ID}?shelf=${name}`))
    .map((xml) => ({
      title: field(xml, 'title').replace(/\s*\([^)]*#\d+[^)]*\)\s*$/, ''),
      creator: field(xml, 'author_name').replace(/\s+/g, ' '),
      status: name === 'currently-reading' ? 'Reading' : 'Read',
      rating: Number(field(xml, 'user_rating')) || null,
      review: field(xml, 'user_review') || null,
      readAt: toDate(field(xml, 'user_read_at')),
      addedAt: toDate(field(xml, 'user_date_added')),
      published: field(xml, 'book_published') || null,
      pages: Number(field(xml, 'num_pages')) || null,
      url: `https://www.goodreads.com/book/show/${field(xml, 'book_id')}`,
      coverUrl: field(xml, 'book_large_image_url'),
    }));

  // three pairs for the stack: currently reading, recently read, favourites (no repeats)
  const byRecent = (key) => (a, b) => (b[key] ?? b.addedAt ?? '').localeCompare(a[key] ?? a.addedAt ?? '');
  const reading = (await shelf('currently-reading')).sort(byRecent('addedAt')).slice(0, BOOKS_PER_GROUP);
  const read = (await shelf('read')).sort(byRecent('readAt')).slice(0, BOOKS_PER_GROUP);
  const shown = new Set([...reading, ...read].map((book) => book.url));
  // Goodreads has no public favourites feed: use titles from scripts/goodreads-favorites.json if
  // listed there, otherwise the most recently read 5-star books.
  const allRead = (await shelf('read')).sort(byRecent('readAt'));
  const pinned = JSON.parse(await readFile(path.join(root, 'scripts', 'goodreads-favorites.json'), 'utf8').catch(() => '[]'))
    .map((title) => title.toLowerCase());
  const favorites = (pinned.length
    ? pinned.map((title) => allRead.find((book) => book.title.toLowerCase().startsWith(title))).filter(Boolean)
    : allRead.filter((book) => book.rating === 5))
    .filter((book) => !shown.has(book.url))
    .slice(0, BOOKS_PER_GROUP);
  const picked = [
    ...reading.map((book) => ({ ...book, group: 'reading' })),
    ...read.map((book) => ({ ...book, group: 'read' })),
    ...favorites.map((book) => ({ ...book, group: 'favorites', status: 'Read' })),
  ];

  return Promise.all(picked.map(async ({ coverUrl, ...book }) => ({
    ...book,
    cover: await download(coverUrl, 'books', slugify(book.title)),
  })));
};

// Letterboxd profile favourites sit behind a bot check, so the four pinned films live in
// scripts/letterboxd-favorites.json; their posters come from Wikipedia's page summary API.
const wikipediaPoster = async (page) => {
  if (!page) return null;
  const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page)}`, { headers });
  if (!res.ok) return null;
  const data = await res.json();
  return data.originalimage?.source ?? data.thumbnail?.source ?? null;
};

const filmKey = (film) => `${film.title.toLowerCase()}|${film.year}`;

const syncFilms = async () => {
  const favorites = JSON.parse(await readFile(favoritesFile, 'utf8').catch(() => '[]'));
  const diary = items(await fetchText(`https://letterboxd.com/${LETTERBOXD_USER}/rss/`))
    .filter((xml) => xml.includes('<letterboxd:filmTitle>'))
    .map((xml) => ({
      title: field(xml, 'letterboxd:filmTitle'),
      year: Number(field(xml, 'letterboxd:filmYear')) || null,
      rating: Number(field(xml, 'letterboxd:memberRating')) || null,
      liked: field(xml, 'letterboxd:memberLike') === 'Yes',
      rewatch: field(xml, 'letterboxd:rewatch') === 'Yes',
      watchedAt: field(xml, 'letterboxd:watchedDate') || null,
      url: field(xml, 'link'),
      posterUrl: (field(xml, 'description').match(/<img src="([^"]+)"/) || [])[1] ?? null,
    }));

  // newest diary entry per film
  const seen = new Set();
  const latest = diary.filter((film) => !seen.has(filmKey(film)) && seen.add(filmKey(film)));
  const byKey = new Map(latest.map((film) => [filmKey(film), film]));

  const holyGrail = await Promise.all(favorites.map(async (fav) => {
    const logged = byKey.get(filmKey(fav));
    return { ...logged, ...fav, posterUrl: logged?.posterUrl ?? await wikipediaPoster(fav.wikipedia) };
  }));
  const taken = new Set(holyGrail.map(filmKey));
  const loved = latest.filter((film) => film.liked && !taken.has(filmKey(film))).slice(0, LOVED_COUNT);
  loved.forEach((film) => taken.add(filmKey(film)));
  const recent = latest.filter((film) => !taken.has(filmKey(film))).slice(0, RECENT_COUNT);

  const withPoster = (list) => Promise.all(list.map(async ({ posterUrl, wikipedia, ...film }) => ({
    ...film,
    poster: await download(posterUrl, 'films', slugify(`${film.title}-${film.year}`)),
  })));

  return { holyGrail: await withPoster(holyGrail), loved: await withPoster(loved), recent: await withPoster(recent) };
};

const [books, films] = await Promise.all([syncBooks(), syncFilms()]);
// drop covers and posters that are no longer shown
const inUse = new Set([...books, ...Object.values(films).flat()].map((item) => item.cover ?? item.poster).filter(Boolean));
await Promise.all(['books', 'films'].map(async (folder) => {
  const files = await readdir(path.join(mediaDir, folder)).catch(() => []);
  await Promise.all(files
    .filter((file) => !inUse.has(`/media/${folder}/${file}`))
    .map((file) => rm(path.join(mediaDir, folder, file))));
}));

await writeFile(outFile, `${JSON.stringify({ syncedAt: new Date().toISOString(), books, films }, null, 2)}\n`);
console.log(`Synced ${books.length} books; films: ${films.holyGrail.length} holy grail, ${films.loved.length} loved, ${films.recent.length} recent -> ${path.relative(root, outFile)}`);
