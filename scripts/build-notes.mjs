#!/usr/bin/env node
// Converts notes/*.md (frontmatter + markdown) into src/content/notes.json for the Notes app.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const notesDir = path.join(root, 'notes');
const outFile = path.join(root, 'src', 'content', 'notes.json');

const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const inline = (text) => escapeHtml(text)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
  .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

// A small markdown subset: headings, paragraphs, lists, quotes and fenced code.
const markdownToHtml = (markdown) => {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let paragraph = [];
  let list = null;

  const flushParagraph = () => {
    if (paragraph.length) html.push(`<p>${inline(paragraph.join(' '))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list) html.push(`<${list.tag}>${list.items.map((item) => `<li>${inline(item)}</li>`).join('')}</${list.tag}>`);
    list = null;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.startsWith('```')) {
      flushParagraph();
      flushList();
      const code = [];
      for (i += 1; i < lines.length && !lines[i].startsWith('```'); i += 1) code.push(lines[i]);
      html.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+\.\s+(.*)$/);
    const quote = line.match(/^>\s?(.*)$/);
    if (!line.trim()) {
      flushParagraph();
      flushList();
    } else if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length + 3;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
    } else if (bullet || numbered) {
      flushParagraph();
      const tag = bullet ? 'ul' : 'ol';
      if (list?.tag !== tag) {
        flushList();
        list = { tag, items: [] };
      }
      list.items.push((bullet || numbered)[1]);
    } else if (quote) {
      flushParagraph();
      flushList();
      html.push(`<blockquote>${inline(quote[1])}</blockquote>`);
    } else {
      flushList();
      paragraph.push(line.trim());
    }
  }
  flushParagraph();
  flushList();
  return html.join('\n');
};

const parseNote = (file, source) => {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const meta = {};
  (match ? match[1] : '').split('\n').forEach((line) => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) meta[key.trim()] = rest.join(':').replace(/\s+#.*$/, '').trim();
  });
  const body = (match ? match[2] : source).trim();
  const firstParagraph = body.split(/\n\s*\n/).find((block) => !block.startsWith('#') && !block.startsWith('```')) ?? '';
  return {
    id: path.basename(file, '.md'),
    title: meta.title || path.basename(file, '.md'),
    date: meta.date || null,
    pinned: meta.pinned === 'true',
    preview: firstParagraph.replace(/[*`>#[\]]|\((https?:[^)]+)\)/g, '').replace(/\s+/g, ' ').trim(),
    html: markdownToHtml(body),
  };
};

const files = (await readdir(notesDir)).filter((file) => file.endsWith('.md') && file.toLowerCase() !== 'readme.md');
const notes = await Promise.all(files.map(async (file) => parseNote(file, await readFile(path.join(notesDir, file), 'utf8'))));
notes.sort((a, b) => (b.pinned - a.pinned) || (b.date ?? '').localeCompare(a.date ?? ''));

await writeFile(outFile, `${JSON.stringify(notes, null, 2)}\n`);
console.log(`Built ${notes.length} notes -> ${path.relative(root, outFile)}`);
