import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface RawCard {
    qid: string;
    title: string;
    subtitle: string;
    year: number;
    fact: string;
    wikipediaSlug: string;
    image: string;
    imageUrl?: string;
    pageViews: number;
}

interface GameDeck {
    id: string;
    startingCard: RawCard;
    cards: RawCard[];
}

const THUMB_WIDTH = 250;
const BATCH = 50;

function buildThumbUrl(fullUrl: string): string {
    // fullUrl: https://upload.wikimedia.org/wikipedia/{repo}/{hash}/{filename}
    // thumb:   https://upload.wikimedia.org/wikipedia/{repo}/thumb/{hash}/{filename}/{width}px-{filename}[.png]
    const url = new URL(fullUrl);
    const parts = url.pathname.split('/');
    const filename = parts[parts.length - 1];
    const needsPng = /\.(svg|tif|tiff)$/i.test(filename);
    parts.splice(3, 0, 'thumb');
    parts.push(`${THUMB_WIDTH}px-${filename}${needsPng ? '.png' : ''}`);
    url.pathname = parts.join('/');
    return url.toString();
}

async function resolveImageUrls(filenames: string[]): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    for (let i = 0; i < filenames.length; i += BATCH) {
        const batch = filenames.slice(i, i + BATCH);
        // Encode each filename individually; keep | literal as the API batch separator
        const titles = batch.map(f => `File:${encodeURIComponent(f)}`).join('|');
        const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${titles}&prop=imageinfo&iiprop=url&format=json&redirects=1`;
        try {
            const res = await fetch(url, { headers: { 'User-Agent': 'wikitrivia-royale/1.0 (deck generator)' } });
            const json = await res.json() as {
                query: { pages: Record<string, { title: string; imageinfo?: Array<{ url: string }> }> };
            };
            for (const page of Object.values(json.query.pages)) {
                const filename = page.title.replace(/^File:/, '').replace(/ /g, '_');
                const fullUrl = page.imageinfo?.[0]?.url;
                if (fullUrl) result.set(filename, buildThumbUrl(fullUrl));
            }
        } catch (e) {
            console.warn(`  Warning: URL resolution failed for batch at ${i}:`, e);
        }
        if (i % 200 === 0 && i > 0) console.log(`  Resolved ${i}/${filenames.length} image URLs…`);
    }
    return result;
}

const rawPath = join(import.meta.dir, '../data/cards-raw.json');
const raw = JSON.parse(readFileSync(rawPath, 'utf-8')) as RawCard[];

const cards = raw.filter(c =>
    c.qid && c.title && c.image && typeof c.year === 'number' && c.fact && c.wikipediaSlug
);
console.log(`${cards.length} valid cards after filtering`);

console.log('Resolving image URLs via Wikipedia API…');
const imageFilenames = [...new Set(cards.map(c => c.image))];
const urlMap = await resolveImageUrls(imageFilenames);
console.log(`Resolved ${urlMap.size}/${imageFilenames.length} image URLs`);

const hard   = cards.filter(c => c.pageViews < 10_000);
const medium = cards.filter(c => c.pageViews >= 10_000 && c.pageViews < 100_000);
const easy   = cards.filter(c => c.pageViews >= 100_000);
console.log(`Tiers — hard: ${hard.length}, medium: ${medium.length}, easy: ${easy.length}`);

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function pickN<T>(pool: T[], n: number, used: Set<string>, keyFn: (x: T) => string): T[] {
    const available = pool.filter(x => !used.has(keyFn(x)));
    const picked = shuffle(available).slice(0, n);
    picked.forEach(x => used.add(keyFn(x)));
    return picked;
}

const withImageUrl = (c: RawCard): RawCard => ({
    ...c,
    imageUrl: urlMap.get(c.image),
});

const usedQids = new Set<string>();
const decks: GameDeck[] = [];
const NUM_DECKS = 10;

for (let i = 0; i < NUM_DECKS; i++) {
    const hardCards   = pickN(hard,   10, usedQids, c => c.qid);
    const mediumCards = pickN(medium, 10, usedQids, c => c.qid);
    const easyCards   = pickN(easy,   11, usedQids, c => c.qid);

    const easySorted = [...easyCards].sort((a, b) => b.pageViews - a.pageViews);
    const startingCard = easySorted[0];
    const playCards = shuffle([...hardCards, ...mediumCards, ...easyCards.filter(c => c.qid !== startingCard.qid)]);

    decks.push({
        id: `deck-${String(i + 1).padStart(2, '0')}`,
        startingCard: withImageUrl(startingCard),
        cards: playCards.map(withImageUrl),
    });
}

const outDir = join(import.meta.dir, '../data/decks');
for (const deck of decks) {
    const path = join(outDir, `${deck.id}.json`);
    writeFileSync(path, JSON.stringify(deck, null, 2));
    console.log(`Wrote ${deck.id} (starting: "${deck.startingCard.title}" ${deck.startingCard.year}, ${deck.cards.length} cards)`);
}

console.log(`\nDone — ${decks.length} decks generated.`);
