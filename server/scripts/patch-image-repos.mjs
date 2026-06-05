/**
 * Node.js version of the image URL patcher — run directly on the host:
 *   node server/scripts/patch-image-repos.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import https from 'https';

const __dirname = dirname(fileURLToPath(import.meta.url));
const THUMB_WIDTH = 250;
const BATCH = 50;
const DELAY_MS = 500; // be polite to the API between batches

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function httpsGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'wikitrivia-royale/1.0 (image url patcher)' } }, res => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function buildThumbUrl(fullUrl) {
    const url = new URL(fullUrl);
    const parts = url.pathname.split('/');
    const filename = parts[parts.length - 1];
    const needsPng = /\.(svg|tif|tiff)$/i.test(filename);
    parts.splice(3, 0, 'thumb');
    parts.push(`${THUMB_WIDTH}px-${filename}${needsPng ? '.png' : ''}`);
    url.pathname = parts.join('/');
    return url.toString();
}

function wikimediaHash(filename) {
    const md5 = createHash('md5').update(filename).digest('hex');
    return `${md5[0]}/${md5.slice(0, 2)}`;
}

async function resolveImageUrls(filenames) {
    const result = new Map();
    for (let i = 0; i < filenames.length; i += BATCH) {
        const batch = filenames.slice(i, i + BATCH);
        const titles = batch.map(f => `File:${encodeURIComponent(f)}`).join('|');
        const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${titles}&prop=imageinfo&iiprop=url&format=json&redirects=1`;
        try {
            const raw = await httpsGet(url);
            const json = JSON.parse(raw);
            for (const page of Object.values(json.query.pages)) {
                const filename = page.title.replace(/^File:/, '').replace(/ /g, '_');
                const fullUrl = page.imageinfo?.[0]?.url;
                if (fullUrl) result.set(filename, buildThumbUrl(fullUrl));
            }
        } catch (e) {
            console.warn(`  Batch ${i} failed:`, e.message);
        }
        process.stdout.write(`\r  Resolved ${result.size} / ${Math.min(i + BATCH, filenames.length)} checked…`);
        if (i + BATCH < filenames.length) await sleep(DELAY_MS);
    }
    console.log();
    return result;
}

const decksDir = join(__dirname, '../data/decks');
const files = readdirSync(decksDir).filter(f => f.endsWith('.json'));

const allImages = new Set();
const allDecks = [];

for (const file of files) {
    const deck = JSON.parse(readFileSync(join(decksDir, file), 'utf-8'));
    allDecks.push({ file, deck });
    for (const c of [deck.startingCard, ...deck.cards]) {
        if (c.image) allImages.add(c.image);
    }
}

console.log(`${allDecks.length} decks, ${allImages.size} unique images. Querying Wikipedia API…`);
const urlMap = await resolveImageUrls([...allImages]);
console.log(`Resolved ${urlMap.size} / ${allImages.size} image URLs.`);

for (const { file, deck } of allDecks) {
    const patchCard = c => {
        const patched = { ...c };
        const url = urlMap.get(c.image);
        if (url) {
            patched.imageUrl = url;
            delete patched.imageHash;
            delete patched.imageRepo;
        } else {
            // Keep imageHash as fallback; ensure it exists
            if (!patched.imageHash) patched.imageHash = wikimediaHash(c.image);
            console.warn(`  No URL for: ${c.image} (keeping imageHash fallback)`);
        }
        return patched;
    };
    deck.startingCard = patchCard(deck.startingCard);
    deck.cards = deck.cards.map(patchCard);
    writeFileSync(join(decksDir, file), JSON.stringify(deck, null, 2));
    console.log(`  Patched ${file}`);
}

console.log('\nDone. Rebuild Docker: docker compose build && docker compose up -d');
