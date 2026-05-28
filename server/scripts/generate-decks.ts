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
    pageViews: number;
}

interface GameDeck {
    id: string;
    startingCard: RawCard;
    cards: RawCard[];
}

const rawPath = join(import.meta.dir, '../data/cards-raw.json');
const raw = JSON.parse(readFileSync(rawPath, 'utf-8')) as RawCard[];

// Filter cards that have all required fields
const cards = raw.filter(c =>
    c.qid && c.title && c.image && typeof c.year === 'number' && c.fact && c.wikipediaSlug
);
console.log(`${cards.length} valid cards after filtering`);

// Difficulty tiers by pageViews
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
    const shuffled = shuffle(available);
    const picked = shuffled.slice(0, n);
    picked.forEach(x => used.add(keyFn(x)));
    return picked;
}

const usedQids = new Set<string>();
const decks: GameDeck[] = [];
const NUM_DECKS = 10;

for (let i = 0; i < NUM_DECKS; i++) {
    // Pick 10 hard + 10 medium + 11 easy = 31 total
    // Starting card taken from easy tier (highest pageViews) → 30 playable remain
    const hardCards   = pickN(hard,   10, usedQids, c => c.qid);
    const mediumCards = pickN(medium, 10, usedQids, c => c.qid);
    const easyCards   = pickN(easy,   11, usedQids, c => c.qid);

    // Starting card: highest pageViews from the easy cards
    const easySorted = [...easyCards].sort((a, b) => b.pageViews - a.pageViews);
    const startingCard = easySorted[0];

    const playCards = shuffle([...hardCards, ...mediumCards, ...easyCards.filter(c => c.qid !== startingCard.qid)]);

    decks.push({
        id: `deck-${String(i + 1).padStart(2, '0')}`,
        startingCard,
        cards: playCards,
    });
}

const outDir = join(import.meta.dir, '../data/decks');
for (const deck of decks) {
    const path = join(outDir, `${deck.id}.json`);
    writeFileSync(path, JSON.stringify(deck, null, 2));
    console.log(`Wrote ${deck.id} (starting: "${deck.startingCard.title}" ${deck.startingCard.year}, ${deck.cards.length} cards)`);
}

console.log(`\nDone — ${decks.length} decks generated.`);
